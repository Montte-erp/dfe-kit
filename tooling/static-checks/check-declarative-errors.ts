#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const directories = ["core", "packages", ...(existsSync("adapters") ? ["adapters"] : [])];
const args = [
  "--glob",
  "!**/dist/**",
  "--glob",
  "!**/.tsbuildinfo",
  "--glob",
  "!outputs/**",
  "--glob",
  "!docs/**",
  "--glob",
  "!**/README.md",
  "--glob",
  "!**/__tests__/**",
  "instanceof|throw new Error|catch\\s*\\(|isHTTPError|isTimeoutError|HTTPError|TimeoutError",
  ...directories,
];

const result = spawnSync("rg", args, { stdio: "inherit" });
if (result.status === 0) {
  console.error(
    "Declarative error handling check failed. Use better-result panic for mandatory invariants and typed Result data for recoverable faults.",
  );
  process.exit(1);
}
if (result.status !== 1) process.exit(result.status ?? 1);
