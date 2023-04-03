import { defineTest } from "jscodeshift/src/testUtils";
import { describe } from "vitest";

describe("reverse identifiers", () => {
  defineTest(
    __dirname,
    "../dist/node-to-nodenext",
    null,
    "node-to-nodenext/basic",
    {
      parser: "ts",
    }
  );
});
