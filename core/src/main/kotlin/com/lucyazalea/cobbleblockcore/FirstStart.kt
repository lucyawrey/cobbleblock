package com.lucyazalea.cobbleblockcore

import com.cobblemon.mod.common.world.gamerules.CobblemonGameRules
import net.minecraft.ChatFormatting
import net.minecraft.network.chat.Component
import net.minecraft.resources.ResourceLocation
import net.minecraft.server.level.ServerLevel
import net.minecraft.server.level.ServerPlayer
import net.minecraft.world.level.GameRules
import net.neoforged.fml.ModList
import net.neoforged.neoforge.event.entity.player.PlayerEvent
import net.neoforged.neoforge.event.level.LevelEvent

/** Setup that runs once: the pack's gamerules for a new world, and a welcome for each new player. */
object FirstStart {
    private val JOINED = ResourceLocation.fromNamespaceAndPath("cobbleblock", "join")

    // Set only when the world is created, so players and server owners can change them afterwards.
    fun onCreateSpawnPosition(event: LevelEvent.CreateSpawnPosition) {
        val level = event.level as? ServerLevel ?: return
        val rules = level.gameRules
        rules.getRule(GameRules.RULE_DOMOBSPAWNING).set(false, level.server)
        rules.getRule(GameRules.RULE_DO_TRADER_SPAWNING).set(false, level.server)
        rules.getRule(CobblemonGameRules.HEALERS_HEAL_PC).set(true, level.server)
    }

    fun onPlayerLoggedIn(event: PlayerEvent.PlayerLoggedInEvent) {
        val player = event.entity as? ServerPlayer ?: return
        val server = player.server
        val joined = server.advancements.get(JOINED) ?: return
        val progress = player.advancements.getOrStartProgress(joined)
        if (progress.isDone) return

        player.sendSystemMessage(Component.translatable("welcome.cobbleblock").withStyle(ChatFormatting.GREEN))
        if (ModList.get().isLoaded("rctmod")) {
            val source = player.createCommandSourceStack().withPermission(4).withSuppressedOutput()
            server.commands.performPrefixedCommand(source, "rctmod player set defeats /all @s 1")
        }
        progress.remainingCriteria.forEach { player.advancements.award(joined, it) }
    }
}
