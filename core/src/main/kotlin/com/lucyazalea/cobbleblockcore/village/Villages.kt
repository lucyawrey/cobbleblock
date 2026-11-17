package com.lucyazalea.cobbleblockcore.village

import net.minecraft.core.BlockPos
import net.minecraft.core.Direction
import net.minecraft.network.chat.Component
import net.minecraft.server.level.ServerLevel
import net.minecraft.server.level.ServerPlayer
import net.minecraft.tags.BlockTags
import net.minecraft.util.SpawnUtil
import net.minecraft.world.entity.EntityType
import net.minecraft.world.entity.Mob
import net.minecraft.world.entity.MobSpawnType
import net.minecraft.world.entity.npc.Villager
import net.minecraft.world.entity.npc.WanderingTrader
import net.minecraft.world.level.block.Blocks
import net.minecraft.world.level.block.state.properties.BedPart
import net.minecraft.world.level.block.state.properties.BlockStateProperties
import net.minecraft.world.level.gameevent.GameEvent
import net.neoforged.neoforge.event.VanillaGameEvent
import net.neoforged.neoforge.event.tick.ServerTickEvent

/** Villages around a bell: ringing it says whether newcomers can come, and they arrive every 10 minutes. */
object Villages {
    private const val RADIUS = 32
    private const val ARRIVAL_TICKS = 12_000
    private const val VILLAGER_CHANCE = 0.5
    private const val TRADER_CHANCE = 0.3
    private const val TRADER_DESPAWN_DELAY = 36_000
    private const val SPAWN_TRIES = 10
    private const val SPAWN_RANGE = 4
    private const val SPAWN_HEIGHT = 2
    // Vanilla's strategy checks only the block at the feet, and villagers don't check for blocks when spawning.
    private val SPAWN_STRATEGY = SpawnUtil.Strategy { level, pos, state, above, aboveState ->
        SpawnUtil.Strategy.ON_TOP_OF_COLLIDER.canSpawnOn(level, pos, state, above, aboveState) &&
            level.getBlockState(above.above()).getCollisionShape(level, above.above()).isEmpty
    }

    private enum class Status(val key: String, val villagers: Boolean, val traders: Boolean) {
        INVALID("invalid", false, false),
        FULL("full", false, false),
        TRADERS("traders", false, true),
        VILLAGERS("villagers", true, false),
        ALL("all", true, true),
    }

    private class Village(val level: ServerLevel, val bell: BlockPos, val status: Status)

    fun onGameEvent(event: VanillaGameEvent) {
        val player = event.cause as? ServerPlayer ?: return
        if (!event.vanillaEvent.`is`(GameEvent.BLOCK_CHANGE)) return
        if (!player.level().getBlockState(BlockPos.containing(event.eventPosition)).`is`(Blocks.BELL)) return
        val status = check(player)?.status ?: Status.INVALID
        player.sendSystemMessage(Component.translatable("village.cobbleblock.${status.key}"))
    }

    fun onServerTick(event: ServerTickEvent.Post) {
        if (event.server.tickCount % ARRIVAL_TICKS != 0) return
        event.server.playerList.players
            .mapNotNull { player -> check(player)?.let { it to player } }
            .groupBy({ (village, _) -> village.level to village.bell }, { (village, player) -> village to player })
            .values.forEach { group -> arrive(group.first().first, group.map { it.second }) }
    }

    private fun arrive(village: Village, players: List<ServerPlayer>) {
        val random = village.level.random
        val arrived: Mob? = when {
            village.status.villagers && random.nextDouble() < VILLAGER_CHANCE ->
                spawn(village, EntityType.VILLAGER)?.also { it.setPersistenceRequired() }
            village.status.traders && random.nextDouble() < TRADER_CHANCE ->
                spawn(village, EntityType.WANDERING_TRADER)?.also { it.despawnDelay = TRADER_DESPAWN_DELAY }
            else -> null
        }
        val key = when (arrived) {
            is Villager -> "village.cobbleblock.villager_arrived"
            is WanderingTrader -> "village.cobbleblock.trader_arrived"
            else -> return
        }
        players.forEach { it.sendSystemMessage(Component.translatable(key)) }
    }

    private fun <T : Mob> spawn(village: Village, type: EntityType<T>): T? =
        SpawnUtil.trySpawnMob(type, MobSpawnType.EVENT, village.level, village.bell, SPAWN_TRIES, SPAWN_RANGE, SPAWN_HEIGHT, SPAWN_STRATEGY)
            .orElse(null)

    /** The village around the player, or null when it lacks water, beds, a bell or room by the bell. */
    private fun check(player: ServerPlayer): Village? {
        val level = player.serverLevel()
        val center = player.blockPosition()
        var water = 0
        var beds = 0
        var bell: BlockPos? = null
        for (pos in BlockPos.betweenClosed(center.offset(-RADIUS, -RADIUS / 4, -RADIUS), center.offset(RADIUS, RADIUS / 4, RADIUS))) {
            val state = level.getBlockState(pos)
            when {
                state.`is`(BlockTags.BEDS) && state.getOptionalValue(BlockStateProperties.BED_PART).orElse(BedPart.HEAD) == BedPart.HEAD -> beds++
                state.`is`(Blocks.WATER) -> water++
                state.`is`(Blocks.BELL) -> bell = pos.immutable()
            }
        }
        if (water <= 3 || beds == 0 || bell == null || !hasSpawnSpot(level, bell)) return null

        val area = player.boundingBox.inflate(RADIUS.toDouble())
        val villagers = level.getEntities(EntityType.VILLAGER, area) { true }.size
        val traders = level.getEntities(EntityType.WANDERING_TRADER, area) { true }.size
        val status = when {
            beds > villagers && traders == 0 -> Status.ALL
            beds > villagers -> Status.VILLAGERS
            traders == 0 -> Status.TRADERS
            else -> Status.FULL
        }
        return Village(level, bell, status)
    }

    /** Whether any spot [spawn] may try has room, using the same test as `SpawnUtil.trySpawnMob`. */
    private fun hasSpawnSpot(level: ServerLevel, bell: BlockPos): Boolean {
        for (dx in -SPAWN_RANGE..SPAWN_RANGE) for (dz in -SPAWN_RANGE..SPAWN_RANGE) {
            var above = bell.offset(dx, SPAWN_HEIGHT, dz)
            for (step in 0..2 * SPAWN_HEIGHT) {
                val pos = above.below()
                if (SPAWN_STRATEGY.canSpawnOn(level, pos, level.getBlockState(pos), above, level.getBlockState(above))) return true
                above = pos
            }
        }
        return false
    }
}
