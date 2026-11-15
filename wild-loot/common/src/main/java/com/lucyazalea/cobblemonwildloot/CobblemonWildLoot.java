package com.lucyazalea.cobblemonwildloot;

import dev.architectury.registry.CreativeTabRegistry;
import dev.architectury.registry.registries.DeferredRegister;
import dev.architectury.registry.registries.RegistrySupplier;
import net.minecraft.core.registries.Registries;
import net.minecraft.network.chat.Component;
import net.minecraft.world.item.BlockItem;
import net.minecraft.world.item.CreativeModeTab;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.SoundType;
import net.minecraft.world.level.block.entity.BlockEntityType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Set;
import java.util.function.Supplier;

public final class CobblemonWildLoot {
    public static final String MOD_ID = "cobblemonwildloot";
    public static final CobblemonWildLootConfig CONFIG = CobblemonWildLootConfig.load();
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

    private static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(CobblemonWildLoot.MOD_ID, Registries.BLOCK);
    private static final DeferredRegister<Item> ITEMS = DeferredRegister.create(CobblemonWildLoot.MOD_ID, Registries.ITEM);
    private static final DeferredRegister<CreativeModeTab> TABS = DeferredRegister.create(CobblemonWildLoot.MOD_ID, Registries.CREATIVE_MODE_TAB);
    private static final DeferredRegister<BlockEntityType<?>> BLOCK_ENTITIES = DeferredRegister.create(CobblemonWildLoot.MOD_ID, Registries.BLOCK_ENTITY_TYPE);

    public static RegistrySupplier<Item> POKEBASKET_ITEM;
    public static RegistrySupplier<Block> POKEBASKET_BLOCK;
    public static RegistrySupplier<CreativeModeTab> COBBLEMONWILDLOOT_TAB;
    public static RegistrySupplier<BlockEntityType<PokebasketEntity>> POKEBASKET_ENTITY;

    public static void init() {
        LOGGER.info("Initializing Cobblemon Wild Loot Mod.");

        POKEBASKET_BLOCK = BLOCKS.register("pokebasket", () -> new PokebasketBlock(Block.Properties.of().sound(SoundType.WOOD).strength(1.0f)));
        POKEBASKET_ITEM = ITEMS.register("pokebasket", () -> new BlockItem(POKEBASKET_BLOCK.get(), new Item.Properties().arch$tab(COBBLEMONWILDLOOT_TAB)));
        COBBLEMONWILDLOOT_TAB = TABS.register("pokebasket", () -> CreativeTabRegistry.create(Component.translatable("category.cobblemon_wild_loot_tab"), () -> new ItemStack(POKEBASKET_ITEM.get())));

        BLOCKS.register();
        ITEMS.register();
        TABS.register();
    }

    public static <T extends BlockEntityType<?>> RegistrySupplier<T> registerBlockEntity(String name, Supplier<T> blockEntity){
        return BLOCK_ENTITIES.register(name, blockEntity);
    }
    public static void registerBlockEntities(){
        BLOCK_ENTITIES.register();
    }
}