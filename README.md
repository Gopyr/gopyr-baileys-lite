# @gopyr/baileys

Stable WhatsApp Web multi-device library (Baileys family) — community edition.

## Fitur inti (stabil)
- Multi-device (QR + pairing code)
- Auth state MySQL/MariaDB (`useMySQLAuthState`)
- MessageBuilder, native flow, VoIP calling
- Newsletter, communities, groups, business API

## Install
```bash
npm install @gopyr/baileys
```

## Contoh
```js
import makeWASocket, { useMySQLAuthState } from '@gopyr/baileys';
```

Lisensi MIT. Tidak berafiliasi dengan WhatsApp.
- 2026-11-09 chore: tidy eslint overrides
- 2026-11-13 refactor: split module for clarity
