package com.lucyazalea.cobbleblockcore

import com.lucyazalea.cobbleblockcore.meteor.Meteors
import com.lucyazalea.cobbleblockcore.shrine.ShrineUse
import com.lucyazalea.cobbleblockcore.shrine.Shrines
import com.lucyazalea.cobbleblockcore.village.Villages
import com.lucyazalea.cobbleblockcore.village.WanderingTrades
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
        CobbleblockContent.register(modBus)

        NeoForge.EVENT_BUS.addListener(CobbleblockContent::addTooltip)
        NeoForge.EVENT_BUS.addListener(Shrines::onAddReloadListener)
        NeoForge.EVENT_BUS.addListener(Meteors::onAddReloadListener)
        NeoForge.EVENT_BUS.addListener(Delayed::onServerTick)
        NeoForge.EVENT_BUS.addListener(Delayed::onServerStopped)
        NeoForge.EVENT_BUS.addListener(ShrineUse::onServerStopped)
        NeoForge.EVENT_BUS.addListener(WanderingTrades::onAddReloadListener)
        NeoForge.EVENT_BUS.addListener(WanderingTrades::onWandererTrades)
        NeoForge.EVENT_BUS.addListener(Villages::onGameEvent)
        NeoForge.EVENT_BUS.addListener(Villages::onServerTick)
        NeoForge.EVENT_BUS.addListener(FirstStart::onCreateSpawnPosition)
        NeoForge.EVENT_BUS.addListener(FirstStart::onPlayerLoggedIn)
    }
}
