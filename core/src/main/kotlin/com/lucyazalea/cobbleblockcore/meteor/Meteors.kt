package com.lucyazalea.cobbleblockcore.meteor

import com.google.gson.Gson
import com.google.gson.JsonElement
import com.lucyazalea.cobbleblockcore.CobbleblockContent
import com.lucyazalea.cobbleblockcore.Delayed
import com.mojang.logging.LogUtils
import net.minecraft.ChatFormatting
import net.minecraft.core.BlockPos
import net.minecraft.nbt.CompoundTag
import net.minecraft.network.chat.Component
import net.minecraft.resources.ResourceLocation
import net.minecraft.server.level.ServerLevel
import net.minecraft.server.packs.resources.ResourceManager
import net.minecraft.server.packs.resources.SimpleJsonResourceReloadListener
import net.minecraft.util.RandomSource
import net.minecraft.util.profiling.ProfilerFiller
import net.minecraft.world.entity.EntityType
import net.minecraft.world.level.block.Block
import net.minecraft.world.level.block.Blocks
import net.minecraft.world.level.block.Rotation
import net.minecraft.world.level.levelgen.structure.templatesystem.StructurePlaceSettings
import net.minecraft.world.phys.Vec3
import net.neoforged.neoforge.event.AddReloadListenerEvent

class Meteor(val template: ResourceLocation, val weight: Int, val explosionPower: Int)

/** Loads `data/<namespace>/meteor/<name>.json`: the meteors a beacon can call down. */
object Meteors : SimpleJsonResourceReloadListener(Gson(), "meteor") {
    private val LOGGER = LogUtils.getLogger()
    private const val FALL_HEIGHT = 60
    private const val FALL_TICKS = 38
    private const val MESSAGE_RANGE = 128.0
    // Where the template's corner goes relative to the beacon (as KubeJS placed it), and the template point it turns around.
    private val CORNER = BlockPos(-6, -3, -6)
    private val PIVOT = BlockPos(6, 0, 6)

    private var meteors: List<Meteor> = emptyList()

    fun onAddReloadListener(event: AddReloadListenerEvent) = event.addListener(this)

    override fun apply(files: Map<ResourceLocation, JsonElement>, resources: ResourceManager, profiler: ProfilerFiller) {
        meteors = files.mapNotNull { (file, json) ->
            try {
                val obj = json.asJsonObject
                Meteor(ResourceLocation.parse(obj.get("template").asString), obj.get("weight").asInt, obj.get("explosion_power").asInt)
            } catch (e: Exception) {
                LOGGER.error("Skipping meteor {}: {}", file, e.message)
                null
            }
        }
    }

    fun crash(level: ServerLevel, beacon: BlockPos, random: RandomSource) {
        val meteor = pick(random) ?: return
        val fireball = EntityType.FIREBALL.create(level) ?: return
        fireball.readAdditionalSaveData(CompoundTag().apply { putByte("ExplosionPower", meteor.explosionPower.toByte()) })
        fireball.moveTo(beacon.center.add(0.0, FALL_HEIGHT.toDouble(), 0.0))
        fireball.deltaMovement = Vec3(0.0, -1.5, 0.0)
        level.addFreshEntity(fireball)

        Delayed.run(level.server, FALL_TICKS) {
            if (!level.getBlockState(beacon).`is`(CobbleblockContent.METEOR_BEACON.get())) return@run
            val template = level.structureManager.get(meteor.template).orElse(null) ?: return@run
            level.setBlock(beacon, Blocks.AIR.defaultBlockState(), Block.UPDATE_ALL)
            val settings = StructurePlaceSettings().setRotation(Rotation.getRandom(random)).setRotationPivot(PIVOT)
            val corner = beacon.offset(CORNER)
            template.placeInWorld(level, corner, corner, settings, random, Block.UPDATE_ALL)
            val message = Component.translatable("meteor.cobbleblock.fallen").withStyle(ChatFormatting.DARK_RED, ChatFormatting.BOLD)
            level.players().filter { it.distanceToSqr(beacon.center) < MESSAGE_RANGE * MESSAGE_RANGE }.forEach { it.sendSystemMessage(message) }
        }
    }

    private fun pick(random: RandomSource): Meteor? {
        var roll = random.nextInt(meteors.sumOf { it.weight }.coerceAtLeast(1))
        return meteors.firstOrNull { roll -= it.weight; roll < 0 }
    }
}
