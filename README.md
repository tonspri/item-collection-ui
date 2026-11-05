# Item Collection UI

A card collection mod for [Ragnarok Offline](https://github.com/Flux159/ragnarokoffline.app). Deposit cards into a collection shared by your whole account, complete them for small permanent bonuses, and activate themed combo sets. Works in renewal and pre-renewal, on a normal player account.

## What is here

| Path | What it is |
|---|---|
| `mod/` | The mod exactly as it ships |
| `mod/npc/` | The server script: every deposit, withdrawal, fee and bonus is decided here |
| `mod/client/` | The in-game window, the card lists and the menu icon |
| `mod/renewal/`, `mod/pre-renewal/` | Each era's generated card table |
| `tests/` | Package checks that run on every push |
| `scripts/` | Builds the release zip |

Each release is built by this repository's workflow from the commit it names, after the checks pass.

## How it works

- **Storage:** deposits are kept in the mod store's account scope, under `client.c.<card id>`. Activated combos are under `client.a.<combo id>`.
- **Requests:** the window talks to a level-0 `@icui` command. Players can type that command themselves, so the script checks every request: the card must be on the list, and it checks the bag, Zeny and carrying weight itself.
- **Bonuses:** each login applies the full total with one `bonus_script`. A change during a session adds only the difference. The flags make it end at logout and keep it safe from dispels, death and other scripts' `bonus_script_clear`.
- **Where to find:** each era's table names the monsters that drop a card. The script asks the server for each one's live rate with `getmobdrops`, so drop-rate settings are included.
- **Bulk deposit:** the window asks for the bag's cards with `bagall`, then sends at most 15 cards per `depm` request to stay under the client's request cap. The bonus changes once per request.
- **Settings:** the host chooses in the app, under Settings → Mods → Item Collection UI. That includes storing extra copies above a card's limit, which is off by default.
- **Which cards:** every card a monster drops in that era's `mob_db`, from rAthena's tables. That is 449 in pre-renewal and 907 in renewal.
- **Card art:** pictures are read from the player's own game files at run time. The mod ships only the file names, from the client's `num2cardillustnametable.txt`, and no card images.

## Known limits

- The menu icon is added to the Basic Info window directly, because the client has no API for that menu. A client without that menu shows a small Cards button instead.
- Cards added by other mods are not in the list.
- If the server crashes rather than shutting down normally, a character can have its bonus counted twice until its next logout.

## Support

If you enjoy this mod, you can [buy DaggerHashimoto a coffee](https://buymeacoffee.com/miisteryap). It is entirely optional.

## Licence

GPL-3.0. See [LICENSE](LICENSE).
