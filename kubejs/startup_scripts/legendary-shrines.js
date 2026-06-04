global.legendaryPokemon = [
  {
    id: "articuno",
    name: "Articuno",
    level: "60",
    data: "min_perfect_ivs=3",
    summonItem: "cobbleblock:arctic_wing",
    newSummonItem: true,
    lootItem: "cobbleblock:articuno_orb",
    newLootItem: true,
    required: {
      "minecraft:polished_diorite": 20,
      "minecraft:ice": 20,
      "minecraft:packed_ice": 10,
      "minecraft:blue_ice": 10,
      "minecraft:diamond_block": 1,
    },
  },
  {
    id: "zapdos",
    name: "Zapdos",
    level: "60",
    data: "min_perfect_ivs=3",
    summonItem: "cobbleblock:charged_wing",
    newSummonItem: true,
    lootItem: "cobbleblock:zapdos_orb",
    newLootItem: true,
    required: {
      "minecraft:yellow_concrete": 30,
      "minecraft:redstone_block": 10,
      "minecraft:redstone_torch": 6,
      "minecraft:lightning_rod": 2,
      "minecraft:gold_block": 2,
    },
  },
  {
    id: "moltres",
    name: "Moltres",
    level: "60",
    data: "min_perfect_ivs=3",
    summonItem: "cobbleblock:molten_wing",
    newSummonItem: true,
    lootItem: "cobbleblock:moltres_orb",
    newLootItem: true,
    required: {
      "minecraft:polished_blackstone": 30,
      "minecraft:fire": 10,
      "minecraft:netherrack": 10,
      "minecraft:nether_bricks": 10,
      "minecraft:iron_block": 3,
    },
  },
  {
    id: "lugia",
    name: "Lugia",
    level: "65",
    data: "min_perfect_ivs=3",
    summonItem: "cobbleblock:fragile_ocarina",
    newSummonItem: true,
    lootItem: undefined,
    newLootItem: false,
    required: {
      "mega_showdown:shrine": 3,
      "cobbleblock:articuno_orb": 1,
      "cobbleblock:zapdos_orb": 1,
      "cobbleblock:moltres_orb": 1,
      "minecraft:water": 10,
      "minecraft:prismarine": 20,
      "minecraft:lapis_block": 10,
      "minecraft:quartz_block": 10,
    },
  },
  {
    id: "mew",
    name: "Mew",
    level: "70",
    data: "min_perfect_ivs=3",
    summonItem: "cobbleblock:ancient_fossil",
    newSummonItem: true,
    lootItem: undefined,
    newLootItem: false,
    required: {
      "minecraft:diamond_block": 4,
      "minecraft:amethyst_block": 5,
      "minecraft:mossy_stone_bricks": 10,
      "minecraft:mossy_cobblestone": 10,
      "minecraft:cherry_planks": 10,
    },
  },
  {
    id: "hooh",
    name: "Ho-Oh",
    level: "60",
    data: "min_perfect_ivs=3",
    summonItem: "cobbleblock:rainbow_feather",
    newSummonItem: true,
    lootItem: undefined,
    newLootItem: false,
    takesCoins: true,
    box: [0, 0, 2, 16, 13, 14],
    required: {
      "minecraft:bell": 1,
      "minecraft:gold_block": 10,
      "minecraft:bamboo_planks": 10,
      "minecraft:cherry_planks": 10,
      "minecraft:crimson_planks": 10,
      "minecraft:deepslate_bricks": 10,
      "minecraft:deepslate_brick_stairs": 10,
    },
  },
];

global.extraItems = [
  {
    id: "cobbleblock:blue_feather",
    tooltip:
      "A feather dropped by Suicune. One of the three needed to craft the Rainbow Feather and summon Ho-Oh.",
  },
  {
    id: "cobbleblock:red_feather",
    tooltip:
      "A feather dropped by Entei. One of the three needed to craft the Rainbow Feather and summon Ho-Oh.",
  },
  {
    id: "cobbleblock:yellow_feather",
    tooltip:
      "A feather dropped by Raikou. One of the three needed to craft the Rainbow Feather and summon Ho-Oh.",
  },
  {
    id: "cobbleblock:ancient_fossil_piece",
    tooltip:
      "Use four of these it to craft an Ancient Fossil, or maybe try crushing it instead?",
  },
  {
    id: "cobbleblock:ancient_fossil_dust",
    tooltip: "A certain Pokémon's DNA could be extracted from this...",
  },
  {
    id: "cobbleblock:ancient_dna",
    name: "Ancient DNA",
    tooltip:
      "Your work is complete, this DNA should be able to clone the Ancient Pokémon Mew in a Ressurection Machine...",
  },
];

StartupEvents.registry("block", (event) => {
  for (let pokemon of global.legendaryPokemon) {
    // Shrine blocks
    let box = pokemon.box || [2, 0, 2, 14, 13, 14];
    event
      .create(`cobbleblock:${pokemon.id}_shrine`)
      .displayName(`${pokemon.name} Shrine`)
      .fullBlock(false)
      .box(box[0], box[1], box[2], box[3], box[4], box[5], true)
      .soundType("stone")
      .hardness(10.0)
      .resistance(100)
      .requiresTool(true)
      .tagBoth("minecraft:mineable/pickaxe")
      .tagBoth("cobbleblock:legendary_shrines")
      .item((i) =>
        i.tooltip(
          `The centerpiece for a shrine to ${pokemon.name}. It can tell you what else you need to summon that Pokémon...`,
        ),
      );
  }
});

StartupEvents.registry("item", (event) => {
  for (let pokemon of global.legendaryPokemon) {
    // Optionally create summon item
    if (pokemon.newSummonItem && pokemon.summonItem) {
      event
        .create(pokemon.summonItem)
        .tag("cobbleblock:legendary_summon_items")
        .tooltip(
          `The offering needed to summon ${pokemon.name} at it's shrine.`,
        );
    }
    if (pokemon.newLootItem && pokemon.lootItem) {
      event.create(pokemon.lootItem).tag("cobbleblock:legendary_summon_items");
    }
  }
  for (let item of global.extraItems) {
    let newItem = event
      .create(item.id)
      .tag("cobbleblock:legendary_summon_items");
    if (item.name) {
      newItem.displayName(item.name);
    }
    if (item.tooltip) {
      newItem.tooltip(item.tooltip);
    }
  }
});

// Creative tab
StartupEvents.modifyCreativeTab("cobbleblock:cobbleblock", (event) => {
  let lastItem = "cobbleblock:meteor_beacon";
  for (let pokemon of global.legendaryPokemon) {
    event.addAfter(lastItem, `cobbleblock:${pokemon.id}_shrine`);
    lastItem = `cobbleblock:${pokemon.id}_shrine`;
    // Optionally create summon item
    if (pokemon.newSummonItem && pokemon.summonItem) {
      event.addAfter(lastItem, pokemon.summonItem);
      lastItem = pokemon.summonItem;
    }
    if (pokemon.newLootItem && pokemon.lootItem) {
      event.addAfter(lastItem, pokemon.lootItem);
      lastItem = pokemon.lootItem;
    }
  }
  for (let item of global.extraItems) {
    event.addAfter(lastItem, item.id);
    lastItem = item.id;
  }
});
