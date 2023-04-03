import {
  API,
  ExportAllDeclaration,
  ExportNamedDeclaration,
  FileInfo,
  ImportDeclaration,
} from "jscodeshift";
import { ResolverFactory, CachedInputFileSystem } from "enhanced-resolve";
import * as fs from "node:fs";
import * as path from "node:path";

const resolver = ResolverFactory.createResolver({
  fileSystem: new CachedInputFileSystem(fs, 4000),
  extensions: [".ts", ".tsx"],
  useSyncFileSystemCalls: true,
});

function isRelativePath(modulePath: string) {
  return modulePath.startsWith("./") || modulePath.startsWith("../");
}

function hasNoJsExtension(modulePath: string) {
  return !/\.js$/.test(modulePath);
}

function resolveModule(modulePath: string, file: FileInfo) {
  const dir = path.dirname(file.path);
  let output = resolver.resolveSync({}, dir, modulePath);
  if (output !== false) {
    output = path.relative(dir, output).replace(/\.tsx?$/, ".js");

    if (!output.startsWith(".")) {
      output = `./${output}`;
    }

    return output;
  }

  return null;
}

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.Declaration, (node) => {
      return (
        j.ImportDeclaration.check(node) ||
        j.ExportNamedDeclaration.check(node) ||
        j.ExportAllDeclaration.check(node)
      );
    })
    .filter((p) => {
      const node = p.node as
        | ImportDeclaration
        | ExportNamedDeclaration
        | ExportAllDeclaration;

      const source = node.source.value;
      if (typeof source === "string") {
        return isRelativePath(source) && hasNoJsExtension(source);
      } else {
        return false;
      }
    })
    .replaceWith((p) => {
      const node = p.node as
        | ImportDeclaration
        | ExportNamedDeclaration
        | ExportAllDeclaration;

      const source = node.source.value as string;
      const resolved = resolveModule(source as string, file);

      if (resolved !== null) {
        node.source.value = resolved;
      } else {
        console.log(`Skipping rewrite for ${source} in ${file.path}`);
      }

      return p.node;
    })
    .toSource();
}
