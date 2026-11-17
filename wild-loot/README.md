# Cobblemon: Wild Loot
A Cobblemon mod that gives Pokémon a chance to randomly drop items from their loot tables at their current location. Unlike similar mods, it works with wild Pokémon and party Pokémon (so long as they are let out of their Pokéballs) too!

Adds a new storage block, the Pokébasket, which automatically collects passive Pokémon drops within a configurable (default 12) block radius. It can be crafted with any 4 apricorns of any color and 3 sticks.

![Crafting recipe for a Pokébasket.](https://cdn.modrinth.com/data/cached_images/ca74e8c2b08836f2beb9584a95062c33b368d16e.png)

## Credits
- Based on [Cobblemon Pasture Loot](https://modrinth.com/mod/cobblemon-pasture-loot).
- Uses basket model from Farmer's Delight.

## Dependencies
- [Cobblemon](https://modrinth.com/mod/cobblemon)
- [Architectury API](https://modrinth.com/mod/architectury-api)

## Configuration
You can edit the config file at `config/CobblemonWildLoot.json` to change settings.
- `tick_per_minute`: The number of ticks per minute. Should stay at 1200 unless you change the game's tick rate to a value other than the default `20`.
- `drop_chance_per_minute`: The default chance for each Pokémon to drop loot is a 5% chance per minute.
- `pokebasket_block_radius`: Distance in blocks at which Pokébaskets will automatically collect items from nearby Pokémon.
- `item_blacklist`: A list of items that should not be dropped by Pokémon.
```json
{
  "tick_per_minute": 1200,
  "drop_chance_per_minute": 0.05,
  "pokebasket_block_radius": 12,
  "item_blacklist": [
    "minecraft:porkchop",
    "minecraft:beef",
    "minecraft:chicken",
    "minecraft:mutton",
    "minecraft:rabbit",
    "minecraft:fish",
    "minecraft:cooked_porkchop",
    "minecraft:cooked_beef",
    "minecraft:cooked_chicken",
    "minecraft:cooked_mutton",
    "minecraft:cooked_rabbit",
    "minecraft:cooked_fish",
    "minecraft:leather",
    "minecraft:bone",
    "minecraft:spider_eye",
    "minecraft:rotten_flesh",
    "minecraft:rabbit_hide",
    "minecraft:rabbit_foot",
    "minecraft:cod",
    "minecraft:pufferfish",
    "minecraft:bone_block",
    "minecraft:bone_meal",
    "cobblemon:sharp_beak",
    "minecraft:honey_bottle",
    "minecraft:salmon",
    "minecraft:white_wool"
  ]
}
```
