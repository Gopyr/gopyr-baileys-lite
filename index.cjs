'use strict';

/**
 * gopyr-baileys — CJS entry shim (ESM-only as of this build)
 *
 * Why this changed: the previous version of this file used Node's
 * synchronous require(esm) to bridge into lib/index.js at runtime. That
 * only works on Node >=20.19.0 or >=22.12.0 — many hosting panels ship a
 * "Node 22" that is still below 22.12, so `require('gopyr-baileys')` would
 * fail there with a confusing native ERR_REQUIRE_ESM error, even though the
 * panel's own spec sheet says "Node 22+". Detecting and working around that
 * per-patch-version gap added a lot of fragile logic for very little value.
 *
 * This package is published as ESM ("type": "module"). Please import it
 * instead of requiring it:
 *
 *   import { makeWASocket, useMultiFileAuthState } from 'gopyr-baileys';
 *
 * If your project is CommonJS, either:
 *   1) Use a dynamic import (works in any CJS file, any Node version):
 *        const { makeWASocket } = await import('gopyr-baileys');
 *   2) Or switch your project to ESM ("type": "module" in your
 *      package.json, or a .mjs entry file).
 */
throw new Error(
    "[gopyr-baileys] This package is ESM-only — `require('gopyr-baileys')` is not supported.\n" +
    "Use `import { makeWASocket } from 'gopyr-baileys'` instead, or, from CommonJS code, " +
    "`const { makeWASocket } = await import('gopyr-baileys')`."
);
