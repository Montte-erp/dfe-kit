#!/usr/bin/env bun

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const directories = ["core", "packages", ...(existsSync("adapters") ? ["adapters"] : [])];
const globs = [
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
];

const checks = [
  {
    pattern:
      "instanceof|throw new Error|catch\\s*\\(|isHTTPError|isTimeoutError|HTTPError|TimeoutError",
    message:
      "Use better-result panic for mandatory invariants and typed Result data for recoverable faults. Do not branch on runtime Error wrappers/classes.",
  },
  {
    pattern:
      "(const|function)\\s+[A-Za-z0-9_]*(Failure|Fault)[A-Za-z0-9_]*|const\\s+[A-Za-z0-9_]*Error[A-Za-z0-9_]*\\s*=\\s*\\([^)]*\\)\\s*[:=]|:\\s*FiscalProviderError\\s*=>|\\)\\s*:\\s*FiscalProviderError\\s*=>",
    message:
      "Do not create error/failure helper functions. Build Result.err objects inline at the decision point, from the declarative evlog catalog.",
  },
];

let failed = false;
for (const check of checks) {
  const result = spawnSync("rg", [...globs, check.pattern, ...directories], { stdio: "inherit" });
  if (result.status === 0) {
    console.error(`Declarative error handling check failed. ${check.message}`);
    failed = true;
  } else if (result.status !== 1) {
    process.exit(result.status ?? 1);
  }
}

if (failed) process.exit(1);
