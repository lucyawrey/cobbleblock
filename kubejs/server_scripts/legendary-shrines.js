const blockMap = {
  "minecraft:fire": "Fire",
  "minecraft:water": "Water",
  "minecraft:lava": "Lava",
};

// Cooldown
const cooldownTime = 1000;
let lastClickTime = Date.now();

for (let pokemon of global.legendaryPokemon) {
  BlockEvents.rightClicked(
    `cobbleblock:${pokemon.id}_shrine`,
    shrineEvent(pokemon),
  );
}

function shrineEvent(pokemon) {
  return (event) => {
    // Cooldown
    if (Date.now() < lastClickTime + cooldownTime) {
      return;
    }
    lastClickTime = Date.now();

    let { block, level, player, server } = event;
    let counted = {};

    // Handle offering coins
    if (pokemon.takesCoins && player.mainHandItem.id === "cobblemon:relic_coin") {
      player.mainHandItem.shrink(1);
      player.tell(`§6You toss a coin in.`);
      return;
    }

    // Loop through bounding box to count nearby blocks
    let minX = block.x - 8;
    let minY = block.y - 8;
    let minZ = block.z - 8;
    let maxX = block.x + 8;
    let maxY = block.y + 8;
    let maxZ = block.z + 8;
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          let block = level.getBlock(x, y, z);
          let id = block.id;
          if (id === "mega_showdown:pedestal") {
            let itemId = block.getEntityData().Item?.id;
            if (itemId) {
              // Handle issue where ID string gotten from entity data contains quotes.
              counted[itemId.toString().replaceAll('"', "")] = 1;
            }
          }
          if (!counted[id]) {
            counted[id] = 1;
          } else {
            counted[id] = counted[id] + 1;
          }
        }
      }
    }
    console.log(counted);
    // Check if counted blocks match the block requirements for a the current legendary Pokémon.
    let meetsRequirements = true;
    let missingRequirements = [];
    for (let [key, value] of Object.entries(pokemon.required)) {
      if (!counted[key] || counted[key] < value) {
        meetsRequirements = false;
        let itemName = blockMap[key]
          ? blockMap[key]
          : Item.of(key).hoverName.string;
        let missingNo = value - (counted[key] || 0);
        missingRequirements.push(`${missingNo}× ${itemName}`);
      }
    }

    if (meetsRequirements) {
      if (player.mainHandItem.id === pokemon.summonItem) {
        player.tell(`§b§l${pokemon.name} is coming.`);
        server.runCommandSilent(
          `playsound minecraft:block.end_portal.spawn block @p ${block.x} ${block.y} ${block.z}`,
        );
        player.mainHandItem.shrink(1);
        // Spawn loot item
        if (pokemon.lootItem && pokemon.lootItem !== "minecraft:air") {
          let itemEntity = level.createEntity("minecraft:item");
          itemEntity.setPos(block.x + 0.5, block.y + 2.0, block.z + 0.5);
          itemEntity.item = Item.of(pokemon.lootItem, 1);
          itemEntity.spawn();
        }
        // Spawn Pokémon
        server.scheduleInTicks(100, () => {
          let data = pokemon.data ? `${pokemon.data} ` : "";
          let shiny = Math.random() < 1 / 4096 ? "shiny " : "";
          server.runCommandSilent(
            `spawnpokemonat ${block.x + 1 + Math.random() * 4} ${block.y} ${block.z + 1 + Math.random() * 4} ${pokemon.id} ${shiny}${data}level=${pokemon.level}`,
          );
        });
      } else if (player.mainHandItem.id === "minecraft:air") {
        player.tell(`The shrine to ${pokemon.name} is ready.`);
      } else {
        let itemName = Item.of(pokemon.summonItem).hoverName.string;
        player.tell(
          `That offering... it is not the right one. Bring the ${itemName} to this shrine.`,
        );
      }
    } else {
      player.tell(
        `The shrine to ${pokemon.name} is incomplete. Missing ${missingRequirements.join(", ")}.`,
      );
    }
    // Prevent Default
    event.cancel();
  };
}
