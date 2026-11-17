package com.lucyazalea.cobbleblockcore.shrine

import kotlin.test.Test
import kotlin.test.assertEquals

class RequirementsTest {
    @Test
    fun `lists only what is short, with how many more are needed`() {
        assertEquals(listOf("ice" to 5), missing(mapOf("ice" to 20, "orb" to 1), mapOf("ice" to 15, "orb" to 1)))
    }

    @Test
    fun `counts something never seen as fully missing`() {
        assertEquals(listOf("orb" to 1), missing(mapOf("orb" to 1), emptyMap()))
    }
}
