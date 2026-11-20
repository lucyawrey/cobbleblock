import { Glob } from "bun";
import { pullCsv } from "./lib";
import { parse } from "csv-parse/browser/esm/sync";

const ignoreList = [
  "articuno",
  "zapdos",
  "moltres",
  "mewtwo",
  "mew",
  "raikou",
  "entei",
  "suicune",
  "lugia",
  "hooh",
  "celebi",
  "regirock",
  "regice",
  "registeel",
  "latias",
  "latios",
  "kyogre",
  "groudon",
  "rayquaza",
  "jirachi",
  "deoxys",
  "uxie",
  "mesprit",
  "azelf",
  "dialga",
  "palkia",
  "heatran",
  "regigigas",
  "giratina",
  "cresselia",
  "phione",
  "manaphy",
  "darkrai",
  "shaymin",
  "arceus",
  "victini",
  "cobalion",
  "terrakion",
  "tornadus",
  "thundurus",
  "reshiram",
  "zekrom",
  "landorus",
  "kyurem",
  "keldeo",
  "meloetta",
  "genesect",
  "xerneas",
  "yveltal",
  "zygarde",
  "diancie",
  "hoopa",
  "volcanion",
  "typenull",
  "tapukoko",
  "tapulele",
  "tapubulu",
  "tapufini",
  "cosmog",
  "necrozma",
  "magearna",
  "marshadow",
  "zeraora",
  "meltan",
  "zacian",
  "zamazenta",
  "eternatus",
  "kubfu",
  "zarude",
  "regieleki",
  "regidrago",
  "glastrier",
  "spectrier",
  "calyrex",
  "enamorus",
  "wochien",
  "chienpao",
  "chiyu",
  "koraidon",
  "miraidon",
  "walkingwake",
  "okidogi",
  "munkidori",
  "fezandipiti",
  "ogerpon",
  "gougingfire",
  "ragingbolt",
  "ironcrown",
  "terapagos",
  "pecharunt",
  "hisuian",
  "wochien",
  "h",
  "a",
  "ff",
  "galarian",
  "alolan",
  "nid",
  "cosmetic",
  "ine",
  "trik",
  "in",
  "n",
  "trash",
  "mrrime",
  "mrmime",
  "r",
  "herd",
  "mimejr",
  "bloodmoon",
];

const idMap: any = {
  hakamoo: "hakamo-o",
  sandy: "sandy-shocks",
  porygonz: "porygon-z",
  jangmoo: "jangmo-o",
  nidoranf: "nidoran-f",
  nidoranm: "nidoran-m",
  kommoo: "kommo-o",
  brutebonnet: "brute-bonnet",
  ironthorns: "iron-thorns",
  ironleaves: "iron-leaves",
  greattusk: "great-tusk",
  sandyshocks: "sandy-shocks",
  walkingwake: "walking-wake",
  ironvaliant: "iron-valiant",
  irontreads: "iron-treads",
  roaringmoon: "roaring-moon",
  ironcrown: "iron-crown",
  ironbundle: "iron-bundle",
  fluttermane: "flutter-mane",
  screamtail: "scream-tail",
  ironmoth: "iron-moth",
  slitherwing: "slither-wing",
};

const path = "./reference_data/data";
const outputPath = "./spawn_data.csv";
const cachePath = "./script_cache.json";
const biomesSheetUrl = `https://docs.google.com/spreadsheets/d/1us4UrjvnVnCXadYZjgCOBIFmpio8BzGJ8O5L6yuLTfs/gviz/tq?tqx=out:csv&sheet=biomes`;

let biomes: Record<string, string> = {};
(
  parse(await pullCsv(biomesSheetUrl), {
    columns: true,
    skip_empty_lines: true,
  }) as { biome?: string; neededNearbyBlocks?: string }[]
).forEach((item) => {
  if (item.biome && item.neededNearbyBlocks) {
    biomes[item.biome] = item.neededNearbyBlocks;
  }
});
let pokemon: any[];
const csvLines = [
  "dex,pokemon,obtainability,bucket,weight,level,dimension,types,timeRange,canSeeSky,illumination,weather,height,moonPhase,alternateForm,neededNearbyBlocks,data,lureLevel1,lureWeight1,lureLevel2,lureWeight2",
];

pokemon = await Bun.file(cachePath)
  .json()
  .catch(() => null);
if (!pokemon || !Array.isArray(pokemon)) {
  pokemon = [];
  await getPokemon(path);
  await Bun.write(cachePath, JSON.stringify(pokemon));
}

// Optionally handle forms.
for (let poke of [...pokemon]) {
  if (!poke?.spawns) continue;
  for (let spawn of poke.spawns) {
    let name = `${spawn?.pokemon}`;
    let tokens = name.split(" ");
    if (tokens.length > 1 && !tokens[1]?.includes("min_perfect_ivs")) {
      let newEntry = {
        id: name,
        dex: poke?.dex,
        spawns: [spawn],
        alternateForm: true,
      };
      if (!pokemon.some((mon) => mon?.id === name)) {
        pokemon.splice(pokemon.indexOf(poke) + 1, 0, newEntry);
      }
    }
  }
}

for (let i = 0; i < pokemon.length; i++) {
  if (!pokemon[i]?.spawns?.[0]) {
    csvLines.push(",,,,,,,,,,,,,,,,");
    continue;
  }
  let poke = pokemon[i];
  let spawns = poke?.spawns;
  let json = JSON.stringify(poke);
  let spawn0 = spawns?.[0];
  let dex = poke?.dex || "";
  let id = poke?.id || "";
  dex = id ? dex : "";
  let bucket = spawn0?.bucket || "";
  let level = spawn0?.level || "";
  let weight = spawn0?.weight || "";
  let dimension =
    json.includes("#cobblemon:nether/is") ||
    json.includes("#minecraft:is_nether")
      ? json.includes("#cobblemon:is")
        ? "any"
        : "the_nether"
      : "overworld";
  let types: string[] = [
    ...new Set(
      spawns?.map((spawn: any) => {
        if (!spawn?.spawnablePositionType) return "";
        switch (spawn.spawnablePositionType) {
          case "grounded":
            if (spawn.presets?.includes("treetop")) {
              return "treetop";
            }
            return "ground";
          case "submerged":
            if (spawn.presets?.includes("lava")) {
              return "lava";
            }
            return "dive";
          case "surface":
            if (spawn.presets?.includes("lava")) {
              return "lava";
            }
            return "surf";
          case "fishing":
            return "fishing";
          default:
            return "";
        }
      }),
    ),
  ].filter((item) => item) as string[];
  let timeRange = spawn0?.condition?.timeRange || "any";
  let weather = spawn0?.condition?.isThundering
    ? "isThundering"
    : spawn0?.condition?.isRaining
      ? "isRaining"
      : "any";
  let moonPhase = spawn0?.condition?.moonPhase || "any";
  let minY = parseInt(spawn0?.condition?.minY);
  let maxY = parseInt(spawn0?.condition?.maxY);
  let height = maxY && maxY <= 0 ? "low" : minY && minY >= 1 ? "high" : "any";
  let maxSkyLight = parseInt(spawn0?.condition?.maxSkyLight);
  let minSkyLight = parseInt(spawn0?.condition?.minSkyLight);
  let maxLight = maxSkyLight
    ? maxSkyLight
    : parseInt(spawn0?.condition?.maxLight);
  let minLight = minSkyLight
    ? minSkyLight
    : parseInt(spawn0?.condition?.minLight);
  let canSeeSky =
    maxSkyLight || minSkyLight || spawn0?.condition?.canSeeSky == true
      ? "yes"
      : spawn0?.condition?.canSeeSky == false
        ? "no"
        : "any";
  let illumination =
    minLight && minLight >= 7
      ? "light"
      : maxLight && maxLight <= 7
        ? "dark"
        : "any";
  let alternateForm = poke?.alternateForm ? "yes" : "no";
  let neededNearbyBlocks = await getNeededNearbyBlocks(spawns);
  let data = "";
  if (spawn0?.pokemon.includes("min_perfect_ivs=3")) {
    data = "min_perfect_ivs=3";
  }
  // Fishing
  let fishingCondition1 = "";
  let fishingWeight1 = "";
  let fishingCondition2 = "";
  let fishingWeight2 = "";
  let fishingSpawn = spawns?.find(
    (spawn: any) => spawn?.spawnablePositionType === "fishing",
  );
  let weightMultiplier1 = fishingSpawn?.weightMultipliers?.[0];
  let weightMultiplier2 = fishingSpawn?.weightMultipliers?.[1];
  if (weightMultiplier1) {
    if (weightMultiplier1.condition?.minLureLevel) {
      fishingCondition1 += weightMultiplier1.condition.minLureLevel.toString();
      if (weightMultiplier1.condition?.maxLureLevel) {
        fishingCondition1 += `-${weightMultiplier1.condition.maxLureLevel}`;
      }
    }
    fishingWeight1 = fishingCondition1
      ? weightMultiplier1.multiplier || ""
      : "";
  }
  if (weightMultiplier2) {
    if (weightMultiplier2.condition?.minLureLevel) {
      fishingCondition2 += weightMultiplier2.condition.minLureLevel.toString();
      if (weightMultiplier2.condition?.maxLureLevel) {
        fishingCondition2 += `-${weightMultiplier2.condition.maxLureLevel}`;
      }
    }
    fishingWeight2 = fishingCondition2
      ? weightMultiplier2.multiplier || ""
      : "";
  }

  csvLines.push(
    `"${dex}","${id}",,"${bucket}","${weight}","${level}","${dimension}","${types.join(", ")}","${timeRange}","${canSeeSky}","${illumination}","${weather}","${height}","${moonPhase}",${alternateForm},"${neededNearbyBlocks.join(", ")}",${data},${fishingCondition1},${fishingWeight1},${fishingCondition2},${fishingWeight2}`,
  );
}

Bun.write(outputPath, csvLines.join("\n"));
console.log(`Spawn data generated and saved to ${outputPath}`);

async function getNeededNearbyBlocks(spawns: any[]) {
  let blocks: string[] = [];
  for (let spawn of spawns) {
    let nearbyBlocks = spawn?.condition?.neededNearbyBlocks;
    if (nearbyBlocks && Array.isArray(nearbyBlocks)) {
      blocks = blocks.concat(nearbyBlocks);
    }
    if (spawn?.condition?.biomes) {
      for (let biome of spawn.condition.biomes) {
        if (biomes[biome]) {
          let biomeBlocks = biomes[biome].split(",").map((s) => s.trim());
          blocks = blocks.concat(biomeBlocks);
        }
      }
    }
  }
  return [...new Set(blocks)].filter((s) => !s.includes("aether"));
}

async function getPokemon(path: string) {
  for (let filePath of new Glob("**/*.json").scanSync(path)) {
    try {
      let match = /([a-z]+)(?:_[a-z_]+)?\.json/.exec(filePath);
      if (match) {
        if (!match[1]) continue;
        let id = match[1];
        if (ignoreList.includes(id)) {
          continue;
        }
        let dbId = idMap[id] ? idMap[id] : id;
        let res = await fetch(
          `https://pokeapi.co/api/v2/pokemon-species/${dbId}`,
        );
        if (res.ok) {
          let data = (await res.json()) as { id: number };
          let dex = data.id;
          const json = await Bun.file(`${path}/${filePath}`).json();
          if (json && json.spawns) {
            if (pokemon[dex - 1]?.spawns) {
              pokemon[dex - 1].spawns = pokemon[dex - 1].spawns.concat(
                json.spawns,
              );
            } else {
              pokemon[dex - 1] = {
                id,
                dex,
                spawns: json.spawns,
                alternateForm: false,
              };
            }
          }
        } else {
          console.error(`${id}`);
        }
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }
}
