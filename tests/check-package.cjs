'use strict';
// Package checks: the server script and the window must agree. Run from the repository root.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');

const mod = path.resolve('mod');
const read = rel => fs.readFileSync(path.join(mod, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const manifest = json('mod.json');
const VERSION = manifest.version;
const rules = json('client/rules.json');
const npc = read(`npc/item-collection-v${VERSION}.txt`);
const code = npc.replace(/\/\/[^\n]*/g, '');
const results = [];
const check = async (label, fn) => { await fn(); results.push(label); };

function npcArray(name) {
    const m = code.match(new RegExp(`setarray \\.${name.replace('$', '\\$')}\\[0\\], ([^;]+);`));
    assert(m, `${name}: array`);
    return m[1].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
}

function npcCombo(name) {
    const m = code.match(new RegExp(`setarray \\.${name}\\$\\[1\\], ([^;]+);`));
    assert(m, name);
    return [...m[1].matchAll(/"([^"]*)"/g)].map(g => g[1]);
}

function eraTable(folder) {
    const text = read(`${folder}/npc/item-collection-cards-v${VERSION}.txt`);
    const table = new Map();
    for (const m of text.matchAll(/\$@ICUI_tier\[(\d+)\] = (\d); \$@ICUI_cat\[\d+\] = (\d);/g)) {
        assert(!table.has(Number(m[1])), `${m[1]}: listed twice`);
        table.set(Number(m[1]), { tier: Number(m[2]), cat: Number(m[3]) });
    }
    return { text, table };
}

(async () => {
    await check('manifest: name, settings and era folders', () => {
        assert.equal(manifest.name, 'item-collection-ui');
        assert(manifest.settings.length <= 40);
        for (const folder of [manifest.renewalFolder, manifest.prerenewalFolder]) assert(fs.existsSync(path.join(mod, folder, 'npc')));
    });

    await check('npc: every F_ModSetting names this mod, a declared key, and its default', () => {
        const declared = new Map(manifest.settings.map(s => [s.key, s.default]));
        const uses = [...code.matchAll(/callfunc\("F_ModSetting", "([^"]+)", "([^"]+)", (\d+)\)/g)];
        assert(uses.length >= 7);
        for (const [, name, key, fallback] of uses) {
            assert.equal(name, manifest.name);
            assert(declared.has(key), key);
            assert.equal(Number(fallback), Number(declared.get(key)), `${key}: default`);
        }
    });

    await check('npc: braces balance and every called label exists', () => {
        assert.equal((code.match(/{/g) || []).length, (code.match(/}/g) || []).length);
        for (const [, label] of code.matchAll(/callsub\(?\s*(S_\w+)/g)) assert(new RegExp(`^${label}:`, 'm').test(code), label);
    });

    await check('npc: bonus flags are logout + permanent + duplicate, and the duration fits', () => {
        const m = code.match(/bonus_script "\{" \+ \.@s\$ \+ "\}", (\d+), (\d+);/);
        assert(m, 'bonus_script call');
        assert.equal(Number(m[2]), 8 + 512 + 2048);
        assert(Number(m[1]) * 1000 < 2 ** 31, 'the seconds are multiplied by 1000 into 32 bits');
    });

    await check('rules: server arrays match the window', () => {
        assert.deepEqual(npcArray('bonus$'), rules.kinds.map(k => k.bonus));
        const keys = Object.keys(rules.categoryLabels);
        const [ka, va, kb, vb] = ['kindA', 'valueA', 'kindB', 'valueB'].map(n => npcArray(n).map(Number));
        keys.forEach((key, i) => {
            const expected = [[ka[i], va[i]]];
            if (kb[i] >= 0) expected.push([kb[i], vb[i]]);
            assert.deepEqual(rules.categories[key], expected, key);
        });
    });

    await check('combos: server and window agree, every card is in both eras', () => {
        assert.deepEqual(npcCombo('comboName'), rules.combos.map(c => c.name));
        assert.deepEqual(npcCombo('comboCards'), rules.combos.map(c => c.cards.join(',')));
        assert.deepEqual(npcCombo('comboGives'), rules.combos.map(c => c.gives.map(g => g.join(':')).join(',')));
        assert.deepEqual(rules.combos.map(c => c.id), rules.combos.map((_, i) => i + 1));
        for (const file of ['cards-pre.json', 'cards-re.json']) {
            const ids = new Set(json(`client/${file}`).map(c => c.id));
            for (const combo of rules.combos) for (const id of combo.cards) assert(ids.has(id), `${combo.name}: ${id} in ${file}`);
        }
    });

    await check("bonus script: the largest possible total fits rAthena's 512 characters", () => {
        const longest = rules.kinds.reduce((sum, k) => sum + `bonus ${k.bonus},-99999;`.length, 2);
        assert(longest < 512, `${longest} characters`);
    });

    await check('era tables: match the window lists, one era each', () => {
        const keys = Object.keys(rules.categoryLabels);
        for (const [folder, file, era] of [['renewal', 'cards-re.json', 'renewal'], ['pre-renewal', 'cards-pre.json', 'pre-renewal']]) {
            const { text, table } = eraTable(folder);
            const mobs = new Map([...text.matchAll(/\$@ICUI_mobs\$\[(\d+)\] = "([\d,]+)";/g)].map(m => [Number(m[1]), m[2]]));
            assert.equal(mobs.size, table.size, `${era}: every card names its monsters`);
            const cards = json(`client/${file}`);
            assert.equal(table.size, cards.length);
            assert(text.includes(`$@ICUI_era$ = "${era}";`));
            for (const c of cards) {
                const row = table.get(c.id);
                assert(row, `${c.id}: missing`);
                assert.equal(row.tier, rules.tierMultiplier[c.tier]);
                assert.equal(keys[row.cat], c.category);
            }
        }
    });

    await check('requests: where to find and bulk deposit reach the server script', () => {
        for (const op of ['where', 'bagall', 'depm']) assert(code.includes(`.@op$ == "${op}"`), op);
        for (const label of ['S_Where', 'S_BagAll', 'S_DepositMany']) assert(new RegExp(`^${label}:`, 'm').test(code), label);
        assert(/if \(!\.@quiet\)\s+callsub S_Apply;/.test(code), 'a bulk deposit changes the bonus once, at the end');
    });

    await check('window: hides the system pointer with the game cursor, and keeps the lock icon centered', () => {
        const client = read('client/index.js');
        assert((client.match(/@container style\(--ro-game-cursor: on\) \{ \* \{ cursor: none !important; \} \}/g) || []).length >= 2, 'window and fallback button');
        assert(client.includes('.tile.missing .badge::before { content: \'\'; position: absolute; left: 5px;'));
    });

    await check('card art: every card names a picture, in the byte-per-character form', () => {
        for (const file of ['cards-re.json', 'cards-pre.json'])
            for (const c of json(`client/${file}`)) {
                assert(c.art && !/[\\/.]/.test(c.art), `${c.id}: art`);
                assert(![...c.art].some(ch => ch.charCodeAt(0) > 255), `${c.id}: real Korean text finds no file in the client`);
            }
    });

    await check('store: a full renewal collection fits the account store and the read cap', () => {
        const cards = json('client/cards-re.json');
        const bytes = cards.reduce((sum, c) => sum + `client.c.${c.id}`.length + 8, 0);
        assert(bytes < 64 * 1024, `${bytes} bytes`);
        assert(JSON.stringify(Object.fromEntries(cards.map(c => [c.id, 100]))).length < 36 * 1024);
    });

    await check('menu icon: both pictures are 32x34 PNGs, and the tooltip is the plain name', () => {
        for (const file of ['client/menu-icon.png', 'client/menu-icon-press.png']) {
            const b = fs.readFileSync(path.join(mod, file));
            assert.equal(b.toString('latin1', 1, 4), 'PNG');
            assert.deepEqual([b.readUInt32BE(16), b.readUInt32BE(20)], [32, 34]);
        }
        assert(read('client/index.js').includes('<span class="name">Item Collection</span>'));
    });

    // A copy outside the mod so Node reads the plugin as a module.
    const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'icui-'));
    const copy = path.join(scratch, 'index.mjs');
    fs.copyFileSync(path.join(mod, 'client/index.js'), copy);
    const plugin = await import('file:///' + copy.replace(/\\/g, '/'));

    await check('window logic: replies, bonuses, filters and combo states', () => {
        assert.deepEqual(plugin.parseReply('ok|3|500|Deposited 1 Poring Card.'), { ok: true, fields: ['3', '500', 'Deposited 1 Poring Card.'] });
        assert.deepEqual(plugin.parseReply('err|No.'), { ok: false, message: 'No.' });
        assert.equal(plugin.parseReply(undefined).ok, false);
        const need = { normal: 10, boss: 3, mvp: 1 };
        const cards = [{ id: 1, tier: 'normal', category: 'weapon' }, { id: 2, tier: 'mvp', category: 'armor' }, { id: 3, tier: 'normal', category: 'armor' }];
        const total = plugin.totalBonus(cards, { 1: 10, 2: 1, 3: 9 }, need, rules);
        const at = bonus => total[rules.kinds.findIndex(k => k.bonus === bonus)];
        assert.equal(at('bBaseAtk'), 1);
        assert.equal(at('bMatk'), 1);
        assert.equal(at('bMaxHP'), 30);
        const named = [{ id: 7, name: 'Poring Card', category: 'armor' }, { id: 8, name: 'Lunatic Card', category: 'weapon' }];
        assert.equal(plugin.matchCards(named, { query: '  ' }, () => 'missing').length, 2);
        assert.equal(plugin.matchCards(named, { query: '8' }, () => 'missing')[0].id, 8);
        assert.deepEqual(plugin.parseDrops(['1002~1~1~Poring', '1113~300~3~Drops', '', 'bad']).map(d => d.name), ['Drops', 'Poring']);
        assert.equal(plugin.formatRate(1), '0.01%');
        assert.equal(plugin.formatRate(100), '1%');
        assert.equal(plugin.formatRate(150), '1.5%');
        assert.deepEqual(plugin.parseBag('4001:12,4002:3,'), [[4001, 12], [4002, 3]]);
        const pool = new Map([[1, { id: 1, tier: 'normal', name: 'B' }], [2, { id: 2, tier: 'mvp', name: 'A' }], [3, { id: 3, tier: 'normal', name: 'C' }]]);
        assert.deepEqual(plugin.bulkRows([[1, 12], [2, 5], [3, 2], [9, 1]], pool, { 1: 4, 2: 1 }, need).map(r => [r.card.id, r.take]), [[1, 6], [3, 2]]);
        const many = Array.from({ length: 31 }, (_, i) => ({ card: { id: 300000 + i }, take: 100 }));
        const parts = plugin.bulkBatches(many);
        assert.equal(parts.length, 3);
        for (const part of parts) assert(`depm ${part}`.length <= 180, 'under the 200 character request cap');
        const byId = new Map([[1, { id: 1, tier: 'normal' }], [2, { id: 2, tier: 'mvp' }]]);
        const set = { id: 5, cards: [1, 2], gives: [[0, 4]] };
        assert.equal(plugin.comboState(set, byId, { 1: 2, 2: 1 }, {}, need, 3), 'incomplete');
        assert.equal(plugin.comboState(set, byId, { 1: 3, 2: 1 }, {}, need, 3), 'ready', 'an MVP card only needs its own 1');
        assert.equal(plugin.comboState(set, byId, { 1: 3, 2: 1 }, { 5: 1 }, need, 3), 'active');
        assert.equal(plugin.comboState(set, byId, { 1: 2, 2: 1 }, { 5: 1 }, need, 3), 'incomplete', 'too few cards pauses an active combo');
    });
    fs.rmSync(scratch, { recursive: true, force: true });

    console.log(results.map(r => `ok - ${r}`).join('\n'));
})().catch(error => { console.error(results.map(r => `ok - ${r}`).join('\n')); console.error(error); process.exit(1); });
