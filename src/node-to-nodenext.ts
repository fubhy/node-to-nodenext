import { API, FileInfo } from "jscodeshift";
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
    .find(j.ImportDeclaration, (value) => {
      if (typeof value.source.value !== "string") {
        return false;
      }

      return (
        isRelativePath(value.source.value) &&
        hasNoJsExtension(value.source.value)
      );
    })
    .replaceWith((p) => {
      const source = p.node.source.value as string;
      const resolved = resolveModule(source as string, file);
      if (resolved !== null) {
        p.node.source.value = resolved;
      } else {
        console.log(`Skipping rewrite for ${source} in ${file.path}`);
      }

      return p.node;
    })
    .toSource();
}
