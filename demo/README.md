# Demo data

`private.demo.json` is the **fictional** plain-text private data behind the demo
(`src/data/private.enc.json` and `public/seed-docs/`). Nothing here is real.

Demo passphrase: **lanterna arroz bicicleta 27** (spaces and case are ignored).

To rebuild the demo data:

```bash
mkdir -p private && cp demo/private.demo.json private/private.json
TRIP_PASSPHRASE="lanterna arroz bicicleta 27" npm run private:encrypt
```

For your own trip, do **not** reuse these keys: start from `private.example.json`
and run `node scripts/new-keys.mjs <group ids>`.
