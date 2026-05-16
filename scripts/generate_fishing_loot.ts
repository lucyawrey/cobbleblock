import { parse } from "csv-parse/sync";
import { pullCsv } from "./lib";

const vanillaJunk = [
  {
    type: "minecraft:item",
    functions: [
      {
        function: "minecraft:set_components",
        components: {
          "minecraft:custom_data": {
            torn_page_id: "page_2_fishing",
          },
          "minecraft:item_name": "'Torn Page #2 (Fishing)'",
        },
      },
    ],
    name: "cobbleblock:torn_page",
    weight: 1,
  },
  {
    type: "minecraft:item",
    functions: [
      {
        add: false,
        damage: {
          type: "minecraft:uniform",
          max: 0.9,
          min: 0.0,
        },
        function: "minecraft:set_damage",
      },
    ],
    name: "minecraft:leather_boots",
    weight: 1,
  },
  {
    type: "minecraft:item",
    functions: [
      {
        function: "minecraft:set_potion",
        id: "minecraft:water",
      },
    ],
    name: "minecraft:potion",
    weight: 1,
  },
  {
    type: "minecraft:item",
    functions: [
      {
        add: false,
        damage: {
          type: "minecraft:uniform",
          max: 0.9,
          min: 0.0,
        },
        function: "minecraft:set_damage",
      },
    ],
    name: "minecraft:fishing_rod",
    weight: 0.3,
  },
];

const vanillaTreasure = [
  {
    type: "minecraft:item",
    functions: [
      {
        add: false,
        damage: {
          type: "minecraft:uniform",
          max: 0.25,
          min: 0.0,
        },
        function: "minecraft:set_damage",
      },
      {
        function: "minecraft:enchant_with_levels",
        levels: 30.0,
        options: "#minecraft:on_random_loot",
      },
    ],
    name: "minecraft:bow",
    weight: 1,
  },
  {
    type: "minecraft:item",
    functions: [
      {
        add: false,
        damage: {
          type: "minecraft:uniform",
          max: 0.25,
          min: 0.0,
        },
        function: "minecraft:set_damage",
      },
      {
        function: "minecraft:enchant_with_levels",
        levels: 30.0,
        options: "#minecraft:on_random_loot",
      },
    ],
    name: "minecraft:fishing_rod",
    weight: 1,
  },
  {
    type: "minecraft:item",
    functions: [
      {
        function: "minecraft:enchant_with_levels",
        levels: 30.0,
        options: "#minecraft:on_random_loot",
      },
    ],
    name: "minecraft:book",
    weight: 1,
  },
];

const outPath = `../config/paxi/datapacks/Cobbleblock/data/minecraft/loot_table/gameplay/fishing`;
const targetSheet = `https://docs.google.com/spreadsheets/d/1FWfVOOkkR-UtFYkn13PoNO_Y5szipLEBCEys_gZecF0/gviz/tq?tqx=out:csv&sheet=fishing`;
const files = {
  junk: "minecraft:gameplay/fishing/junk",
  treasure: "minecraft:gameplay/fishing/treasure",
};
const ext = ".json";

const data: any[] = parse(await pullCsv(targetSheet), {
  columns: true,
  skip_empty_lines: true,
});

for (var [key, value] of Object.entries(files)) {
  generateFishingLoot(key, value);
}

async function generateFishingLoot(file: string, sequence: string) {
  const lootTable: any = {
    type: "minecraft:fishing",
    pools: [
      {
        bonus_rolls: 0.0,
        entries:
          file === "treasure"
            ? structuredClone(vanillaTreasure)
            : file === "junk"
              ? structuredClone(vanillaJunk)
              : [],
        rolls: 1.0,
      },
    ],
    random_sequence: sequence,
  };

  for (const row of data) {
    if (parseString(row.table) !== file) {
      continue;
    }
    const drop = {
      type: "minecraft:item",
      name: parseString(row.item),
      weight: parseFloat(row.weight),
    };

    if (drop.name && drop.weight && drop.weight > 0) {
      lootTable.pools[0].entries.push(drop);
    }
  }

  const json = JSON.stringify(lootTable, null, 2);
  Bun.write(`${outPath}/${file}${ext}`, json);
  console.log(`Generated archeology drop table ${outPath}/${file}${ext}.`);
}

function parseString(value: any): string {
  return value?.toString()?.trim() || "";
}
