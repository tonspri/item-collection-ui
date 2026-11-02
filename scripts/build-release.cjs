'use strict';
// Zips mod/ as dist/ItemCollectionUI-v<version>.zip with one top-level folder. Run from the repository root.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const version = JSON.parse(fs.readFileSync('mod/mod.json', 'utf8')).version;
const notes = `RELEASE-NOTES-v${version}.md`;
if (!fs.existsSync(notes)) throw new Error(`${notes} is missing`);

const dist = path.resolve('dist');
const stage = path.join(dist, 'stage');
fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync('mod', path.join(stage, 'item-collection-ui'), { recursive: true });
const name = `ItemCollectionUI-v${version}.zip`;
const archive = path.join(dist, name);
if (process.platform === 'win32') execFileSync('C:/Windows/System32/tar.exe', ['-a', '-c', '-f', archive, '-C', stage, 'item-collection-ui']);
else execFileSync('zip', ['-r', '-q', archive, 'item-collection-ui'], { cwd: stage });
fs.rmSync(stage, { recursive: true, force: true });
const digest = crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
fs.writeFileSync(path.join(dist, `SHA256-v${version}.txt`), `${digest}  ${name}\n`);
console.log(`${name} ${digest}`);
