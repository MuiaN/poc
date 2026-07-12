---
name: Node 18 cheerio/undici File polyfill
description: cheerio throws "File is not defined" on Node 18.20 unless global.File is polyfilled first.
---

Recent cheerio versions pull in `undici`, whose fetch/web-idl shim references
the global `File` class at module-load time. Node 18.20 (this environment's
default) does not define `File` globally, so `require("cheerio")` throws
`ReferenceError: File is not defined` before any cheerio code runs.

**Why:** undici's `webidl` module unconditionally does
`webidl.is.File = webidl.util.MakeTypeAssertion(File)` on import.

**How to apply:** before requiring cheerio (or anything that transitively
pulls in undici) on Node 18, set `global.File = class File {};` as the first
line of the script. This is a one-off scripting concern, not something to fix
in application code — prefer avoiding the dependency in app runtime code.
