// Visit the wiki for more info - https://kubejs.com/
console.info("Loaded KubeJs server scripts.");

ServerEvents.recipes((event) => {
  // Remove recepes for rare materials
  event.remove({ output: "mega_showdown:deoxys_meteorite" });

  // Hammer on cutting board handling
  event.remove({ output: "onlyhammers:emerald_hammer" });
  event.remove({ output: "onlyhammers:lapis_hammer" });
  event.remove({ output: "onlyhammers:redstone_hammer" });
  event.remove({ output: "onlyhammers:obsidian_hammer" });
  event.remove({ output: "farmersdelight:wheat_dough" });

  event.forEachRecipe({ type: "create:milling" }, (recipe) => {
    // TODO figure out why ingredient.item is undefined instead of a block ID
    let ingredients = JSON.parse(
      recipe.getOriginalRecipeIngredients()[0].toJson(),
    ).item;
    console.log(ingredients);
    if (
      !ingredients ||
      ingredients === "cobbleblock:suspicious_cobblestone" ||
      ingredients === "minecraft:suspicious_gravel" ||
      ingredients === "cobblemon:rare_candy"
    ) {
      return;
    }
    let result = [
      {
        count: recipe.originalRecipeResult.count,
        id: recipe.originalRecipeResult.id,
      },
    ];
    event.recipes.farmersdelight.cutting(ingredients, "#c:hammers", result);
  });

  // Shovel on cutting board handling
  event.remove({
    type: "farmersdelight:cutting",
    input: "minecraft:gravel",
    output: "minecraft:gravel",
  });
  event.recipes.farmersdelight.cutting(
    "minecraft:gravel",
    "#minecraft:shovels",
    [
      ChanceResult.of("minecraft:flint", 0.25),
      ChanceResult.of("create:copper_nugget", 0.12),
      ChanceResult.of("minecraft:iron_nugget", 0.12),
      ChanceResult.of("cobblemon:tumblestone", 0.12),
    ],
  );

  // Create handling
  event.remove({
    type: "create:splashing",
    input: "minecraft:gravel",
    output: "minecraft:flint",
  });
  event.recipes.create.splashing(
    [
      CreateItem.of("minecraft:flint", 0.25),
      CreateItem.of("create:copper_nugget", 0.12),
      CreateItem.of("minecraft:iron_nugget", 0.12),
      CreateItem.of("cobblemon:tumblestone", 0.12),
    ],
    "minecraft:gravel",
  );
  event.remove({
    type: "create:crushing",
    input: "minecraft:blackstone",
    output: "minecraft:blackstone",
  });
  event.recipes.create.crushing(
    [
      CreateItem.of("minecraft:blackstone", 0.2),
      CreateItem.of("minecraft:ancient_debris", 0.006),
    ],
    "minecraft:blackstone",
  );
});

RecipeViewerEvents.removeEntries("item", (event) => {
  // Hammer removal handling
  event.remove("onlyhammers:emerald_hammer");
  event.remove("onlyhammers:lapis_hammer");
  event.remove("onlyhammers:redstone_hammer");
  event.remove("onlyhammers:obsidian_hammer");
  event.remove("farmersdelight:wheat_dough");
});
