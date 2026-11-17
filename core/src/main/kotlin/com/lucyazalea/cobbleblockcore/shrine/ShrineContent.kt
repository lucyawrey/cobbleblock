package com.lucyazalea.cobbleblockcore.shrine

import com.lucyazalea.cobbleblockcore.CobbleblockContent.BLOCKS
import com.lucyazalea.cobbleblockcore.CobbleblockContent.ITEMS
import com.lucyazalea.cobbleblockcore.shrine.ShrineBlock.Shape.NARROW
import com.lucyazalea.cobbleblockcore.shrine.ShrineBlock.Shape.WIDE
import net.minecraft.world.item.Item
import net.neoforged.neoforge.registries.DeferredItem

object ShrineContent {
    // Both lists are in creative tab order.
    private val SHRINES = listOf(
        "articuno_shrine" to NARROW,
        "zapdos_shrine" to NARROW,
        "moltres_shrine" to NARROW,
        "lugia_shrine" to NARROW,
        "mew_shrine" to NARROW,
        "hooh_shrine" to WIDE,
        "celebi_shrine" to WIDE,
        "legendary_beasts_shrine" to NARROW,
    )

    private val ITEM_IDS = listOf(
        "arctic_wing", "charged_wing", "molten_wing", "fragile_ocarina", "ancient_fossil", "rainbow_feather", "time_flute",
        "raikou_offering", "entei_offering", "suicune_offering",
        "articuno_orb", "zapdos_orb", "moltres_orb",
        "blue_feather", "red_feather", "yellow_feather",
        "ancient_fossil_piece", "ancient_fossil_dust", "ancient_dna",
    )

    val items: List<DeferredItem<out Item>> =
        SHRINES.map { (id, shape) -> ITEMS.registerSimpleBlockItem(BLOCKS.register(id) { -> ShrineBlock(shape) }) } +
            ITEM_IDS.map { ITEMS.registerSimpleItem(it) }
}
