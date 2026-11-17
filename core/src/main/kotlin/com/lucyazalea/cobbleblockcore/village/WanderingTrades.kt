package com.lucyazalea.cobbleblockcore.village

import com.google.gson.Gson
import com.google.gson.JsonElement
import com.mojang.logging.LogUtils
import com.mojang.serialization.JsonOps
import net.minecraft.resources.RegistryOps
import net.minecraft.resources.ResourceLocation
import net.minecraft.server.packs.resources.ResourceManager
import net.minecraft.server.packs.resources.SimpleJsonResourceReloadListener
import net.minecraft.util.profiling.ProfilerFiller
import net.minecraft.world.entity.npc.VillagerTrades
import net.minecraft.world.item.ItemStack
import net.neoforged.neoforge.event.AddReloadListenerEvent
import net.neoforged.neoforge.event.village.WandererTradesEvent

/**
 * Loads `data/<namespace>/wandering_trades/<name>.json`, each a list of `{ "emeralds": n, "result": <item stack> }`,
 * and adds them to the wandering trader's common trades.
 */
object WanderingTrades : SimpleJsonResourceReloadListener(Gson(), "wandering_trades") {
    private val LOGGER = LogUtils.getLogger()
    // MoreJS's defaults, which these trades used before.
    private const val MAX_USES = 16
    private const val XP = 2
    private const val PRICE_MULTIPLIER = 0.05f

    private var files: Map<ResourceLocation, JsonElement> = emptyMap()

    fun onAddReloadListener(event: AddReloadListenerEvent) = event.addListener(this)

    override fun apply(files: Map<ResourceLocation, JsonElement>, resources: ResourceManager, profiler: ProfilerFiller) {
        this.files = files
    }

    fun onWandererTrades(event: WandererTradesEvent) {
        val ops = RegistryOps.create(JsonOps.INSTANCE, event.registryAccess)
        for ((file, json) in files) {
            try {
                for (trade in json.asJsonArray.map { it.asJsonObject }) {
                    val result = ItemStack.CODEC.parse(ops, trade.get("result")).getOrThrow()
                    event.genericTrades += VillagerTrades.ItemsForEmeralds(
                        result, trade.get("emeralds").asInt, result.count, MAX_USES, XP, PRICE_MULTIPLIER,
                    )
                }
            } catch (e: Exception) {
                LOGGER.error("Skipping wandering trades {}: {}", file, e.message)
            }
        }
    }
}
