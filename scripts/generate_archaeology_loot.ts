import { parse } from "csv-parse/sync";
import { pullCsv } from "./lib";

const gravelOutPath =
  "../config/paxi/datapacks/Cobbleblock/data/cobbleblock/loot_table/archaeology/suspicious_gravel.json";
const sandOutPath =
  "../config/paxi/datapacks/Cobbleblock/data/cobbleblock/loot_table/archaeology/suspicious_sand.json";
const targetGravel = `https://docs.google.com/spreadsheets/d/1FWfVOOkkR-UtFYkn13PoNO_Y5szipLEBCEys_gZecF0/gviz/tq?tqx=out:csv&sheet=sus_gravel`;
const targetSand = `https://docs.google.com/spreadsheets/d/1FWfVOOkkR-UtFYkn13PoNO_Y5szipLEBCEys_gZecF0/gviz/tq?tqx=out:csv&sheet=sus_sand`;
const gravelSequence = "cobbleblock:archaeology/suspicious_gravel";
const sandSequence = "cobbleblock:archaeology/suspicious_sand";

const baseGravelLoot = [
  {
    type: "minecraft:item",
    functions: [
      {
        function: "minecraft:set_components",
        components: {
          "minecraft:custom_data": {
            torn_page_id: "page_3_archaeology",
          },
          "minecraft:item_name": "'Torn Page #3 (Archaeology)'",
        },
      },
    ],
    name: "cobbleblock:torn_page",
    weight: 1,
  },
];

generateArcheologyLoot(
  gravelOutPath,
  targetGravel,
  gravelSequence,
  baseGravelLoot,
);
generateArcheologyLoot(sandOutPath, targetSand, sandSequence, []);

async function generateArcheologyLoot(
  outPath: string,
  target: string,
  sequence: string,
  baseLoot: any[] = [],
) {
  const data: any[] = parse(await pullCsv(target), {
    columns: true,
    skip_empty_lines: true,
  });

  const lootTable: any = {
    type: "minecraft:archaeology",
    pools: [
      {
        bonus_rolls: 0.0,
        entries: structuredClone(baseLoot),
        rolls: 1.0,
      },
    ],
    random_sequence: sequence,
  };

  for (const row of data) {
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
  Bun.write(outPath, json);
  console.log(`Generated archeology drop table ${outPath}.`);
}

function parseString(value: any): string {
  return value?.toString()?.trim() || "";
}
