# Item Collection UI v1.5.0

A card collection window for your whole account. Deposit cards to complete them, activate themed combo sets, and every character on the account earns small permanent bonuses. Shows each card's real art, in a soft album-style window. Open it with the card icon in the Basic Info menu or @collection. Renewal and pre-renewal.

## How to use it
1. Click the card icon in the Basic Info menu, or type `@collection`. A client without that icon menu shows a small Cards button instead.
2. Pick a card, then **Deposit** or **Deposit All**. Only cards in your inventory can be deposited.
3. When a card has all its copies, its bonus applies to every character on the account.
4. **Withdraw** gives a card back to whichever character is logged in. If the card drops below complete, its bonus goes away.

## Renewal and pre-renewal
Both eras work. Each era is its own world with its own database, so each keeps its own collection: cards deposited in one do not appear in the other.

## Copies and bonuses
Normal cards need 10 copies, boss cards 3, and MVP cards 1. You can change these in Settings.

A completed card gives a bonus based on where it goes:
- Weapon cards: ATK +1, MATK +1
- Armor cards: Max HP +10
- Shield cards: DEF +1
- Garment cards: FLEE +1
- Shoes cards: Max SP +5
- Headgear cards: MDEF +1
- Accessory cards: HIT +1

Boss cards give double and MVP cards triple.

## Finding and depositing cards
Pick a card and open **Where to find** to see which monsters drop it, with this server's real rates. **Bulk Deposit**, above the list, shows every card in your bag the collection still needs. Untick any you want to keep, check the total fee, and deposit them all at once.

Cards you carry that the collection can take glow green and show how many, and **In Bag** lists them. It updates when you open the window, change tabs or move cards. Click the card picture to see it full size. The gear button by the search box hides fees, the item ID and the bag count.

## Combo Collections
Open **Combos** to see 10 themed sets. Deposit 3 of each card in a set (an MVP card needs only 1), then click **Activate Bonus**. Combos use nothing up: your cards stay in your collection. If you withdraw a card and fall below what a set needs, its bonus pauses, and comes back when you deposit again. In a combo's panel, **Deposit from Bag** adds just what the set still needs, and **Withdraw Set** takes the set's cards back after showing you a list.

- **Poring Family:** Poring, Drops, Poporing, Marin, Metaling. LUK +5, Perfect Dodge +3.
- **Field Critters:** Lunatic, Fabre, Pupa, Chonchon, Willow. VIT +3, Max HP % +3.
- **Restless Dead:** Zombie, Skeleton, Mummy, Ghoul, Munak. INT +2, Max SP % +5.
- **Orc Warband:** Orc Warrior, Orc Zombie, Orc Skeleton, Orc Archer, Orc Lady. STR +5, ATK +15.
- **Sky Hunters:** Condor, Harpy, Dustiness, Creamy, Hornet. DEX +5, Long Attack % +5.
- **Shadow Thieves:** Thief Bug, Familiar, Zerom, Steel Chonchon, Yoyo. AGI +5, CRIT +5.
- **Arcane Circle:** Marionette, Wraith, Evil Druid, Dark Priest, Joker. INT +5, MATK +15.
- **Fallen Knights:** Raydric, Khalitzburg, Abysmal Knight, Bloody Knight, Raydric Archer. VIT +5, Max HP % +5.
- **Legends of Midgard:** Osiris, Doppelganger, Dracula, Moonlight Flower, Orc Hero. STR +2, AGI +2, VIT +2, INT +2, DEX +2, LUK +2, ASPD % +5.
- **Night Terrors:** Deviruchi, Isis, Sohee, Bongun, Familiar. Damage to Demons % +5, Damage to Undead % +5.

## Milestones
Complete a share of the era's cards for an extra bonus. Marks on the progress bar show each goal, and **Bonuses** lists them with your progress. Withdrawing below a goal pauses its bonus until you deposit again.

- **10%:** STR +1, AGI +1, VIT +1, INT +1, DEX +1, LUK +1
- **25%:** Max HP % +2, Max SP % +2
- **50%:** STR +1, AGI +1, VIT +1, INT +1, DEX +1, LUK +1, ATK +10, MATK +10
- **75%:** Max HP % +3, Max SP % +3
- **100%:** STR +2, AGI +2, VIT +2, INT +2, DEX +2, LUK +2, ATK +20, MATK +20

## Needed card alerts
When you pick up a card the collection still needs, autoloot included, a chat line shows your progress and how many you carry. Turn it off in the gear menu.

## Settings
These are in the app, under **Settings → Mods → Item Collection UI**. Click **Apply & restart** after changing them.
- **Let the collection store extra copies:** deposit above a card's limit, up to 9,999. Off by default.
- **Give collection bonuses**, fees, and copies needed for each card type and combo.
- **Show the card icon** and **Show the Support the author button**.

The gear button in the window has each player's own display choices.

## Adding your own combos
Combos live in two files that must match: `npc/item-collection-v1.5.0.txt` (`.comboName$`, `.comboCards$`, `.comboGives$`) and `client/rules.json` (`combos`). Each bonus is a number from the bonus list plus a value, so `12:5` is the 13th bonus, +5. To add a bonus, add it at the end of both lists (`.bonus$` and `kinds`). It can be `bonus bLuk` or `bonus2 bAddRace,RC_Demon`.

Only use bonuses that simply add up, such as `bAddRace` or `bSubEle`. Withdrawing a card takes a bonus away by adding its negative, so effects like `bHPRegenRate` give wrong stats. Give each new combo the next id, and never reuse one: an activation is saved under its id.

Updating the mod replaces its folder, so keep a copy of your edits.

## Fees
Depositing costs 1,000 Zeny per card and withdrawing costs 10,000 Zeny per card. You can change both in Settings.

## Which cards count
Every card a monster drops in the era you are playing: 449 in pre-renewal and 907 in renewal. Cards added by other mods are not in the list.

## Support
If you enjoy this mod, you can [buy DaggerHashimoto a coffee](https://buymeacoffee.com/miisteryap). It is entirely optional, and nothing in the mod depends on it. The **Support the author** button in the window opens that page, or copies the link when the app can't open it. You can hide the button in Settings.

## Known limits
- Card art comes from your own game data. A card your client has no picture for shows its item icon instead.
- If the server crashes rather than shutting down normally, a character can have its bonus counted twice until its next logout.
