const types = [
  "bug",
  "dark",
  "dragon",
  "electric",
  "fairy",
  "fighting",
  "fire",
  "flying",
  "ghost",
  "grass",
  "ground",
  "ice",
  "normal",
  "poison",
  "psychic",
  "rock",
  "steel",
  "water",
];
const outputPath =
  "./config/paxi/datapacks/Cobbleblock/data/cobbleblock/recipe/crafting_shaped";

for (const type of types) {
  const content = {
    type: "minecraft:crafting_shaped",
    category: "misc",
    key: {
      S: {
        item: `mega_showdown:${type}_tera_shard`,
      },
      G: {
        tag: "c:gems",
      },
    },
    pattern: [" S ", "SGS", " S "],
    result: {
      count: 1,
      id: `cobblemon:${type}_gem`,
    },
  };
  const json = JSON.stringify(content, undefined, 2);
  const filePath = `${outputPath}/${type}_gem.json`;
  await Bun.write(filePath, json);
  console.log(`Created file: ${filePath}`);
}

export {};
