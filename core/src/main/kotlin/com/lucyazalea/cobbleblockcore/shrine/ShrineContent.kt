package com.lucyazalea.cobbleblockcore.shrine

import net.minecraft.core.registries.BuiltInRegistries
import net.minecraft.core.registries.Registries
import net.minecraft.locale.Language
import net.minecraft.network.chat.Component
import net.minecraft.ChatFormatting
import net.minecraft.resources.ResourceKey
import net.minecraft.resources.ResourceLocation
import net.minecraft.world.item.CreativeModeTab
import net.minecraft.world.item.ItemStack
import net.neoforged.neoforge.event.BuildCreativeModeTabContentsEvent
import net.neoforged.neoforge.event.entity.player.ItemTooltipEvent
import net.neoforged.neoforge.registries.DeferredRegister

// The `cobbleblock` namespace keeps the IDs these had as KubeJS items, so placed shrines and held items in existing saves survive.
object ShrineContent {
    private const val NAMESPACE = "cobbleblock"
    val BLOCKS: DeferredRegister.Blocks = DeferredRegister.createBlocks(NAMESPACE)
    val ITEMS: DeferredRegister.Items = DeferredRegister.createItems(NAMESPACE)

    private val WIDE_SHRINES = setOf("hooh_shrine", "celebi_shrine")

    // Every shrine block and item Core registers, in creative tab order: each shrine, then the items that go with it.
    private val ITEM_IDS = listOf(
        "articuno_shrine", "arctic_wing", "articuno_orb",
        "zapdos_shrine", "charged_wing", "zapdos_orb",
        "moltres_shrine", "molten_wing", "moltres_orb",
        "lugia_shrine", "fragile_ocarina",
        "mew_shrine", "ancient_fossil",
        "hooh_shrine", "rainbow_feather",
        "celebi_shrine", "time_flute",
        "legendary_beasts_shrine", "raikou_offering", "entei_offering", "suicune_offering",
        "blue_feather", "red_feather", "yellow_feather",
        "ancient_fossil_piece", "ancient_fossil_dust", "ancient_dna",
    )

    private val items = ITEM_IDS.map { id ->
        if (id.endsWith("_shrine")) {
            val block = BLOCKS.register(id) { -> ShrineBlock(wide = id in WIDE_SHRINES) }
            ITEMS.registerSimpleBlockItem(block)
        } else {
            ITEMS.registerSimpleItem(id)
        }
    }

    private val TAB = ResourceKey.create(Registries.CREATIVE_MODE_TAB, ResourceLocation.fromNamespaceAndPath(NAMESPACE, NAMESPACE))
    private val TAB_ANCHOR = ResourceLocation.fromNamespaceAndPath(NAMESPACE, "meteor_beacon")

    fun addToCreativeTab(event: BuildCreativeModeTabContentsEvent) {
        if (event.tabKey != TAB) return
        var after = ItemStack(BuiltInRegistries.ITEM.get(TAB_ANCHOR))
        for (item in items) {
            val stack = ItemStack(item.get())
            event.insertAfter(after, stack, CreativeModeTab.TabVisibility.PARENT_AND_SEARCH_TABS)
            after = stack
        }
    }

    // Any item of ours with a "<description id>.tooltip" lang entry gets that tooltip.
    fun addTooltip(event: ItemTooltipEvent) {
        val key = event.itemStack.item.descriptionId + ".tooltip"
        if (event.itemStack.item.builtInRegistryHolder().key().location().namespace == NAMESPACE && Language.getInstance().has(key)) {
            event.toolTip.add(Component.translatable(key).withStyle(ChatFormatting.GRAY))
        }
    }
}
