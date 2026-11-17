package com.lucyazalea.cobbleblockcore

import com.lucyazalea.cobbleblockcore.shrine.ShrineContent
import com.lucyazalea.cobbleblockcore.shrine.ShrineUse
import com.lucyazalea.cobbleblockcore.shrine.Shrines
import net.minecraft.core.registries.Registries
import net.neoforged.bus.api.IEventBus
import net.neoforged.fml.common.Mod
import net.neoforged.neoforge.common.NeoForge
import net.neoforged.neoforge.registries.DeferredRegister

@Mod("cobbleblockcore")
class CobbleblockCore(modBus: IEventBus) {
    init {
        DeferredRegister.create(Registries.STRUCTURE_TYPE, "cobbleblock").apply {
            register("fixed_template") { -> FixedTemplateStructure.TYPE }
            register(modBus)
        }
        DeferredRegister.create(Registries.STRUCTURE_PIECE, "cobbleblock").apply {
            register("fixed_template") { -> FixedTemplateStructure.PIECE_TYPE }
            register(modBus)
        }
        ShrineContent.BLOCKS.register(modBus)
        ShrineContent.ITEMS.register(modBus)
        modBus.addListener(ShrineContent::addToCreativeTab)

        NeoForge.EVENT_BUS.addListener(ShrineContent::addTooltip)
        NeoForge.EVENT_BUS.addListener(Shrines::onAddReloadListener)
        NeoForge.EVENT_BUS.addListener(ShrineUse::onServerTick)
    }
}
