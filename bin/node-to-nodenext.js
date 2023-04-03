#!/usr/bin/env node

"use strict";

const { run } = require("jscodeshift/src/Runner");

(async () => {
  const transform = require.resolve("../dist/node-to-nodenext.js");
  const paths = process.argv.slice(2);

  await run(transform, paths, {
    extensions: ["ts", "tsx"].join(","),
    parser: "tsx",
  });
})();
