import { parse } from "csv-parse/sync";

const outPath =
  "../config/paxi/datapacks/Cobbleblock/data/cobbleblock/species_additions";

// Pull CSV from Google Sheets
const target = `https://docs.google.com/spreadsheets/d/1FWfVOOkkR-UtFYkn13PoNO_Y5szipLEBCEys_gZecF0/gviz/tq?tqx=out:csv&sheet=drops`;
let rawData = "";
try {
  const res = await fetch(target, {
    method: "get",
    headers: {
      "content-type": "text/csv;charset=UTF-8",
    },
  });

  if (res.status === 200) {
    rawData = await res.text();
  } else {
    console.error(`Error code ${res.status}.`);
    process.exit(-1);
  }
} catch (error) {
  console.error(error);
  process.exit(-1);
}

const data: any[] = parse(rawData, {
  columns: true,
  skip_empty_lines: true,
});

for (const row of data) {
  const drops: { item: string; chance: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const item = (row[`drop${i}`]);
    const chance = (row[`chance${i}`]);
    if (item) {
      drops.push({ item, chance: chance || "1" });
    }
  }

  const pokemon = {
    dex_number: parseInt(row.dex || "0"),
    pokemon: parseString(row.pokemon),
    override: row.override === "yes",
    drops,
  };

  if (
    pokemon.dex_number > 0 &&
    pokemon.pokemon &&
    pokemon.override
  ) {
    const species_addition = {
      target: `cobblemon:${pokemon.pokemon}`,
      drops: {
        amount: pokemon.drops.length,
        entries: drops.map((drop) => {
          let drops: { item: string; quantityRange?: string; percentage?: number } = {
            item: drop.item,
          };
          if (drop.chance && drop.chance != "1" && drop.chance != "100%") {
            if (drop.chance.endsWith("%")) {
              drops.percentage = parseFloat(drop.chance.slice(0, -1));
            } else {
              drops.quantityRange = drop.chance;
            }
          }
          return drops;
        }),
      },
    };

    // Write out spawn pool file to datapack
    const filename = `${outPath}/${pokemon.dex_number.toString().padStart(4, "0")}_${pokemon.pokemon}.json`;
    const json = JSON.stringify(species_addition, null, 2);
    Bun.write(filename, json);
    console.log(
      `Generated drop table species addition "${filename}" for Pokemon #${pokemon.dex_number}: ${pokemon.pokemon}.`,
    );
  }
}

function parseString(value: any): string {
  return value?.toString()?.trim() || "";
}

function parseStringSplit(value: any): string[] {
  return parseString(value)
    .split(" ")
    .map((block) => block.trim())
    .filter((block) => block);
}
