global.legendaryPokemon = [
  {
    id: "articuno",
    name: "Articuno",
    level: "60",
    data: "min_perfect_ivs=3",
    summonPedestal: "cobbleblock:articuno_pedestal",
    newSummonPedestal: true,
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
    summonPedestal: "cobbleblock:zapdos_pedestal",
    newSummonPedestal: true,
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
    summonPedestal: "cobbleblock:moltres_pedestal",
    newSummonPedestal: true,
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
    summonPedestal: "cobbleblock:lugia_pedestal",
    newSummonPedestal: true,
    summonItem: "cobbleblock:fragile_ocarina",
    newSummonItem: true,
    lootItem: undefined,
    newLootItem: false,
    required: {
      "mega_showdown:pedestal": 3,
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
    summonPedestal: "cobbleblock:mew_pedestal",
    newSummonPedestal: true,
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
    id: "suicune",
    name: "Suicune",
    level: "60",
    data: "min_perfect_ivs=3",
    summonPedestal: "cobbleblock:suicune_pedestal",
    newSummonPedestal: true,
    summonItem: "cobbleblock:wave_amulet",
    newSummonItem: true,
    lootItem: "cobbleblock:blue_feather",
    newLootItem: true,
    required: {
      "minecraft:diamond_block": 3,
      "minecraft:water": 10,
      // TODO more blocks
    },
  },
];

global.extraItems = [
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
    // Pedestal blocks
    if (pokemon.newSummonPedestal) {
      event
        .create(`cobbleblock:${pokemon.id}_pedestal`)
        .fullBlock(false)
        .box(2, 0, 2, 14, 13, 14, true)
        .soundType("stone")
        .hardness(10.0)
        .resistance(100)
        .requiresTool(true)
        .tagBoth("minecraft:mineable/pickaxe")
        .tagBoth("cobbleblock:legendary_pedestals")
        .item((i) =>
          i.tooltip(
            `A pedestal that acts as a centerpiece for a shrine to ${pokemon.name}. It can tell you what else you need to summon that Pokémon...`,
          ),
        );
    }
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
