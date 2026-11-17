package com.lucyazalea.cobbleblockcore

import com.lucyazalea.cobbleblockcore.meteor.MeteorBeaconBlock
import com.lucyazalea.cobbleblockcore.shrine.ShrineContent
import net.minecraft.ChatFormatting
import net.minecraft.core.registries.Registries
import net.minecraft.locale.Language
import net.minecraft.network.chat.Component
import net.minecraft.world.item.CreativeModeTab
import net.minecraft.world.level.block.SoundType
import net.minecraft.world.level.block.state.BlockBehaviour
import net.neoforged.bus.api.IEventBus
import net.neoforged.neoforge.event.entity.player.ItemTooltipEvent
import net.neoforged.neoforge.registries.DeferredRegister

// The `cobbleblock` namespace keeps the IDs these had as KubeJS blocks and items, so placed blocks and held items in existing saves survive.
object CobbleblockContent {
    const val NAMESPACE = "cobbleblock"
    val BLOCKS: DeferredRegister.Blocks = DeferredRegister.createBlocks(NAMESPACE)
    val ITEMS: DeferredRegister.Items = DeferredRegister.createItems(NAMESPACE)
    val TABS: DeferredRegister<CreativeModeTab> = DeferredRegister.create(Registries.CREATIVE_MODE_TAB, NAMESPACE)

    private val SUSPICIOUS_COBBLESTONE = BLOCKS.registerSimpleBlock(
        "suspicious_cobblestone",
        BlockBehaviour.Properties.of().sound(SoundType.STONE).strength(2f, 10f).requiresCorrectToolForDrops(),
    ).also { ITEMS.registerSimpleBlockItem(it) }
    val METEOR_BEACON = BLOCKS.register("meteor_beacon") { -> MeteorBeaconBlock() }.also { ITEMS.registerSimpleBlockItem(it) }
    private val TORN_PAGE = ITEMS.register("torn_page") { -> TornPageItem() }

    init {
        TABS.register(NAMESPACE) { ->
            CreativeModeTab.builder()
                .title(Component.translatable("itemGroup.$NAMESPACE"))
                .icon { METEOR_BEACON.toStack() }
                .displayItems { _, output ->
                    output.accept(METEOR_BEACON)
                    output.accept(SUSPICIOUS_COBBLESTONE)
                    ShrineContent.items.forEach { output.accept(it) }
                }
                .build()
        }
    }

    fun register(modBus: IEventBus) {
        ShrineContent.items // Registers the shrine blocks and items; this must happen before the registers are added to the bus.
        BLOCKS.register(modBus)
        ITEMS.register(modBus)
        TABS.register(modBus)
    }

    // Any item of ours with a "<description id>.tooltip" lang entry gets that tooltip.
    fun addTooltip(event: ItemTooltipEvent) {
        val key = event.itemStack.item.descriptionId + ".tooltip"
        if (event.itemStack.item.builtInRegistryHolder().key().location().namespace == NAMESPACE && Language.getInstance().has(key)) {
            event.toolTip.add(Component.translatable(key).withStyle(ChatFormatting.GRAY))
        }
    }
}
