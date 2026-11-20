const path = "../reference_data/species_drop_data.json";
const outputPath = "../drop_data.csv";

const dropData = await Bun.file(path)
  .json()
  .catch(() => null);
const csvLines = [
  `dex,pokemon,override,drop1,chance1,drop2,chance2,drop3,chance3,drop4,chance4,drop5,chance5,drop6,chance6,drop7,chance7,drop8,chance8,drop9,chance9,drop10,chance10,drop11,chance11,drop12,chance12,drop13,chance13,drop14,chance14,drop15,chance15,drop16,chance16,drop17,chance17,drop18,chance18,drop19,chance19,drop20,drop20`,
];

for (let drop of dropData) {
  let dex = drop?.dex;
  let id = drop?.id;
  let entries = drop?.drops?.entries;
  if (dex && id && entries) {
    injectTypeEntries(entries, drop?.primaryType, drop?.secondaryType);
    let line = `${dex},${id},yes`;

    // Hacky solution to place gems and shards at the end.
    let count = 0;
    let shards: any[] = [];
    let gems: any[] = [];

    for (let entry of entries) {
      if (entry?.item?.path.includes("shard")) {
        shards.push(entry);
      } else if (entry?.item?.path.includes("gem")) {
        gems.push(entry);
      } else {
        line += generateLine(entry);
        count++;
      }
    }
    line += ",".repeat((9 - count) * 2);
    for (let shard of shards) {
      line += generateLine(shard);
    }
    for (let gem of gems) {
      line += generateLine(gem);
    }
    csvLines[dex] = line;
  }
}

function generateLine(entry: any) {
  let line = `,${entry?.item?.namespace}:${entry?.item?.path}`;
  let percentage = entry?.percentage;
  let quantityRange = entry?.quantityRange;
  if (percentage && quantityRange) {
    if (percentage >= 100) {
      line += `,${quantityRange.first}-${quantityRange.last}`;
    } else {
      line += `,${Math.floor(quantityRange.first * (percentage / 100))}-${Math.ceil(quantityRange.last * (percentage / 100))}`;
    }
  } else if (percentage) {
    line += typeof(percentage) === "string" ? `,${percentage}` : `,${percentage}%`;
  } else if (quantityRange) {
    line += `,${quantityRange.first}-${quantityRange.last}`;
  } else {
    line += ",100%";
  }
  return line;
}

function injectTypeEntries(
  entries: any,
  primaryType?: string,
  secondaryType?: string,
) {
  let multi = Boolean(primaryType && secondaryType);
  if (primaryType) {
    injectForType(entries, primaryType, multi);
  }
  if (secondaryType) {
    injectForType(entries, secondaryType, multi);
  }
}

function injectForType(entries: any[], type: string, multi: boolean) {
  let gemNamespace = `cobblemon`;
  let gemPath = `${type}_gem`;
  let shardNamespace = `mega_showdown`;
  let shardPath = `${type}_tera_shard`;
  if (!entries.some((d) => d.item.path === gemPath)) {
    let drop = {
      item: {
        namespace: gemNamespace,
        path: gemPath,
      },
      percentage: multi ? "=items!B3" : "=items!B5",
    };
    entries.push(drop);
  }
  let drop = {
    item: {
      namespace: shardNamespace,
      path: shardPath,
    },
    percentage: multi ? "=items!B7" : "=items!B9",
  };
  entries.push(drop);
}

Bun.write(outputPath, csvLines.join("\n"));
console.log(`Drop data generated and saved to ${outputPath}`);
