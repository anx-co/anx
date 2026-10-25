#!/usr/bin/env node
/* Cifra la contraseña del secreto AX_PASSWORD y la escribe en js/auth-config.js */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const FILE = 'js/auth-config.js';
const pw = process.env.AX_PASSWORD || process.argv[2] || 'AX2026';

if (!existsSync(FILE)) { console.error('No encuentro ' + FILE); process.exit(1); }

let src = readFileSync(FILE, 'utf8');
const salt = (src.match(/SALT:\s*"([^"]*)"/) || [, ''])[1] || '';
const hash = createHash('sha256').update(salt + pw + salt).digest('hex');

src = src.replace(/HASH:\s*"[^"]*"/, 'HASH: "' + hash + '"')
         .replace(/PLAIN:\s*(?:"[^"]*"|null)/, 'PLAIN: null');

writeFileSync(FILE, src);
console.log('HASH generado:', hash);
console.log('PLAIN borrado: el valor en claro ya no viaja al navegador.');