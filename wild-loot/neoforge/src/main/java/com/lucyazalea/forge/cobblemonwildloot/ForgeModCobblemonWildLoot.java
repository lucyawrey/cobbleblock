package com.lucyazalea.forge.cobblemonwildloot;

import com.lucyazalea.cobblemonwildloot.CobblemonWildLoot;
import com.lucyazalea.cobblemonwildloot.PokebasketEntity;
import net.minecraft.world.level.block.entity.BlockEntityType;
import net.neoforged.fml.common.Mod;
import java.util.Set;

@Mod(CobblemonWildLoot.MOD_ID)
public class ForgeModCobblemonWildLoot {
    public ForgeModCobblemonWildLoot() {
        CobblemonWildLoot.init();

        CobblemonWildLoot.POKEBASKET_ENTITY = CobblemonWildLoot.registerBlockEntity("pokebasket", () -> new BlockEntityType<>(PokebasketEntity::new, Set.of(CobblemonWildLoot.POKEBASKET_BLOCK.get()), null));
        CobblemonWildLoot.registerBlockEntities();
    }
}
