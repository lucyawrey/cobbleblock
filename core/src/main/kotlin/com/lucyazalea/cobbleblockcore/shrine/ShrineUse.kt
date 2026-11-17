package com.lucyazalea.cobbleblockcore.shrine

import com.cobblemon.mod.common.api.pokemon.PokemonProperties
import com.cobblemon.mod.common.entity.pokemon.PokemonEntity
import net.minecraft.ChatFormatting
import net.minecraft.core.BlockPos
import net.minecraft.core.registries.BuiltInRegistries
import net.minecraft.network.chat.Component
import net.minecraft.resources.ResourceKey
import net.minecraft.resources.ResourceLocation
import net.minecraft.server.level.ServerLevel
import net.minecraft.server.level.ServerPlayer
import net.minecraft.sounds.SoundEvents
import net.minecraft.sounds.SoundSource
import net.minecraft.util.Mth
import net.minecraft.world.entity.item.ItemEntity
import net.minecraft.world.item.ItemStack
import net.minecraft.world.level.Level
import net.minecraft.world.level.block.state.BlockState
import net.neoforged.neoforge.event.tick.ServerTickEvent
import java.util.UUID
import kotlin.random.Random

object ShrineUse {
    private const val RADIUS = 8
    private const val COOLDOWN_TICKS = 20
    private const val HOME_LOCK_TICKS = 300
    private const val SHINY_ODDS = 4096
    private val RELIC_COIN = ResourceLocation.fromNamespaceAndPath("cobblemon", "relic_coin")
    private val PEDESTAL = ResourceLocation.fromNamespaceAndPath("mega_showdown", "pedestal")

    private val lastUse = HashMap<UUID, Long>()
    private val lastSummon = HashMap<UUID, Long>()
    private val pending = ArrayList<PendingSummon>()

    private class PendingSummon(val level: ResourceKey<Level>, val entity: PokemonEntity, val at: Long)

    fun use(player: ServerPlayer, pos: BlockPos, state: BlockState) {
        val level = player.serverLevel()
        val now = level.gameTime
        if (now < (lastUse[player.uuid] ?: Long.MIN_VALUE) + COOLDOWN_TICKS) return
        lastUse[player.uuid] = now

        val shrine = Shrines[state.block] ?: return
        val name = Component.translatable("shrine.${BuiltInRegistries.BLOCK.getKey(state.block).toLanguageKey()}")
        val held = player.mainHandItem

        if (shrine.takesCoins && BuiltInRegistries.ITEM.getKey(held.item) == RELIC_COIN) {
            held.shrink(1)
            player.sendSystemMessage(Component.translatable("shrine.cobbleblock.coin").withStyle(ChatFormatting.GOLD))
            award(player, "shrine_donation")
            return
        }

        val missing = missing(shrine.required, count(level, pos, shrine.required.keys))
        if (missing.isNotEmpty()) {
            val list = missing.map { (id, amount) -> Component.translatable("shrine.cobbleblock.missing_entry", amount, displayName(id)) }
            player.sendSystemMessage(Component.translatable("shrine.cobbleblock.incomplete", name, joined(list, Component.literal(", "))))
            return
        }

        val inDimension = shrine.dimension?.level == level.dimension()
        val offering = shrine.offerings.firstOrNull { held.`is`(it.item) }
        when {
            offering != null && shrine.dimension != null && !inDimension -> {
                val target = player.server.getLevel(shrine.dimension.level) ?: return
                val at = shrine.dimension.arriveAt
                player.teleportTo(target, at.x, at.y, at.z, player.yRot, player.xRot)
            }
            offering != null -> summon(level, pos, state, player, shrine, offering)
            held.isEmpty && inDimension -> if (now >= (lastSummon[player.uuid] ?: Long.MIN_VALUE) + HOME_LOCK_TICKS) {
                player.server.commands.performPrefixedCommand(player.createCommandSourceStack(), "skyblock home")
            }
            held.isEmpty -> player.sendSystemMessage(Component.translatable("shrine.cobbleblock.ready", name))
            else -> {
                val offerings = shrine.offerings.map { it.item.description }
                val or = Component.translatable("shrine.cobbleblock.or")
                player.sendSystemMessage(Component.translatable("shrine.cobbleblock.wrong_offering", joined(offerings, or)))
            }
        }
    }

    private fun summon(level: ServerLevel, pos: BlockPos, state: BlockState, player: ServerPlayer, shrine: Shrine, offering: Offering) {
        val properties = PokemonProperties.parse(offering.pokemon)
        if (properties.shiny == null) properties.shiny = Random.nextInt(SHINY_ODDS) == 0
        val entity = properties.createEntity(level)

        val facing = state.getValue(ShrineBlock.FACING)
        val offset = shrine.spawnOffset
        val spot = pos.relative(facing.clockWise, offset.x).above(offset.y).relative(facing.opposite, offset.z).bottomCenter
        val yaw = (Mth.atan2(player.z - spot.z, player.x - spot.x) * Mth.RAD_TO_DEG).toFloat() - 90f
        entity.moveTo(spot.x, spot.y, spot.z, yaw, 0f)
        entity.yHeadRot = yaw
        entity.yBodyRot = yaw

        val consumed = offering.item.descriptionId + ".consumed"
        player.sendSystemMessage(Component.translatable(consumed))
        player.sendSystemMessage(Component.translatable("shrine.cobbleblock.coming", entity.name).withStyle(ChatFormatting.AQUA, ChatFormatting.BOLD))
        level.playSound(null, pos, SoundEvents.END_PORTAL_SPAWN, SoundSource.BLOCKS, 1f, 1f)
        award(player, "legendary_summon")
        lastSummon[player.uuid] = level.gameTime
        player.mainHandItem.shrink(1)
        offering.loot?.let { level.addFreshEntity(ItemEntity(level, pos.x + 0.5, pos.y + 2.0, pos.z + 0.5, ItemStack(it))) }
        pending += PendingSummon(level.dimension(), entity, level.server.tickCount.toLong() + shrine.spawnDelayTicks)
    }

    fun onServerTick(event: ServerTickEvent.Post) {
        val now = event.server.tickCount
        pending.removeIf { summon ->
            if (summon.at > now) return@removeIf false
            event.server.getLevel(summon.level)?.addFreshEntity(summon.entity)
            true
        }
    }

    // Counts blocks within RADIUS of the shrine, plus the item on each Mega Showdown pedestal.
    private fun count(level: ServerLevel, center: BlockPos, wanted: Set<ResourceLocation>): Map<ResourceLocation, Int> {
        val counts = HashMap<ResourceLocation, Int>()
        for (pos in BlockPos.betweenClosed(center.offset(-RADIUS, -RADIUS, -RADIUS), center.offset(RADIUS, RADIUS, RADIUS))) {
            val id = BuiltInRegistries.BLOCK.getKey(level.getBlockState(pos).block)
            if (id in wanted) counts.merge(id, 1, Int::plus)
            if (id == PEDESTAL) {
                val tag = level.getBlockEntity(pos)?.saveWithoutMetadata(level.registryAccess()) ?: continue
                val item = ResourceLocation.tryParse(tag.getCompound("Item").getString("id")) ?: continue
                if (item in wanted) counts.merge(item, 1, Int::plus)
            }
        }
        return counts
    }

    private fun displayName(id: ResourceLocation): Component =
        BuiltInRegistries.BLOCK.getOptional(id).map<Component> { it.name }.orElseGet { BuiltInRegistries.ITEM.get(id).description }

    private fun joined(parts: List<Component>, separator: Component): Component =
        Component.empty().also { result -> parts.forEachIndexed { i, part -> if (i > 0) result.append(separator); result.append(part) } }

    private fun award(player: ServerPlayer, advancement: String) {
        val holder = player.server.advancements.get(ResourceLocation.fromNamespaceAndPath("cobbleblock", advancement)) ?: return
        holder.value().criteria.keys.forEach { player.advancements.award(holder, it) }
    }
}
