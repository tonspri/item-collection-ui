// Item Collection UI v1.3.0: an account-wide card collection window.
// Cards and rules ship beside this file (cards-re.json, cards-pre.json,
// rules.json); what the account has deposited is read from the mod store
// (client.c.<card id>), and every change goes through npc/item-collection.txt.
// Card pictures come from the player's own game data (cardbmp/<art>.bmp). A card's
// art name is in the client's byte-per-character form, like the path it joins.

// Restyles the frame the client draws around the window (same shadow root).
const FRAME_STYLE = `
.frame { background: #dfe6fa; border: 1px solid #7f97d8; border-radius: 12px; box-shadow: 0 10px 34px rgba(36, 44, 96, .45); }
.title { height: 30px; padding: 0 8px 0 14px; border: 0; color: #fff; font-size: 13px; letter-spacing: .3px; text-shadow: 0 1px 2px rgba(30, 40, 110, .7);
    background: linear-gradient(90deg, #4f74d6, #7b9cec 55%, #b7a4ec); }
.close { width: 18px; height: 18px; border: 1px solid rgba(255, 255, 255, .8); border-radius: 50%; background: rgba(255, 255, 255, .22); color: #fff;
    line-height: 15px; transition: transform .14s ease, background .14s ease; }
.close:hover { background: #ef7f8f; transform: scale(1.12); }
.close:active { transform: scale(.92); }
.body { overflow: hidden; }
`;

const STYLE = `
:host { font: 12px/1.35 "Segoe UI", Tahoma, Verdana, sans-serif; }
* { box-sizing: border-box; }
.root { --ink: #47476b; --soft: #7d7fa3; --blue: #4f7fe0; --blue-deep: #3559bd; --gold: #eeb044; --line: rgba(120, 138, 205, .35); --cream: rgba(255, 253, 246, .86);
    position: relative; display: flex; flex-direction: column; gap: 8px; height: 100%; padding: 8px 10px; color: var(--ink); overflow: hidden;
    background: radial-gradient(ellipse 240px 70px at 14% 92%, rgba(255, 255, 255, .85), transparent), radial-gradient(ellipse 300px 90px at 84% 8%, rgba(255, 255, 255, .7), transparent),
        radial-gradient(ellipse 200px 60px at 62% 58%, rgba(255, 255, 255, .45), transparent), linear-gradient(160deg, #c9d6f8 0%, #dfd8f6 42%, #f5dfe9 76%, #fdeedd 100%); }
button { font: inherit; color: inherit; }
.glass { background: var(--cream); border: 1px solid rgba(255, 255, 255, .95); border-radius: 12px; box-shadow: 0 2px 10px rgba(80, 90, 160, .16); }

.head { display: flex; align-items: center; gap: 12px; padding: 6px 12px; }
.count { font-weight: 600; white-space: nowrap; }
.count b { color: var(--blue-deep); display: inline-block; }
.count b.bump { animation: bump .45s ease; }
.bar { flex: 1; height: 9px; border-radius: 6px; background: rgba(120, 138, 205, .22); overflow: hidden; }
.bar i { display: block; height: 100%; width: 0; border-radius: 6px; background: linear-gradient(90deg, #f6cf68, var(--gold)); transition: width .5s cubic-bezier(.2, .8, .2, 1); }
.search { display: flex; align-items: center; width: 210px; padding: 0 4px 0 10px; border: 1px solid var(--line); border-radius: 14px; background: #fff; transition: border-color .15s ease, box-shadow .15s ease; }
.search:focus-within { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(79, 127, 224, .2); }
.search input { flex: 1; min-width: 0; height: 24px; border: 0; outline: 0; background: none; font: inherit; color: var(--ink); }
.search button { width: 18px; height: 18px; border: 0; border-radius: 50%; background: rgba(120, 138, 205, .25); cursor: pointer; line-height: 16px; padding: 0; transition: background .14s ease; }
.search button:hover { background: #ef7f8f; color: #fff; }
.search button[hidden] { display: none; }
.zeny { display: flex; align-items: center; gap: 5px; white-space: nowrap; font-weight: 600; }
.zeny::before { content: ''; width: 12px; height: 12px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #ffe9a6, var(--gold) 70%); box-shadow: 0 0 0 1px #c98f2b inset; }

.main { flex: 1; display: flex; gap: 8px; min-height: 0; }
.rail { width: 104px; display: flex; flex-direction: column; gap: 5px; }
.rail hr { width: 100%; margin: 3px 0; border: 0; border-top: 1px solid var(--line); }
.nav, .chip { position: relative; display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 5px 9px; border: 1px solid rgba(255, 255, 255, .95); border-radius: 13px; background: rgba(255, 255, 255, .78); cursor: pointer;
    transition: transform .14s ease, box-shadow .14s ease, background .14s ease, color .14s ease; }
.nav { justify-content: center; padding: 7px 6px; font-weight: 600; text-align: center; }
.nav:hover:not(:disabled), .chip:hover { transform: translateX(2px); box-shadow: 0 3px 9px rgba(79, 110, 200, .3); }
.nav:not(.on):not(:disabled):hover, .chip:not(.on):hover { background: #fff; }
.nav:active:not(:disabled), .chip:active { transform: scale(.96); }
.nav.on, .chip.on { color: #fff; border-color: rgba(255, 255, 255, .6); background: linear-gradient(#6d97ee, var(--blue-deep)); box-shadow: 0 2px 8px rgba(53, 89, 189, .45), inset 0 1px 0 rgba(255, 255, 255, .45); }
.nav:disabled { color: #a5a7c2; cursor: default; }
.nav small { margin-left: 4px; font-size: 9px; font-weight: 400; }
.chip small { color: var(--soft); font-size: 10px; }
.chip.on small { color: rgba(255, 255, 255, .85); }

.left { flex: 1; display: flex; flex-direction: column; gap: 7px; padding: 8px; min-width: 0; animation: fade .2s ease; }
.filters { display: flex; align-items: center; gap: 5px; }
.pill { padding: 3px 11px; border: 1px solid var(--line); border-radius: 12px; background: #fff; cursor: pointer; transition: transform .14s ease, box-shadow .14s ease, background .14s ease; }
.pill:hover { transform: translateY(-1px); box-shadow: 0 3px 8px rgba(79, 110, 200, .25); }
.pill:active { transform: scale(.95); }
.pill.on { color: var(--blue-deep); font-weight: 600; border-color: var(--blue); background: #e8effd; }
.shown { margin-left: auto; color: var(--soft); white-space: nowrap; }
.grid { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; display: grid; grid-template-columns: repeat(auto-fill, minmax(82px, 1fr)); gap: 7px; align-content: start; padding: 3px; scrollbar-width: thin; scrollbar-color: #a9b8e6 transparent; }

.tile { --rim: #9db7ea; position: relative; min-width: 0; padding: 3px 3px 4px; border: 2px solid var(--rim); border-radius: 9px; background: #fff; cursor: pointer; transition: transform .15s cubic-bezier(.2, .9, .3, 1.3), box-shadow .15s ease; }
.tile.boss { --rim: #b58ae6; }
.tile.mvp { --rim: var(--gold); }
.tile:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 6px 14px rgba(70, 80, 170, .35); z-index: 1; }
.tile:active { transform: scale(.97); }
.tile.sel { box-shadow: 0 0 0 2px var(--blue), 0 4px 12px rgba(79, 127, 224, .5); }
.art { position: relative; aspect-ratio: 3 / 4; border-radius: 5px; overflow: hidden; background: linear-gradient(150deg, #8f7a5c, #5f4f3a); }
.art::before { content: ''; position: absolute; inset: 22% 26%; border: 2px solid rgba(255, 240, 205, .5); border-radius: 4px; transform: rotate(45deg); }
.art img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity .25s ease, filter .25s ease; }
.art img.ready { opacity: 1; }
.art img.icon { inset: 28%; width: 44%; height: 44%; object-fit: contain; image-rendering: pixelated; }
.tile.missing img { filter: grayscale(.85) brightness(.82); }
.tile:hover img { filter: none; }
.tile.done::after { content: ''; position: absolute; inset: 3px 3px auto; aspect-ratio: 3 / 4; border-radius: 5px; pointer-events: none; background: linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, .55) 50%, transparent 60%) 120% 0 / 250% 100% no-repeat; }
.tile.done:hover::after { animation: shine .8s ease; }
.badge { position: absolute; top: 6px; right: 6px; z-index: 1; width: 16px; height: 16px; border-radius: 50%; color: #fff; font-size: 10px; line-height: 16px; text-align: center; box-shadow: 0 1px 3px rgba(0, 0, 0, .4); }
.tile.done .badge { background: linear-gradient(#6fcf73, #3f9e47); }
.tile.done .badge::after { content: '\\2713'; }
.tile.missing .badge { background: rgba(60, 60, 90, .75); }
.tile.missing .badge::after { content: ''; position: absolute; left: 5px; top: 7px; width: 6px; height: 5px; border-radius: 1px; background: #fff; }
.tile.missing .badge::before { content: ''; position: absolute; left: 6px; top: 4px; width: 4px; height: 4px; border: 1px solid #fff; border-bottom: 0; border-radius: 3px 3px 0 0; }
.tile .name { margin-top: 3px; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; }
.prog { position: relative; height: 13px; margin-top: 2px; border-radius: 7px; background: rgba(120, 138, 205, .22); overflow: hidden; text-align: center; font-size: 10px; line-height: 13px; }
.prog i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 7px; background: linear-gradient(90deg, #8fb3f2, var(--blue)); transition: width .4s cubic-bezier(.2, .8, .2, 1); }
.tile.done .prog i, .detail .done i { background: linear-gradient(90deg, #f6cf68, var(--gold)); }
.prog span { position: relative; font-weight: 600; }
.tile.celebrate { animation: celebrate .7s cubic-bezier(.2, .9, .3, 1.3); }

.right { width: 214px; display: flex; flex-direction: column; padding: 10px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #a9b8e6 transparent; }
.detail { display: flex; flex-direction: column; gap: 5px; animation: fade .2s ease; }
.detail h3 { margin: 0; font-size: 13px; text-align: center; }
.detail .art { width: 106px; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(60, 70, 150, .35); }
.rarity { text-align: center; color: var(--soft); font-size: 11px; }
.rarity b { color: var(--gold); letter-spacing: 1px; font-weight: 400; }
.sub { display: flex; justify-content: space-between; color: var(--soft); font-size: 11px; }
.detail h4 { margin: 2px 0 0; padding: 2px 8px; border-radius: 8px; font-size: 11px; background: linear-gradient(90deg, rgba(120, 150, 235, .28), transparent); }
.gain { padding: 0 8px; font-weight: 600; color: var(--blue-deep); }
.gain.off { color: var(--soft); font-weight: 400; }
.qty { display: flex; align-items: center; justify-content: center; gap: 5px; }
.qty input { width: 56px; height: 22px; border: 1px solid var(--line); border-radius: 11px; text-align: center; font: inherit; color: var(--ink); -moz-appearance: textfield; }
.qty input::-webkit-inner-spin-button { display: none; }
.qty input:focus { outline: 0; border-color: var(--blue); box-shadow: 0 0 0 3px rgba(79, 127, 224, .2); }
.step { width: 22px; height: 22px; padding: 0; border: 1px solid var(--line); border-radius: 50%; background: #fff; cursor: pointer; font-weight: 700; line-height: 18px; transition: transform .12s ease, background .12s ease; }
.step:hover { background: #e8effd; transform: scale(1.12); }
.step:active { transform: scale(.88); }
.pair { display: flex; gap: 5px; }
.btn { position: relative; overflow: hidden; width: 100%; height: 27px; border: 0; border-radius: 14px; cursor: pointer; font-weight: 600; color: #fff; text-shadow: 0 1px 1px rgba(30, 50, 120, .5);
    background: linear-gradient(#6d97ee, var(--blue-deep)); box-shadow: 0 2px 6px rgba(53, 89, 189, .45), inset 0 1px 0 rgba(255, 255, 255, .5); transition: transform .13s ease, box-shadow .13s ease, filter .13s ease; }
.btn.alt { color: var(--blue-deep); text-shadow: none; background: linear-gradient(#fff, #e3ebfb); box-shadow: 0 1px 4px rgba(53, 89, 189, .3), inset 0 0 0 1px rgba(79, 127, 224, .45); }
.btn.warm { color: #8a5a12; text-shadow: none; background: linear-gradient(#fff6df, #fbdca0); box-shadow: 0 1px 4px rgba(190, 130, 40, .35), inset 0 0 0 1px rgba(214, 160, 70, .6); }
.btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.07); box-shadow: 0 5px 12px rgba(53, 89, 189, .45), inset 0 1px 0 rgba(255, 255, 255, .5); }
.btn:active:not(:disabled) { transform: translateY(1px) scale(.98); filter: brightness(.96); }
.btn:disabled { cursor: default; color: #a8aac4; text-shadow: none; background: #eceef6; box-shadow: inset 0 0 0 1px rgba(150, 155, 190, .3); }
.btn.busy { color: transparent; }
.btn.busy::after { content: ''; position: absolute; left: 50%; top: 50%; width: 13px; height: 13px; margin: -7px; border: 2px solid rgba(90, 110, 190, .35); border-top-color: var(--blue-deep); border-radius: 50%; animation: spin .7s linear infinite; }
.ripple { position: absolute; width: 8px; height: 8px; margin: -4px; border-radius: 50%; background: rgba(255, 255, 255, .6); pointer-events: none; animation: ripple .5s ease-out forwards; }
.msg { padding: 3px 8px; border-radius: 8px; font-size: 11px; color: #2f6f3a; background: rgba(120, 200, 130, .2); animation: fade .2s ease; }
.msg.err { color: #a83246; background: rgba(240, 120, 140, .2); }
.msg:empty { background: none; }
button:focus-visible { outline: 2px solid var(--blue); outline-offset: 1px; }

.empty { grid-column: 1 / -1; padding: 28px 12px; color: var(--soft); text-align: center; }
.totals { flex: 1; min-height: 0; overflow-y: auto; padding: 2px 6px; scrollbar-width: thin; }
.totals h4 { margin: 4px 0 6px; font-size: 13px; }
.row { display: flex; align-items: center; gap: 7px; padding: 5px 10px; margin-bottom: 4px; border-radius: 10px; background: rgba(255, 255, 255, .85); animation: rise .25s ease backwards; }
.row::before { content: ''; width: 7px; height: 7px; background: var(--gold); transform: rotate(45deg); }
.row b { margin-left: auto; color: var(--blue-deep); }
.side { color: var(--soft); }
.side h4 { margin: 0 0 6px; color: var(--ink); }
.side .line { display: flex; justify-content: space-between; padding: 2px 0; }
.combos { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 7px; padding: 3px; scrollbar-width: thin; scrollbar-color: #a9b8e6 transparent; }
.combo { flex: none; padding: 7px 8px; border: 2px solid rgba(157, 183, 234, .55); border-radius: 11px; background: rgba(255, 255, 255, .8); cursor: pointer; transition: transform .14s ease, box-shadow .14s ease, border-color .14s ease; }
.combo:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(70, 80, 170, .28); }
.combo.sel { border-color: var(--blue); box-shadow: 0 0 0 1px var(--blue), 0 3px 10px rgba(79, 127, 224, .35); }
.combo.ready { border-color: #7fc98a; }
.combo.active { border-color: var(--gold); background: linear-gradient(100deg, #fff8e4, #fff); }
.combo.celebrate { animation: celebrate .7s cubic-bezier(.2, .9, .3, 1.3); }
.combo header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; font-weight: 600; }
.status { padding: 1px 9px; border-radius: 9px; font-size: 10px; font-weight: 600; color: var(--soft); background: rgba(120, 138, 205, .18); white-space: nowrap; }
.status.ready { color: #2f6f3a; background: rgba(120, 200, 130, .3); }
.status.active { color: #8a5a12; background: rgba(238, 176, 68, .32); }
.members { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.members .tile { cursor: inherit; }
.need { display: flex; align-items: center; justify-content: space-between; gap: 6px; width: 100%; padding: 3px 8px; border: 0; border-radius: 8px; background: none; cursor: pointer; font-size: 11px; text-align: left; transition: background .14s ease; }
.need:hover { background: #e8effd; }
.need span:first-child { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.need b { flex: none; font-weight: 600; color: var(--soft); }
.need.met b { color: #2f8a3c; }
.quiet { color: var(--soft); font-size: 11px; text-align: center; }
.foot { display: flex; align-items: center; gap: 10px; }
.views { display: flex; gap: 4px; }
.views .pill { flex: 1; padding: 2px 4px; font-size: 11px; }
.drops { max-height: 188px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #a9b8e6 transparent; }
.drop { display: flex; align-items: baseline; gap: 6px; padding: 3px 8px; border-radius: 8px; font-size: 11px; animation: rise .2s ease backwards; }
.drop:nth-child(odd) { background: rgba(255, 255, 255, .8); }
.drop span { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.drop small { flex: none; color: var(--soft); font-size: 10px; }
.drop b { flex: none; color: var(--blue-deep); }
.bulk { position: absolute; inset: 0; z-index: 5; display: flex; align-items: center; justify-content: center; background: rgba(60, 70, 130, .35); animation: fade .15s ease; }
.bulk-box { display: flex; flex-direction: column; gap: 8px; width: 500px; max-height: 480px; padding: 14px; background: #fffdf6; box-shadow: 0 12px 34px rgba(36, 44, 96, .45); }
.bulk-box h3 { margin: 0; font-size: 14px; }
.bulk-box p { margin: 0; color: var(--soft); font-size: 11px; }
.bulk-list { flex: 1; min-height: 60px; overflow-y: auto; border: 1px solid var(--line); border-radius: 9px; background: #fff; scrollbar-width: thin; scrollbar-color: #a9b8e6 transparent; }
.bulk-row { display: flex; align-items: center; gap: 8px; padding: 4px 9px; cursor: pointer; transition: background .12s ease; }
.bulk-row:hover { background: #e8effd; }
.bulk-row input { flex: none; margin: 0; accent-color: var(--blue); }
.bulk-row img { flex: none; width: 22px; height: 22px; image-rendering: pixelated; }
.bulk-row .who { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.bulk-row small { flex: none; color: var(--soft); font-size: 11px; }
.bulk-row.full small { color: #8a5a12; font-weight: 600; }
.bulk-sum { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-weight: 600; }
.bulk-sum .short { color: #a83246; }
.bulk-acts { display: flex; gap: 8px; }
.bulk-acts .btn { width: auto; flex: 1; }
.linky { padding: 0; border: 0; background: none; color: var(--blue-deep); font-size: 11px; cursor: pointer; text-decoration: underline; }
.note { flex: 1; min-width: 0; padding: 0 2px; color: var(--soft); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.coffee { flex: none; padding: 0 10px; line-height: 16px; border: 1px solid rgba(214, 160, 70, .6); border-radius: 11px; font-size: 11px; color: #8a5a12; background: linear-gradient(#fff6df, #fbe6bb); cursor: pointer; transition: transform .13s ease, box-shadow .13s ease, filter .13s ease; }
.coffee:hover { transform: translateY(-1px); filter: brightness(1.04); box-shadow: 0 3px 8px rgba(190, 130, 40, .35); }
.coffee:active { transform: scale(.96); }

@keyframes fade { from { opacity: 0; transform: translateY(3px); } }
@keyframes rise { from { opacity: 0; transform: translateX(-6px); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes ripple { to { transform: scale(26); opacity: 0; } }
@keyframes bump { 40% { transform: scale(1.35); color: var(--gold); } }
@keyframes shine { to { background-position: -120% 0; } }
@keyframes celebrate { 0% { transform: scale(1); } 35% { transform: scale(1.14); box-shadow: 0 0 0 4px var(--gold), 0 0 22px var(--gold); } 100% { transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .root *, .root *::before, .root *::after { animation: none !important; transition: none !important; } }
`;

const escape = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const commas = n => Number(n || 0).toLocaleString('en-US');
const whole = (value, fallback, min, max) => Number.isSafeInteger(value) ? Math.min(max, Math.max(min, value)) : fallback;
const MENU_ICON_ID = 'item_collection_icon';
const SUPPORT_URL = 'https://buymeacoffee.com/miisteryap';
const RARITY = { normal: ['Normal', '◆'], boss: ['Boss', '◆◆'], mvp: ['MVP', '◆◆◆'] };

/** One reply from npc/item-collection.txt: { ok, fields } or { ok: false, message }. */
export function parseReply(text) {
    const parts = String(text ?? '').split('|');
    if (parts[0] === 'ok') return { ok: true, fields: parts.slice(1) };
    return { ok: false, message: parts[0] === 'err' && parts[1] ? parts.slice(1).join('|') : 'The server did not answer.' };
}

/** The bonus one completed card gives, as [{ kind, value }]. */
export function cardBonus(card, rules) {
    const mult = rules.tierMultiplier[card.tier] || 1;
    return (rules.categories[card.category] || []).map(([kind, value]) => ({ kind, value: value * mult }));
}

/** 'incomplete', 'ready' or 'active': a combo needs comboNeed of each card, or all a card has if fewer. */
export function comboState(combo, byId, counts, active, need, comboNeed) {
    const met = combo.cards.every(id => {
        const card = byId.get(id);
        return card && (counts[id] || 0) >= Math.min(comboNeed, need[card.tier]);
    });
    return !met ? 'incomplete' : active[combo.id] ? 'active' : 'ready';
}

/** Every completed card's bonus and every active combo's added up, in rules.kinds order. */
export function totalBonus(cards, counts, need, rules, active = {}, comboNeed = 3) {
    const total = rules.kinds.map(() => 0);
    for (const card of cards)
        if ((counts[card.id] || 0) >= need[card.tier])
            for (const { kind, value } of cardBonus(card, rules)) total[kind] += value;
    const byId = new Map(cards.map(card => [card.id, card]));
    for (const combo of rules.combos || [])
        if (comboState(combo, byId, counts, active, need, comboNeed) === 'active')
            for (const [kind, value] of combo.gives) total[kind] += value;
    return total;
}

export const describeBonus = (bonus, rules) => bonus.map(({ kind, value }) => `${rules.kinds[kind].label} +${value}`).join(', ');

/** A 'where' reply's fields, highest rate first. */
export function parseDrops(fields) {
    return fields.map(field => {
        const [mob, rate, level, ...name] = String(field).split('~');
        return { mob: Number(mob), rate: Number(rate), level: Number(level), name: name.join('~') };
    }).filter(drop => drop.mob > 0 && drop.name).sort((a, b) => b.rate - a.rate || a.level - b.level);
}

/** A server drop rate as a percentage: 1 is 0.01%. */
export const formatRate = rate => `${(rate / 100).toFixed(2).replace(/\.?0+$/, '')}%`;

/** A 'bagall' reply as [[card id, amount]]. */
export function parseBag(text) {
    return String(text).split(',').map(part => part.split(':').map(Number)).filter(([id, amount]) => id > 0 && amount > 0);
}

/** What a bulk deposit can take: each card in the bag that still needs copies, and how many. */
export function bulkRows(bag, byId, counts, need) {
    const rows = [];
    for (const [id, amount] of bag) {
        const card = byId.get(id);
        if (!card) continue;
        const room = need[card.tier] - (counts[id] || 0);
        if (room > 0) rows.push({ card, take: Math.min(room, amount), have: counts[id] || 0, full: need[card.tier] });
    }
    return rows.sort((a, b) => a.card.name.localeCompare(b.card.name));
}

/** Requests of at most `size` cards each, so none passes the client's 200 character cap. */
export function bulkBatches(rows, size = 15) {
    const out = [];
    for (let i = 0; i < rows.length; i += size)
        out.push(rows.slice(i, i + size).map(row => `${row.card.id}:${row.take}`).join(','));
    return out;
}

/** The cards a view shows: state is 'all' or a card state, slot 'all' or a category. */
export function matchCards(cards, { state = 'all', slot = 'all', query = '' }, stateOf) {
    const q = query.trim().toLowerCase();
    return cards.filter(card => (state === 'all' || stateOf(card) === state)
        && (slot === 'all' || card.category === slot)
        && (!q || card.name.toLowerCase().includes(q) || String(card.id) === q));
}

export default function init(parameters, api) {
    if (api?.version !== 1) throw new Error('Item Collection UI requires client API 1');
    const need = {
        normal: whole(parameters?.need_normal, 10, 1, 100),
        boss: whole(parameters?.need_boss, 3, 1, 100),
        mvp: whole(parameters?.need_mvp, 1, 1, 100),
    };
    const fee = { deposit: whole(parameters?.deposit_fee, 1000, 0, 1000000), withdraw: whole(parameters?.withdraw_fee, 10000, 0, 1000000) };
    const comboNeed = whole(parameters?.combo_need, 3, 1, 100);
    const bonusesOn = parameters?.bonuses !== false;
    const here = file => new URL(file, import.meta.url).href;

    // A new id, so the size v1.0.0 remembered does not squeeze this layout.
    const win = api.ui.window({ id: 'item-collection-album', title: 'Item Collection', width: 830, height: 590, resizable: false });
    const body = win.body;
    body.style.padding = '0';
    const frame = body.getRootNode();
    if (frame !== document && frame.append) {
        const style = document.createElement('style');
        style.textContent = FRAME_STYLE;
        frame.append(style);
    }
    body.innerHTML = `<style>${STYLE}</style><div class="root">
        <div class="glass head"><span class="count">Collected <b>0</b> / <span class="all">0</span></span><div class="bar"><i></i></div><span class="zeny">0</span>
            <label class="search"><input placeholder="Search card name or ID" maxlength="40" aria-label="Search cards"><button class="clear" type="button" title="Clear search" hidden>&times;</button></label></div>
        <div class="main"><div class="rail"></div><div class="glass left"></div><div class="glass right"></div></div>
        <div class="foot"><div class="note">Item Collection is account-wide: every character on this account shares it. Renewal and pre-renewal each keep their own.</div>${parameters?.show_support !== false ? '<button class="coffee" title="Buy DaggerHashimoto a coffee">\u2615 Support the author</button>' : ''}</div></div>`;
    const $ = selector => body.querySelector(selector);
    const rail = $('.rail');
    const left = $('.left');
    const right = $('.right');
    const input = $('.search input');
    const clear = $('.clear');

    let rules = null;
    let cards = [];
    let byId = new Map();
    let counts = {};
    let active = {};
    let comboFilter = 'all';
    let pickedCombo = null;
    let zeny = 0;
    let tab = 'cards';
    let state = 'all';
    let slot = 'all';
    let query = '';
    let selected = null;
    let busy = false;
    let loading = null;
    let notice = null;
    let detailView = 'collect';
    const dropCache = new Map();
    const bags = new Map();
    const pictures = new Map();

    const needOf = card => need[card.tier];
    const countOf = card => Math.min(counts[card.id] || 0, needOf(card));
    const stateOf = card => { const n = countOf(card); return n >= needOf(card) ? 'done' : n > 0 ? 'partial' : 'missing'; };

    async function ask(text) {
        try {
            return parseReply(await api.server.request('icui', text, { timeout: 6000 }));
        } catch {
            return { ok: false, message: 'The server did not answer. Try again in a moment.' };
        }
    }

    // The card's picture from the game data, else its icon, else the plain back.
    function picture(card) {
        if (!pictures.has(card.id)) {
            pictures.set(card.id, (async () => {
                try {
                    const url = card.art ? await api.screens?.image?.(`cardbmp/${card.art}.bmp`) : null;
                    if (url) return { url, icon: false };
                } catch {}
                try {
                    const url = await api.items.icon(card.id);
                    if (url) return { url, icon: true };
                } catch {}
                return null;
            })());
        }
        return pictures.get(card.id);
    }
    function showPicture(img, card) {
        picture(card).then(found => {
            if (!found) return;
            img.classList.toggle('icon', found.icon);
            img.addEventListener('load', () => img.classList.add('ready'), { once: true });
            img.src = found.url;
        });
    }

    // Tile pictures load as they scroll into view; only the grid uses this.
    let observer = null;
    function watchGrid(grid) {
        observer?.disconnect();
        observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                observer.unobserve(entry.target);
                const card = byId.get(Number(entry.target.dataset.art));
                if (card) showPicture(entry.target, card);
            }
        }, { root: grid, rootMargin: '160px' });
        grid.querySelectorAll('img[data-art]').forEach(img => observer.observe(img));
    }
    api.cleanup(() => observer?.disconnect());

    async function readAccount() {
        const sync = await ask('sync');
        if (!sync.ok) throw new Error(sync.message);
        zeny = Number(sync.fields[1]) || 0;
        const saved = await api.store.get('account', 'client.c');
        counts = {};
        for (const [id, n] of Object.entries(saved || {})) counts[id] = Number(n) || 0;
        active = { ...(await api.store.get('account', 'client.a') || {}) };
        return sync.fields[0];
    }

    async function load() {
        if (!rules) left.innerHTML = '<div class="empty">Opening the collection…</div>';
        const era = await readAccount();
        if (rules) return;
        const [list, table] = await Promise.all([
            fetch(here(era === 'pre-renewal' ? './cards-pre.json' : './cards-re.json')).then(r => r.json()),
            fetch(here('./rules.json')).then(r => r.json()),
        ]);
        // The client's own item names first: they match what the player sees in game.
        cards = list.map(card => {
            const name = api.items.get(card.id)?.name;
            return { ...card, name: typeof name === 'string' && name ? name : card.name };
        }).sort((a, b) => a.name.localeCompare(b.name));
        byId = new Map(cards.map(card => [card.id, card]));
        rules = table;
    }

    function refresh() {
        loading ||= load().then(render, error => {
            left.innerHTML = `<div class="empty">${escape(error.message || error)}</div>`;
        }).finally(() => { loading = null; });
        return loading;
    }

    function renderHead(bump = false) {
        const done = cards.filter(card => stateOf(card) === 'done').length;
        const count = $('.count b');
        count.textContent = done;
        count.classList.toggle('bump', false);
        if (bump) { void count.offsetWidth; count.classList.add('bump'); }
        $('.count .all').textContent = cards.length;
        $('.bar i').style.width = cards.length ? `${(100 * done / cards.length).toFixed(1)}%` : '0';
        $('.zeny').textContent = commas(zeny);
    }

    const stateOfCombo = combo => comboState(combo, byId, counts, active, need, comboNeed);
    const memberNeed = card => Math.min(comboNeed, needOf(card));
    const STATUS = { incomplete: 'Incomplete', ready: 'Ready', active: 'Active' };

    const slotLabel = key => String(rules.categoryLabels[key] || key).replace(/ cards$/, '');

    function renderRail() {
        const keys = Object.keys(rules.categoryLabels).filter(key => cards.some(card => card.category === key));
        const tally = key => {
            const group = cards.filter(card => key === 'all' || card.category === key);
            return `${group.filter(card => stateOf(card) === 'done').length}/${group.length}`;
        };
        const ready = (rules.combos || []).filter(combo => stateOfCombo(combo) === 'ready').length;
        rail.innerHTML = `<button class="nav${tab === 'cards' ? ' on' : ''}" data-tab="cards">Cards</button>
            <button class="nav${tab === 'combos' ? ' on' : ''}" data-tab="combos">Combos${ready ? `<small>${ready} ready</small>` : ''}</button>`
            + `
            <button class="nav${tab === 'totals' ? ' on' : ''}" data-tab="totals">Bonuses</button>
            ${tab === 'cards' ? `<hr>${['all', ...keys].map(key => `<button class="chip${slot === key ? ' on' : ''}" data-slot="${key}"><span>${key === 'all' ? 'All slots' : escape(slotLabel(key))}</span><small>${tally(key)}</small></button>`).join('')}` : ''}`;
        rail.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; notice = null; render(); }));
        rail.querySelectorAll('[data-slot]').forEach(b => b.addEventListener('click', () => { slot = b.dataset.slot; renderRail(); renderGrid(); }));
    }

    function tileHtml(card) {
        const n = countOf(card);
        const s = stateOf(card);
        return `<div class="tile ${card.tier} ${s}${card.id === selected ? ' sel' : ''}" data-id="${card.id}" title="${escape(card.name)}">
            <span class="badge"></span><div class="art"><img data-art="${card.id}" alt=""></div>
            <div class="name">${escape(card.name)}</div>
            <div class="prog"><i style="width:${(100 * n / needOf(card)).toFixed(0)}%"></i><span>${n} / ${needOf(card)}</span></div></div>`;
    }

    function renderGrid() {
        left.innerHTML = `<div class="filters">${[['all', 'All'], ['missing', 'Missing'], ['partial', 'Partial'], ['done', 'Completed']]
            .map(([key, label]) => `<button class="pill${state === key ? ' on' : ''}" data-state="${key}">${label}</button>`).join('')}<span class="shown"></span><button class="pill" data-bulk title="Deposit many cards from your bag at once">Bulk Deposit</button></div><div class="grid"></div>`;
        const grid = left.querySelector('.grid');
        const shown = matchCards(cards, { state, slot, query }, stateOf);
        left.querySelector('.shown').textContent = `${shown.length} card${shown.length === 1 ? '' : 's'}`;
        grid.innerHTML = shown.length ? shown.map(tileHtml).join('') : `<div class="empty">No cards match${query ? ` "${escape(query)}"` : ' this filter'}.</div>`;
        left.querySelectorAll('[data-state]').forEach(b => b.addEventListener('click', () => { state = b.dataset.state; renderGrid(); }));
        left.querySelector('[data-bulk]').addEventListener('click', openBulk);
        grid.addEventListener('click', event => {
            const tile = event.target.closest('.tile');
            if (tile) select(Number(tile.dataset.id));
        });
        watchGrid(grid);
    }

    // One tile changed: swap it alone, so the list keeps its place and pictures.
    function updateTile(card, celebrate) {
        const tile = left.querySelector(`.tile[data-id="${card.id}"]`);
        if (!tile) return;
        const n = countOf(card);
        tile.classList.remove('done', 'partial', 'missing');
        tile.classList.add(stateOf(card));
        tile.querySelector('.prog i').style.width = `${(100 * n / needOf(card)).toFixed(0)}%`;
        tile.querySelector('.prog span').textContent = `${n} / ${needOf(card)}`;
        if (celebrate) { tile.classList.remove('celebrate'); void tile.offsetWidth; tile.classList.add('celebrate'); }
    }

    async function refreshBag(id) {
        const bag = await ask(`bag ${id}`);
        if (!bag.ok) return;
        bags.set(id, Number(bag.fields[0]) || 0);
        const line = right.querySelector('.bag');
        if (line && selected === id) line.textContent = `In bag: ${commas(bags.get(id))}`;
    }

    function select(id) {
        selected = id;
        notice = null;
        left.querySelectorAll('.tile').forEach(tile => tile.classList.toggle('sel', Number(tile.dataset.id) === id));
        renderDetail();
    }

    function renderDetail() {
        const card = byId.get(selected);
        if (!card) {
            right.innerHTML = '<div class="side"><h4>Pick a card</h4>Choose a card to see its bonus, then deposit copies from your inventory to complete it.</div>';
            return;
        }
        const n = countOf(card);
        const full = needOf(card);
        const [rarity, gems] = RARITY[card.tier];
        const bag = bags.has(card.id) ? commas(bags.get(card.id)) : '…';
        right.innerHTML = `<div class="detail"><h3>${escape(card.name)}</h3>
            <div class="art"><img alt=""></div>
            <div class="rarity"><b>${gems}</b> ${rarity} · ${escape(slotLabel(card.category))}</div>
            <div class="prog ${n >= full ? 'done' : ''}"><i style="width:${(100 * n / full).toFixed(0)}%"></i><span>${n} / ${full} deposited</span></div>
            <div class="sub"><span>ID ${card.id}</span><span class="bag">In bag: ${bag}</span></div>
            <div class="views"><button class="pill${detailView === 'collect' ? ' on' : ''}" data-view="collect">Collect</button><button class="pill${detailView === 'find' ? ' on' : ''}" data-view="find">Where to find</button></div>
            ${detailView === 'find' ? `<h4>Dropped by</h4><div class="drops"><div class="quiet">Asking the server…</div></div><div class="quiet">Rates on this server.</div>` : `<h4>Collection bonus</h4><div class="gain${bonusesOn ? '' : ' off'}">${bonusesOn ? escape(describeBonus(cardBonus(card, rules), rules)) : 'Bonuses are off in Settings'}</div>
            <div class="sub" title="Zeny fee per card"><span>Deposit ${commas(fee.deposit)}z each</span><span>Withdraw ${commas(fee.withdraw)}z</span></div>
            <div class="qty"><button class="step" data-step="-1" aria-label="One fewer">&minus;</button><input type="number" min="1" max="${full}" value="1" aria-label="How many"><button class="step" data-step="1" aria-label="One more">+</button></div>
            <div class="pair"><button class="btn" data-op="dep"${n >= full ? ' disabled' : ''}>Deposit</button>
            <button class="btn alt" data-op="all"${n >= full ? ' disabled' : ''}>Deposit All</button></div>
            <button class="btn warm" data-op="wd"${n < 1 ? ' disabled' : ''}>Withdraw</button>`}
            <div class="msg${notice?.error ? ' err' : ''}">${escape(notice?.text || '')}</div></div>`;
        showPicture(right.querySelector('.art img'), card);
        right.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => { detailView = b.dataset.view; notice = null; renderDetail(); }));
        refreshBag(card.id);
        if (detailView === 'find') { showDrops(card); return; }
        const amountBox = right.querySelector('input');
        const amount = () => whole(Math.trunc(Number(amountBox.value)), 1, 1, full);
        right.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => { amountBox.value = whole(amount() + Number(b.dataset.step), 1, 1, full); }));
        right.querySelectorAll('[data-op]').forEach(b => b.addEventListener('click', () => move(card, b, b.dataset.op === 'all' ? full : amount())));
    }

    // Rates only change when the server restarts, so a card is asked about once per page.
    async function showDrops(card) {
        if (!dropCache.has(card.id)) {
            const reply = await ask(`where ${card.id}`);
            if (!reply.ok) {
                const box = right.querySelector('.drops');
                if (box && selected === card.id) box.innerHTML = `<div class="quiet">${escape(reply.message)}</div>`;
                return;
            }
            dropCache.set(card.id, parseDrops(reply.fields));
        }
        const box = right.querySelector('.drops');
        if (!box || selected !== card.id || detailView !== 'find') return;
        const drops = dropCache.get(card.id);
        box.innerHTML = drops.length ? drops.map((drop, i) => `<div class="drop" style="animation-delay:${Math.min(i, 8) * 25}ms" title="${escape(drop.name)}"><span>${escape(drop.name)}</span><small>Lv ${drop.level}</small><b>${formatRate(drop.rate)}</b></div>`).join('')
            : '<div class="quiet">No monster on this server drops this card.</div>';
    }

    // Bulk deposit: a list to confirm, in its own layer over the window.
    function closeBulk() { $('.bulk')?.remove(); }

    async function openBulk() {
        if (busy) return;
        closeBulk();
        const reply = await ask('bagall');
        if (!reply.ok) { showBulk(`<h3>Bulk Deposit</h3><p>${escape(reply.message)}</p><div class="bulk-acts"><button class="btn alt" data-close>Close</button></div>`); return; }
        drawBulk(bulkRows(parseBag(reply.fields.join('|')), byId, counts, need));
    }

    function showBulk(html) {
        closeBulk();
        const layer = document.createElement('div');
        layer.className = 'bulk';
        layer.innerHTML = `<div class="glass bulk-box">${html}</div>`;
        $('.root').append(layer);
        layer.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeBulk));
        return layer;
    }

    function drawBulk(rows) {
        if (!rows.length) {
            showBulk('<h3>Bulk Deposit</h3><p>Nothing to deposit: your bag has no cards your collection still needs.</p><div class="bulk-acts"><button class="btn alt" data-close>Close</button></div>');
            return;
        }
        const layer = showBulk(`<h3>Bulk Deposit</h3><p>Untick any card you want to keep, for slotting or selling. Only what each card still needs is taken.</p>
            <div class="bulk-sum"><button class="linky" data-all>Untick all</button></div>
            <div class="bulk-list">${rows.map((row, i) => `<label class="bulk-row${row.have + row.take >= row.full ? ' full' : ''}"><input type="checkbox" checked data-row="${i}"><img data-icon="${row.card.id}" alt=""><span class="who">${escape(row.card.name)}</span><small>+${row.take} \u2192 ${row.have + row.take} / ${row.full}</small></label>`).join('')}</div>
            <div class="bulk-sum"><span class="sum"></span><span class="short"></span></div>
            <div class="bulk-acts"><button class="btn alt" data-close>Cancel</button><button class="btn" data-go>Deposit</button></div>`);
        layer.querySelectorAll('img[data-icon]').forEach(img => Promise.resolve(api.items.icon(Number(img.dataset.icon))).then(url => { if (url) img.src = url; }, () => {}));
        const boxes = [...layer.querySelectorAll('input[data-row]')];
        const go = layer.querySelector('[data-go]');
        const chosen = () => boxes.filter(box => box.checked).map(box => rows[Number(box.dataset.row)]);
        const update = () => {
            const picked = chosen();
            const copies = picked.reduce((sum, row) => sum + row.take, 0);
            const cost = copies * fee.deposit;
            layer.querySelector('.sum').textContent = `${copies} card${copies === 1 ? '' : 's'} for ${commas(cost)} Zeny`;
            layer.querySelector('.short').textContent = cost > zeny ? `You have ${commas(zeny)} Zeny` : '';
            layer.querySelector('[data-all]').textContent = picked.length ? 'Untick all' : 'Tick all';
            go.disabled = !copies || cost > zeny;
        };
        boxes.forEach(box => box.addEventListener('change', update));
        layer.querySelector('[data-all]').addEventListener('click', () => { const on = !chosen().length; boxes.forEach(box => { box.checked = on; }); update(); });
        go.addEventListener('click', () => runBulk(chosen(), layer));
        update();
    }

    async function runBulk(rows, layer) {
        if (busy) return;
        busy = true;
        const before = new Map(rows.map(row => [row.card.id, stateOf(row.card)]));
        const was = zeny;
        const start = rows.map(row => counts[row.card.id] || 0);
        layer.querySelector('.bulk-box').innerHTML = '<h3>Bulk Deposit</h3><p class="progress">Depositing…</p>';
        const line = layer.querySelector('.progress');
        const batches = bulkBatches(rows);
        let refused = 0;
        let failed = false;
        for (let i = 0; i < batches.length; i++) {
            line.textContent = `Depositing, part ${i + 1} of ${batches.length}…`;
            const reply = await ask(`depm ${batches[i]}`);
            if (!reply.ok) { failed = true; break; }
            zeny = Number(reply.fields[0]) || 0;
            refused += Number(reply.fields[1]) || 0;
            for (const [id, have] of parseBag(reply.fields[2] || '')) counts[id] = have;
        }
        busy = false;
        const moved = rows.reduce((sum, row, i) => sum + (counts[row.card.id] || 0) - start[i], 0);
        const finished = rows.filter(row => before.get(row.card.id) !== 'done' && stateOf(row.card) === 'done');
        bags.clear();
        renderHead(finished.length > 0);
        renderRail();
        if (tab === 'cards') {
            const scroll = left.querySelector('.grid')?.scrollTop || 0;
            renderGrid();
            const grid = left.querySelector('.grid');
            if (grid) grid.scrollTop = scroll;
            for (const row of finished) updateTile(row.card, true);
            renderDetail();
        }
        const lines = [`Deposited ${moved} card${moved === 1 ? '' : 's'} for ${commas(was - zeny)} Zeny.`];
        if (finished.length) lines.push(`${finished.length} card${finished.length === 1 ? '' : 's'} completed!`);
        if (refused) lines.push(`${refused} could not be deposited. Check your bag and Zeny.`);
        if (failed) lines.push('The server stopped answering, so the rest were not deposited. Nothing was lost.');
        showBulk(`<h3>Bulk Deposit</h3>${lines.map(text => `<p>${escape(text)}</p>`).join('')}<div class="bulk-acts"><button class="btn" data-close>Done</button></div>`);
    }

    async function move(card, button, amount) {
        if (busy) return;
        busy = true;
        const before = stateOf(card);
        button.classList.add('busy');
        right.querySelectorAll('.btn').forEach(b => { b.disabled = true; });
        const reply = await ask(`${button.dataset.op === 'wd' ? 'wd' : 'dep'} ${card.id} ${amount}`);
        busy = false;
        if (reply.ok) {
            counts[card.id] = Number(reply.fields[0]) || 0;
            zeny = Number(reply.fields[1]) || 0;
            notice = { text: reply.fields.slice(2).join('|') };
        } else {
            notice = { text: reply.message, error: true };
        }
        const completed = reply.ok && before !== 'done' && stateOf(card) === 'done';
        renderHead(completed);
        renderRail();
        updateTile(card, completed);
        if (completed) notice.text += ' Card complete!';
        renderDetail();
    }

    function comboRow(combo) {
        const s = stateOfCombo(combo);
        const members = combo.cards.map(id => byId.get(id)).filter(Boolean).map(card => {
            const n = Math.min(counts[card.id] || 0, memberNeed(card));
            const look = n >= memberNeed(card) ? 'done' : n > 0 ? 'partial' : 'missing';
            return `<div class="tile ${card.tier} ${look}" title="${escape(card.name)}"><span class="badge"></span><div class="art"><img data-art="${card.id}" alt=""></div>
                <div class="name">${escape(card.name.replace(/ Card$/, ''))}</div>
                <div class="prog"><i style="width:${(100 * n / memberNeed(card)).toFixed(0)}%"></i><span>${n} / ${memberNeed(card)}</span></div></div>`;
        }).join('');
        return `<div class="combo ${s}${combo.id === pickedCombo ? ' sel' : ''}" data-combo="${combo.id}"><header><span>${escape(combo.name)}</span><span class="status ${s}">${STATUS[s]}</span></header><div class="members">${members}</div></div>`;
    }

    function renderCombos() {
        left.innerHTML = `<div class="filters">${[['all', 'All'], ['incomplete', 'Incomplete'], ['ready', 'Ready'], ['active', 'Active']]
            .map(([key, label]) => `<button class="pill${comboFilter === key ? ' on' : ''}" data-filter="${key}">${label}</button>`).join('')}<span class="shown"></span></div><div class="combos"></div>`;
        const shown = rules.combos.filter(combo => comboFilter === 'all' || stateOfCombo(combo) === comboFilter);
        left.querySelector('.shown').textContent = `${shown.length} set${shown.length === 1 ? '' : 's'}`;
        const list = left.querySelector('.combos');
        list.innerHTML = shown.length ? shown.map(comboRow).join('') : '<div class="empty">No combos match this filter.</div>';
        left.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => { comboFilter = b.dataset.filter; renderCombos(); }));
        list.addEventListener('click', event => {
            const row = event.target.closest('.combo');
            if (!row) return;
            pickedCombo = Number(row.dataset.combo);
            notice = null;
            list.querySelectorAll('.combo').forEach(item => item.classList.toggle('sel', item === row));
            renderComboDetail();
        });
        watchGrid(list);
    }

    function renderComboDetail() {
        const combo = rules.combos.find(item => item.id === pickedCombo);
        if (!combo) {
            right.innerHTML = `<div class="side"><h4>Pick a combo</h4>Deposit at least ${comboNeed} of each card in a set, or all a card needs if that is fewer, then activate it for an extra bonus. Your cards stay in your collection.</div>`;
            return;
        }
        const s = stateOfCombo(combo);
        const rows = combo.cards.map(id => byId.get(id)).filter(Boolean).map(card => {
            const n = Math.min(counts[card.id] || 0, memberNeed(card));
            return `<button class="need${n >= memberNeed(card) ? ' met' : ''}" data-card="${card.id}" title="Open this card"><span>${escape(card.name)}</span><b>${n} / ${memberNeed(card)}</b></button>`;
        }).join('');
        right.innerHTML = `<div class="detail"><h3>${escape(combo.name)}</h3><div class="quiet"><span class="status ${s}">${STATUS[s]}</span></div>
            <h4>Required cards</h4>${rows}
            <h4>Combo bonus</h4><div class="gain${bonusesOn ? '' : ' off'}">${bonusesOn ? escape(describeBonus(combo.gives.map(([kind, value]) => ({ kind, value })), rules)) : 'Bonuses are off in Settings'}</div>
            <button class="btn" data-activate${s === 'ready' ? '' : ' disabled'}>${s === 'active' ? 'Active' : 'Activate Bonus'}</button>
            <div class="quiet">Cards remain in your collection.</div>
            <div class="msg${notice?.error ? ' err' : ''}">${escape(notice?.text || '')}</div></div>`;
        right.querySelectorAll('[data-card]').forEach(b => b.addEventListener('click', () => openCard(Number(b.dataset.card))));
        right.querySelector('[data-activate]').addEventListener('click', event => activate(combo, event.currentTarget));
    }

    async function activate(combo, button) {
        if (busy) return;
        busy = true;
        button.classList.add('busy');
        button.disabled = true;
        const reply = await ask(`act ${combo.id}`);
        busy = false;
        if (reply.ok) {
            active[combo.id] = 1;
            notice = { text: reply.fields.join('|') };
        } else {
            notice = { text: reply.message, error: true };
        }
        renderRail();
        renderCombos();
        renderComboDetail();
        if (reply.ok) left.querySelector(`.combo[data-combo="${combo.id}"]`)?.classList.add('celebrate');
    }

    // From a combo's list to that card, with nothing filtering it out of view.
    function openCard(id) {
        tab = 'cards';
        slot = 'all';
        state = 'all';
        query = '';
        input.value = '';
        clear.hidden = true;
        selected = id;
        notice = null;
        render();
        left.querySelector(`.tile[data-id="${id}"]`)?.scrollIntoView({ block: 'center' });
    }

    function renderTotals() {
        const total = totalBonus(cards, counts, need, rules, active, comboNeed);
        const rows = rules.kinds.map((kind, i) => bonusesOn && total[i] ? `<div class="row" style="animation-delay:${i * 35}ms"><span>${escape(kind.label)}</span><b>+${commas(total[i])}</b></div>` : '').join('');
        left.innerHTML = `<div class="totals"><h4>Active collection bonuses</h4>${rows || `<div class="empty">${bonusesOn ? 'Complete a card to earn its bonus.' : 'Collection bonuses are off in Settings.'}</div>`}</div>`;
        const keys = Object.keys(rules.categoryLabels).filter(key => cards.some(card => card.category === key));
        right.innerHTML = `<div class="side"><h4>Completed by slot</h4>${keys.map(key => {
            const group = cards.filter(card => card.category === key);
            return `<div class="line"><span>${escape(slotLabel(key))}</span><span>${group.filter(card => stateOf(card) === 'done').length} / ${group.length}</span></div>`;
        }).join('')}<div class="line"><span>Combos active</span><span>${(rules.combos || []).filter(combo => stateOfCombo(combo) === 'active').length} / ${(rules.combos || []).length}</span></div><br>Every character on this account gets these bonuses.</div>`;
    }

    function render() {
        if (!rules) return;
        renderHead();
        renderRail();
        if (tab === 'totals') { renderTotals(); return; }
        if (tab === 'combos') { renderCombos(); renderComboDetail(); return; }
        renderGrid();
        renderDetail();
    }

    // The app's game window refuses to open pages, so there the link is copied
    // instead. A friend playing in a browser gets the page itself.
    async function copyLink() {
        try {
            await navigator.clipboard.writeText(SUPPORT_URL);
            return true;
        } catch {}
        const box = document.createElement('textarea');
        box.value = SUPPORT_URL;
        box.style.cssText = 'position:fixed;left:-999px';
        document.body.append(box);
        box.select();
        let copied = false;
        try { copied = document.execCommand('copy'); } catch {}
        box.remove();
        return copied;
    }
    let supportReset = 0;
    $('.coffee')?.addEventListener('click', async event => {
        const button = event.currentTarget;
        const label = '\u2615 Support the author';
        let page = null;
        try { page = window.open(SUPPORT_URL, '_blank'); } catch {}
        if (page) { page.opener = null; return; }
        button.textContent = await copyLink() ? 'Link copied! Paste it in your browser' : SUPPORT_URL.replace('https://', '');
        clearTimeout(supportReset);
        supportReset = setTimeout(() => { button.textContent = label; }, 6000);
    });
    api.cleanup(() => clearTimeout(supportReset));

    // A soft ripple where any button is pressed.
    $('.root').addEventListener('pointerdown', event => {
        const button = event.target.closest('.btn:not(:disabled)');
        if (!button) return;
        const box = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = `${event.clientX - box.left}px`;
        ripple.style.top = `${event.clientY - box.top}px`;
        button.append(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    });

    // Searching filters as you type; emptying the box brings the whole list back.
    function setQuery(text) {
        query = text.trim();
        clear.hidden = !input.value;
        if (!rules) return;
        if (tab !== 'cards') { tab = 'cards'; render(); return; }
        renderGrid();
    }
    let typing = 0;
    input.addEventListener('input', () => { clearTimeout(typing); typing = setTimeout(() => setQuery(input.value), 120); });
    clear.addEventListener('click', () => { input.value = ''; setQuery(''); input.focus(); });
    api.cleanup(() => clearTimeout(typing));

    function open() {
        closeBulk();
        win.show();
        // Read the account again on every open: another character may have changed it.
        refresh();
    }

    const toggle = () => { if (win.isOpen()) win.hide(); else open(); };
    let inGame = false;
    let launcher = null;
    const menus = new Set();
    const showLauncher = () => launcher?.classList.toggle('ingame', inGame && !menus.size);
    api.on('map:enter', () => { inGame = true; showLauncher(); }, { replay: true });
    api.on('map:leave', () => { inGame = false; showLauncher(); if (win.isOpen()) win.hide(); });
    api.on('server:event', ({ command, text }) => { if (command === 'icui' && text === 'open' && inGame) open(); });

    // Our icon among the Basic Info window's menu icons. There is no API for this
    // menu, so it is added to the window directly. A window without id-keyed icons
    // (the oldest layouts) gets the small button below instead.
    function addMenuIcon(buttons) {
        if (buttons.querySelector(`#${MENU_ICON_ID}`)) return true;
        const sibling = buttons.querySelector('[id]');
        if (!sibling) return false;
        const icon = document.createElement(sibling.tagName);
        icon.id = MENU_ICON_ID;
        icon.className = 'event_add_cursor';
        icon.innerHTML = '<span class="name">Item Collection</span>';
        const picture = file => `url("${here(file)}")`;
        const paint = pressed => { icon.style.backgroundImage = picture(pressed ? './menu-icon-press.png' : './menu-icon.png'); };
        Object.assign(icon.style, { backgroundRepeat: 'no-repeat', backgroundColor: 'transparent', cursor: 'pointer', padding: '0', border: 'none' });
        paint(false);
        icon.addEventListener('pointerdown', () => paint(true));
        for (const type of ['pointerup', 'pointerleave', 'pointercancel']) icon.addEventListener(type, () => paint(false));
        icon.addEventListener('click', toggle);
        buttons.append(icon);
        return true;
    }
    function menuOf(component) {
        return /^BasicInfo/.test(component?.name || '') ? component.root?.querySelector?.('.buttons') : null;
    }
    if (parameters?.show_button !== false) {
        api.on('ui:append', component => {
            const buttons = menuOf(component);
            if (buttons && addMenuIcon(buttons)) { menus.add(buttons); showLauncher(); }
        }, { replay: true });
        api.on('ui:remove', component => {
            if (menus.delete(menuOf(component))) showLauncher();
        });
        api.cleanup(() => {
            for (const component of api.components?.current?.() || []) menuOf(component)?.querySelector(`#${MENU_ICON_ID}`)?.remove();
        });
    }

    if (parameters?.show_button !== false) {
        const host = document.createElement('div');
        const root = host.attachShadow({ mode: 'open' });
        // Below the in-game database's DB button (right: 145px, top: 66px), same edge.
        root.innerHTML = `<style>
            button { position: fixed; right: 145px; top: 90px; width: 43px; height: 22px; z-index: 8999; font: bold 10px Tahoma, sans-serif; padding: 0; color: #fff; cursor: pointer; display: none;
              border: 1px solid #fff; border-radius: 11px; background: linear-gradient(#6d97ee, #3559bd); box-shadow: 0 2px 5px rgba(30, 40, 110, .5); transition: transform .13s ease, filter .13s ease; }
            button:hover { transform: translateY(-1px) scale(1.06); filter: brightness(1.1); }
            button:active { transform: scale(.94); }
            button.ingame { display: block; }</style><button title="Item Collection">Cards</button>`;
        launcher = root.querySelector('button');
        showLauncher();
        launcher.addEventListener('click', event => { event.stopPropagation(); toggle(); });
        launcher.addEventListener('pointerdown', event => event.stopPropagation());
        document.body.append(host);
        api.cleanup(() => host.remove());
    }
    api.cleanup(() => win.hide());
}
