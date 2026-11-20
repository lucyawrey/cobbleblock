package com.lucyazalea.cobbleblockcore

import com.google.gson.Gson
import com.google.gson.JsonElement
import com.mojang.logging.LogUtils
import net.minecraft.core.BlockPos
import net.minecraft.core.registries.BuiltInRegistries
import net.minecraft.resources.ResourceLocation
import net.minecraft.server.TickTask
import net.minecraft.server.level.ServerLevel
import net.minecraft.server.packs.resources.ResourceManager
import net.minecraft.server.packs.resources.SimpleJsonResourceReloadListener
import net.minecraft.tags.BlockTags
import net.minecraft.util.profiling.ProfilerFiller
import net.minecraft.util.random.SimpleWeightedRandomList
import net.minecraft.world.level.block.Block
import net.neoforged.neoforge.event.AddReloadListenerEvent
import net.neoforged.neoforge.event.entity.player.BonemealEvent

/**
 * Loads `data/<namespace>/bone_meal_flowers/<name>.json`, each a list of `{ "block": <block id>, "weight": n }`,
 * and turns the flowers bone meal grows into ones picked from that list by weight.
 */
object BoneMealFlowers : SimpleJsonResourceReloadListener(Gson(), "bone_meal_flowers") {
    private val LOGGER = LogUtils.getLogger()
    private const val REACH = 7

    private var flowers = SimpleWeightedRandomList.empty<Block>()

    fun onAddReloadListener(event: AddReloadListenerEvent) = event.addListener(this)

    override fun apply(files: Map<ResourceLocation, JsonElement>, resources: ResourceManager, profiler: ProfilerFiller) {
        val list = SimpleWeightedRandomList.builder<Block>()
        for ((file, json) in files) {
            if (!json.isJsonArray) {
                LOGGER.error("Skipping bone meal flowers {}: not a list", file)
                continue
            }
            for (entry in json.asJsonArray) {
                try {
                    val id = ResourceLocation.parse(entry.asJsonObject.get("block").asString)
                    val block = BuiltInRegistries.BLOCK.getOptional(id).orElseThrow { IllegalArgumentException("unknown block $id") }
                    val weight = entry.asJsonObject.get("weight").asInt
                    require(weight >= 1) { "weight must be at least 1" }
                    list.add(block, weight)
                } catch (e: Exception) {
                    LOGGER.error("Skipping bone meal flower {} in {}: {}", entry, file, e.message)
                }
            }
        }
        flowers = list.build()
    }

    // Bone meal hasn't grown anything yet when this fires, so note the empty spots now and swap the flowers in a queued
    // task. Queued tasks run before the next tick sends block changes to clients, so players never see the first flower.
    fun onBonemeal(event: BonemealEvent) {
        val level = event.level as? ServerLevel ?: return
        if (!event.isValidBonemealTarget || flowers.isEmpty) return
        val empty = BlockPos.betweenClosed(event.pos.offset(-REACH, -REACH, -REACH), event.pos.offset(REACH, REACH, REACH))
            .map { it.immutable() }
            .filter { level.getBlockState(it).isAir }
        level.server.tell(TickTask(level.server.tickCount) {
            for (pos in empty) {
                if (!level.getBlockState(pos).`is`(BlockTags.SMALL_FLOWERS)) continue
                flowers.getRandomValue(level.random).ifPresent { level.setBlockAndUpdate(pos, it.defaultBlockState()) }
            }
        })
    }
}
