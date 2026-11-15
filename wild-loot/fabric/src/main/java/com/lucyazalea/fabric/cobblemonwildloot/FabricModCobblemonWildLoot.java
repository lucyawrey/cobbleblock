package com.lucyazalea.fabric.cobblemonwildloot;

import com.lucyazalea.cobblemonwildloot.CobblemonWildLoot;
import com.lucyazalea.cobblemonwildloot.PokebasketEntity;
import net.fabricmc.api.ModInitializer;
import net.minecraft.world.level.block.entity.BlockEntityType;

import java.util.Set;

public class FabricModCobblemonWildLoot implements ModInitializer {
    @Override
    public void onInitialize() {
        CobblemonWildLoot.init();

        CobblemonWildLoot.POKEBASKET_ENTITY = CobblemonWildLoot.registerBlockEntity("pokebasket", () -> new BlockEntityType<>(PokebasketEntity::new, Set.of(CobblemonWildLoot.POKEBASKET_BLOCK.get()), null));
        CobblemonWildLoot.registerBlockEntities();
    }
}
