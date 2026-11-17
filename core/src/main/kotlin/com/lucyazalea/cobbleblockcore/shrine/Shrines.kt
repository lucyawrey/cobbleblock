package com.lucyazalea.cobbleblockcore.shrine

import com.cobblemon.mod.common.api.pokemon.PokemonProperties
import com.cobblemon.mod.common.api.pokemon.PokemonSpecies
import com.google.gson.Gson
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.mojang.logging.LogUtils
import net.minecraft.core.Registry
import net.minecraft.core.Vec3i
import net.minecraft.core.registries.BuiltInRegistries
import net.minecraft.core.registries.Registries
import net.minecraft.resources.ResourceKey
import net.minecraft.resources.ResourceLocation
import net.minecraft.server.packs.resources.ResourceManager
import net.minecraft.server.packs.resources.SimpleJsonResourceReloadListener
import net.minecraft.util.profiling.ProfilerFiller
import net.minecraft.world.item.Item
import net.minecraft.world.level.Level
import net.minecraft.world.level.block.Block
import net.minecraft.world.phys.Vec3
import net.neoforged.neoforge.event.AddReloadListenerEvent

class Shrine(
    val required: Map<ResourceLocation, Int>,
    val takesCoins: Boolean,
    /** Right, up and back from the shrine, as it faces. */
    val spawnOffset: Vec3i,
    val dimension: ShrineDimension?,
    val offerings: List<Offering>,
)

class Offering(val item: Item, val pokemon: String, val loot: Item?)

class ShrineDimension(val level: ResourceKey<Level>, val arriveAt: Vec3)

/** Loads `data/<namespace>/shrine/<name>.json`, one file per shrine block. */
object Shrines : SimpleJsonResourceReloadListener(Gson(), "shrine") {
    private val LOGGER = LogUtils.getLogger()
    private var byBlock: Map<Block, Shrine> = emptyMap()

    operator fun get(block: Block): Shrine? = byBlock[block]

    fun onAddReloadListener(event: AddReloadListenerEvent) = event.addListener(this)

    override fun apply(files: Map<ResourceLocation, JsonElement>, resources: ResourceManager, profiler: ProfilerFiller) {
        byBlock = files.mapNotNull { (file, json) ->
            try {
                val obj = json.asJsonObject
                lookup(BuiltInRegistries.BLOCK, obj.get("block").asString) to parse(obj)
            } catch (e: Exception) {
                LOGGER.error("Skipping shrine {}: {}", file, e.message)
                null
            }
        }.toMap()
    }

    private fun parse(obj: JsonObject) = Shrine(
        required = obj.getAsJsonObject("required").entrySet().associate { (id, count) ->
            val location = ResourceLocation.parse(id)
            require(BuiltInRegistries.BLOCK.containsKey(location) || BuiltInRegistries.ITEM.containsKey(location)) { "unknown block or item $id" }
            location to count.asInt
        },
        takesCoins = obj.get("takes_coins")?.asBoolean ?: false,
        spawnOffset = obj.getAsJsonArray("spawn_offset")?.map { it.asInt }?.let { Vec3i(it[0], it[1], it[2]) } ?: Vec3i(0, 0, 2),
        dimension = obj.getAsJsonObject("dimension")?.let { dimension ->
            val at = dimension.getAsJsonArray("arrive_at").map { it.asDouble }
            ShrineDimension(
                ResourceKey.create(Registries.DIMENSION, ResourceLocation.parse(dimension.get("id").asString)),
                Vec3(at[0], at[1], at[2]),
            )
        },
        offerings = obj.getAsJsonArray("offerings").map { it.asJsonObject }.map { offering ->
            val pokemon = offering.get("pokemon").asString
            val species = PokemonProperties.parse(pokemon).species
            // Cobblemon loads species with the same reload, so they may not be there yet; then the summon is the check.
            require(PokemonSpecies.species.isEmpty() || species != null && PokemonSpecies.getByName(species.substringAfter(':')) != null) { "unknown Pokémon in \"$pokemon\"" }
            Offering(
                lookup(BuiltInRegistries.ITEM, offering.get("item").asString),
                pokemon,
                offering.get("loot")?.let { lookup(BuiltInRegistries.ITEM, it.asString) },
            )
        },
    )

    private fun <T> lookup(registry: Registry<T>, id: String): T =
        registry.getOptional(ResourceLocation.parse(id)).orElseThrow { IllegalArgumentException("unknown ${registry.key().location().path} $id") }
}
