// Cooldown
let bellCooldownTime = 1000;
let bellLastClickTime = Date.now();

// Villager summoning mechanic
BlockEvents.rightClicked("minecraft:bell", (event) => {
  // Cooldown
  if (Date.now() < bellLastClickTime + bellCooldownTime) {
    return;
  }
  bellLastClickTime = Date.now();

  let { player, level, server } = event;
  server.schedule(10, () => {
    let [res, _] = villageCheck(player, level, 32);
    let message =
      res === "all"
        ? "The village is ready for guests and new members."
        : res === "villagers"
          ? "The village is ready for new members."
          : res === "traders"
            ? "The village is ready for guests."
            : res === "none"
              ? "There are plenty of people already."
              : "No one will come without water, a place to sleep, and open space around this gathering point.";
    player.tell(message);
  });
});

/**
 * @param {{x: number, y: number, z: number}} vec
 * @returns {{x: number, y: number, z: number} | undefined}
 */
function findSafe(vec, level) {
  let minX = vec.x - 4;
  let minY = vec.y - 4;
  let minZ = vec.z - 4;
  let maxX = vec.x + 4;
  let maxY = vec.y + 2;
  let maxZ = vec.z + 4;
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        if (level.getBlock(x, y, z).id === "minecraft:air") {
          let floor = level.getBlock(x, y - 1, z);
          if (
            floor.id !== "minecraft:air" &&
            floor.id !== "minecraft:lava" &&
            floor.id !== "minecraft:water" &&
            floor.id !== "minecraft:bell"
          ) {
            return { x: x, y: y, z: z };
          }
        }
      }
    }
  }
  return undefined;
}

/**
 * @return {["invalid" | "none" | "traders" | "villagers" | "all", {x: number, y: number, z: number} | undefined]}
 */
function villageCheck(player, level, blockRadius) {
  let bell = undefined;
  let water = 0;
  let beds = 0;
  let freeBeds = 0;
  let villagers = 0;
  let traders = 0;

  let minX = player.x - blockRadius;
  let minY = player.y - blockRadius / 4;
  let minZ = player.z - blockRadius;
  let maxX = player.x + blockRadius;
  let maxY = player.y + blockRadius / 4;
  let maxZ = player.z + blockRadius;
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        let blockTest = level.getBlock(x, y, z);
        if (blockTest.hasTag("minecraft:beds")) {
          beds++;
        }
        if (blockTest.id === "minecraft:water") {
          water++;
        }
        if (blockTest.id === "minecraft:bell") {
          bell = { x: x, y: y, z: z };
        }
      }
    }
  }
  beds = Math.ceil(beds / 3);

  let entities = player.level.getEntitiesWithin(
    player.boundingBox.inflate(blockRadius),
  );
  entities.forEach((entity) => {
    if (entity.type === "minecraft:villager") {
      villagers++;
    }
    if (entity.type === "minecraft:wandering_trader") {
      traders++;
    }
  });

  if (water > 3 && beds > 0 && bell) {
    let spawnVillagers = beds > villagers;
    let spawnTraders = traders === 0;
    let safe = findSafe(bell, level);
    if (safe) {
      return [
        spawnVillagers && spawnTraders
          ? "all"
          : spawnVillagers
            ? "villagers"
            : spawnTraders
              ? "traders"
              : "none",
        safe,
      ];
    }
  }
  return ["invalid", undefined];
}

// 10 minutes
let period = 10 * 60 * 1000;

ServerEvents.loaded((event) => {
  function spawnVillagerTask(callback) {
    event.server.schedule(period, spawnVillagerTask);
    event.server.players.forEach((player) => {
      let level = player.level;
      /** @type {"invalid" | "none" | "traders" | "villagers" | "all"} */
      let check = "invalid";
      /** @type {{x: number, y: number, z: number} | undefined}*/
      let safe = undefined;

      let entityId = undefined;
      if (Math.random() < 0.5) {
        [check, safe] = villageCheck(player, level, 32);
        if (check === "all" || check === "villagers") {
          entityId = "minecraft:villager";
        }
      }

      if (!entityId && Math.random() < 0.3) {
        [check, safe] = villageCheck(player, level, 32);
        if (check === "all" || check == "traders") {
          entityId = "minecraft:wandering_trader";
        }
      }

      if (entityId) {
        let message =
          entityId === "minecraft:wandering_trader"
            ? "A wandering trader has arrived."
            : "A new villager has joined your island.";
        let data =
          entityId === "minecraft:wandering_trader"
            ? "{DespawnDelay:36000}"
            : "{PersistenceRequired:1b}";
        event.server.runCommandSilent(
          `summon ${entityId} ${safe.x + 0.8} ${safe.y} ${safe.z + 0.8} ${data}`,
        );
        player.tell(message);
      }
    });
  }
  event.server.schedule(period, spawnVillagerTask);
});

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Custom trades
MoreJS.wandererTrades((event) => {
  event.addTrade(
    1,
    Item.of("minecraft:emerald", 4),
    "cobblemon:red_apricorn_seed",
  );
  event.addTrade(
    1,
    Item.of("minecraft:emerald", 4),
    "cobblemon:yellow_apricorn_seed",
  );
  event.addTrade(
    1,
    Item.of("minecraft:emerald", 4),
    "cobblemon:green_apricorn_seed",
  );
  event.addTrade(
    1,
    Item.of("minecraft:emerald", 4),
    "cobblemon:blue_apricorn_seed",
  );
  event.addTrade(
    1,
    Item.of("minecraft:emerald", 4),
    "cobblemon:pink_apricorn_seed",
  );
  event.addTrade(
    1,
    Item.of("minecraft:emerald", 4),
    "cobblemon:black_apricorn_seed",
  );
  event.addTrade(
    1,
    Item.of("minecraft:emerald", 4),
    "cobblemon:white_apricorn_seed",
  );
  event.addTrade(
    1,
    Item.of("minecraft:emerald", 2),
    "mega_showdown:max_mushroom",
  );
  event.addTrade(1, Item.of("minecraft:emerald", 5), "cobblemon:revival_herb");
});
