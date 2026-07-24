const Module = require("module");
const path = require("path");

const stubPath = path.join(__dirname, "stubs", "server-only.cjs");
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === "server-only") {
    return stubPath;
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};
