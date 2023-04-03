#!/usr/bin/env node

"use strict";

const { run } = require("jscodeshift/src/Runner");
const glob = require("glob");
const path = require("path");
const fs = require("fs");
const transform = require.resolve("../dist/node-to-nodenext.js");

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error("Usage: `node-to-nodenext <path>`");
  process.exit(1);
}

(async () => {
  const [target] = args;
  const resolved = path.resolve(target);

  const stat = fs.lstatSync(resolved);
  if (stat.isFile()) {
    await transformFile(resolved);
  } else if (stat.isDirectory()) {
    await transformDirectory(resolved);
  }
})();

function transformFile(file) {
  return run(transform, [file], {
    extensions: ["ts", "tsx"].join(","),
    parser: "tsx",
  });
}

function transformDirectory(dir) {
  const paths = glob.sync(["**/*.ts", "**/*.tsx"], {
    cwd: dir,
    ignore: ["**/node_modules/**"],
    absolute: true,
  });

  return run(transform, paths, {
    extensions: ["ts", "tsx"].join(","),
    parser: "tsx",
  });
}
