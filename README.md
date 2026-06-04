# Cobbleblock - Cobblemon Skyblock (Early Access)

Welcome to Cobbleblock, a Skyblock modpack focused on the Cobblemon mod (which, if you somehow are not aware, adds Pokémon to Minecraft). The pack includes all generational gimmicks and all 1025 Pokémon! Pokémon spawn rules and a lot of recipes are also redone to be more fitting for a Skyblock. Also features some automation, and a lot of quality of life mods.

This modpack is in early access and still undergoing heavy development. A lot is unfinished and there may be breaking changes in the future. The main purpose of this early release is to get feedback and suggestions!

## 📦 Modpack Features

- Built for Minecraft 1.21.1 and includes the newest Cobblemon version (1.7).
- Start on a classic Skyblock island with only a block of ice, a lava bucket, and a single Apricorn tree.
- ...plus the tools of a trainer: a starter Pokémon, a Pokédex, a Pokénav, and a Trainer Card.
- All 1025 Pokémon are included! Many Legendary Pokémon are not not yet obtainable without commands at the moment, however.
- Completely redone spawning rules for all Pokémon. Build regular Pokémon a habitat using the blocks they like to attract them to your island.
- Obtain Legendary Pokémon using a unique method: you will need to build them custom multiblock shrines, then offer up special items in order to summon the Pokémon and catch them! These shrines can get expensive, and act as a major form of progression in the pack. Only the Kanto and Johto legendaries have shrine implementations right now.
- Multiplayer support! Each player can either create their own Skyblock island, or share one with a team of players.
- No vanilla Minecraft mobs! All mob drops can be obtained from Pokémon or crafted via other means instead.
- Unique Skyblock progression featuring many new types of cobblestone generators, rebalanced or completely new recipes, automation with the Create mod and rebalanced Pokémon drops among other things.
- Pokémon passively item from their drop tables (you can check these in your Pokédex or though EMI) to help you build up your island. This works whether they are in the wild, in your party, or roaming free in a pasture. You can automatically collect these drops by crafting a Pokébasket.
- Hunger is completely removed and will not interrupt your Pokémon adventure. All food items now restore health over time instead.
- Archaeology is now renewable! You can now craft suspicious gravel and sand with intact loot waiting to be unearthed. Cobblestone generators have a chance to produce suspicious cobblestone that can be crushed with a hammer or millstone into suspicious gravel or sand. Brush these newly crushed blocks for all sorts of loot!
- Craft a special meteor beacon and pull down a meteor from space to harvest rare materials from. This will be the key to mega evolving Pokémon as well as finding resources that are otherwise unobtainable.
- Passively attract villagers and wandering traders to your island so long as you have a bell, an unclaimed bed or two, and a water source close by. No need to spawn and curse zombie villagers. You can trade with villagers using a new currency: Cobbledollars.
- Difficult trainer battles with NPCs that all use a double battle ruleset.
- Summon gym leaders (and eventually Pokémon league members) to your island in order to battle them to raise your level cap (and get loot).
- Building high up turns rain into snow and freezes water allowing you to obtain these important blocks without going far away from your island spawn.
- Updated fishing loot. Both junk and treasure are more common, and new items have been added to the pool.
- Potions and water bottles now stack.
- Certain vanilla items (Ender Pearls, Phantom Membrane, Shulker Boxes) have new names and recipes to match the Pokémon aesthetic.
- And lore to uncover about why exactly you find yourself floating in a sea of nothingness...
- And more!

## Mods
- NEED TO FINISH

## Utility + Library Mods

- [Accessories](https://modrinth.com/mod/accessories)
- [Advanced Loot Info](https://modrinth.com/mod/advanced-loot-info)
- [Architectury API](https://modrinth.com/mod/architectury-api)
- [Athena](https://modrinth.com/mod/athena-ctm)
- [Balm](https://modrinth.com/mod/balm)
- [Better Advancements](https://modrinth.com/mod/better-advancements)
- [Bookshelf](https://modrinth.com/mod/bookshelf-lib)
- [Catch Indicator](https://modrinth.com/mod/catch-indicator)
- [Clear Void](https://modrinth.com/mod/clear-void)
- [Entity Texture Features](https://modrinth.com/mod/entitytexturefeatures)

## Resourcepacks and Datapacks

- [AllTheMons x Mega Showdown](https://modrinth.com/datapack/allthemons-x-mega-showdown-legacy)

---

**\*License**: This modpack's source code and assets are licensed under the Mozilla Public License 2.0. This only includes code and assets original to the modpack, and not any of the content from other mods included in the modpack. All included mods are property of their original authors.\*

**_Cobbleblock is not affiliated with Pokémon nor Minecraft._**

_Minecraft is a trademark of Mojang Synergies AB ｜ Pokémon is a trademark of Nintendo, Creatures Inc. and GAME FREAK inc._

---

## Development

### Generate Data and Serve Development Server

```sh
bun run --cwd scripts generate && packwiz refresh && packwiz serve
```

### MultiMC Pre-launch Command

```
$INST_JAVA -jar $INST_DIR/packwiz-installer-bootstrap.jar http://localhost:8080/pack.toml
```
