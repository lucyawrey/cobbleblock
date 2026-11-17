package com.lucyazalea.cobbleblockcore.shrine

/** What's still missing from [required], given what's [counted]: each ID with how many more are needed. */
fun <K> missing(required: Map<K, Int>, counted: Map<K, Int>): List<Pair<K, Int>> =
    required.mapNotNull { (id, amount) -> (amount - (counted[id] ?: 0)).takeIf { it > 0 }?.let { id to it } }
