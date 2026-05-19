// Visit the wiki for more info - https://kubejs.com/
console.info("Loaded KubeJs startup scripts.");

// Add custom Suspicious Cobblestone item
StartupEvents.registry("block", (event) => {
  event
    .create("cobbleblock:suspicious_cobblestone")
    .displayName("Suspicious Cobblestone")
    .soundType("stone")
    .hardness(2.0)
    .resistance(10.0)
    .requiresTool(true)
    .tagBoth("minecraft:cobblestone") // Makes it behave like cobblestone
    .tagBoth("minecraft:mineable/pickaxe") // Requires a pickaxe
    .item((i) =>
      i.tooltip(
        "This cobblestone seems like it might have something inside it... Try crushing it and unearthing it's contents with a brush.",
      ),
    );
});

// Meteor Beacon
StartupEvents.registry("block", (event) => {
  event
    .create("cobbleblock:meteor_beacon")
    .displayName("Meteor Beacon")
    .renderType("cutout")
    .fullBlock(false)
    .box(6, 0, 6, 9, 14, 9, true)
    .soundType("stone")
    .hardness(3.0)
    .resistance(10)
    .requiresTool(true)
    .tagBoth("minecraft:mineable/pickaxe")
    .item((i) =>
      i.tooltip(
        "This beacon attracts meteors from outer space. Place it down and stay far away until the crash is over.",
      ),
    )
    .randomTick((event) => {
      // 3.5% chance to activate every random tick (random tick happens on average every 68 seconds).
      const { block, server } = event;
      if (Math.random() < 0.035) {
        server.runCommandSilent(
          // TODO adjust explosion power to meteor size.
          `summon fireball ${block.x} ${block.y + 60} ${block.z} {ExplosionPower:11,Motion:[0.0,-1.5,0.0]}`,
        );
        // TODO create better meteor strcutures (multiple) and pick one randomly. Get explorted structure to work in datapack.
        server.scheduleInTicks(38, () => {
          const structures = [
            "cobbleblock:meteor_mega_1",
            "cobbleblock:meteor_keystone_1",
            "cobbleblock:meteor_deoxys_1",
            "cobbleblock:meteor_max_1",
            "cobbleblock:meteor_geode_1",
            "cobbleblock:meteor_sculk_1",
            "cobbleblock:meteor_journal_1"
          ];
          block.set("minecraft:air");
          const structure =
            structures[Math.floor(Math.random() * structures.length)];
          server.runCommandSilent(
            `place template ${structure} ${block.x - 6} ${block.y - 3} ${block.z - 6}`,
          );
          server.players.forEach((player) => {
            player.tell("§4§lA meteor has fallen!");
          });
        });
      }
    });
});

// Torn pages
StartupEvents.registry("item", (event) => {
  event
    .create("cobbleblock:torn_page")
    .tooltip(`A torn page that can be added to Acacia's research journal.`)
    .useAnimation("none")
    .useDuration((item) => 0)
    .use((level, player, hand) => true)
    .finishUsing((item, level, entity) => {
      if (level.isClientSide()) return item;
      item.shrink(1);
      return item;
    });
});

// Creative tab
StartupEvents.registry("creative_mode_tab", (event) => {
  event
    .create("cobbleblock:cobbleblock")
    .displayName("Cobbleblock")
    .icon(() => "cobbleblock:meteor_beacon")
    .content(() => [
      "cobbleblock:meteor_beacon",
      "cobbleblock:suspicious_cobblestone",
    ]);
});
