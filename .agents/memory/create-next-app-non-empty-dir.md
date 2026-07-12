---
name: create-next-app refuses non-empty directories
description: How to scaffold Next.js into a workspace root that already has files (git, .replit, existing data dirs, etc).
---

`npx create-next-app@14 .` aborts with a "directory contains files that could
conflict" error the moment the target directory has *any* files in it —
including dotfiles like `.replit`, `.git`, `.agents`, or a pre-existing
`package.json`/`node_modules` created by earlier `installLanguagePackages`
calls.

**Why:** create-next-app does a naive non-empty-directory check with no
force/merge flag for arbitrary existing files.

**How to apply:** scaffold into a throwaway subdirectory
(`mkdir tmp-scaffold && cd tmp-scaffold && npx create-next-app@14 .`), then
copy the generated config files (`next.config.mjs`, `tailwind.config.ts`,
`tsconfig.json`, `postcss.config.mjs`, `.eslintrc.json`, `src/`) up to the
workspace root, hand-merge `package.json` dependencies with whatever was
already there, and delete the temp dir.
