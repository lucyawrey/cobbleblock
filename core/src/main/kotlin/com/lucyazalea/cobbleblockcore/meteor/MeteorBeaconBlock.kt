package com.lucyazalea.cobbleblockcore.meteor

import net.minecraft.core.BlockPos
import net.minecraft.server.level.ServerLevel
import net.minecraft.util.RandomSource
import net.minecraft.world.level.BlockGetter
import net.minecraft.world.level.block.Block
import net.minecraft.world.level.block.SoundType
import net.minecraft.world.level.block.state.BlockState
import net.minecraft.world.phys.shapes.CollisionContext
import net.minecraft.world.phys.shapes.VoxelShape

class MeteorBeaconBlock : Block(
    Properties.of().sound(SoundType.STONE).strength(3f, 10f).requiresCorrectToolForDrops().noOcclusion().randomTicks()
) {
    override fun getShape(state: BlockState, level: BlockGetter, pos: BlockPos, context: CollisionContext): VoxelShape = SHAPE

    override fun randomTick(state: BlockState, level: ServerLevel, pos: BlockPos, random: RandomSource) {
        // Random ticks reach a block about every 68 seconds on average.
        if (random.nextFloat() < CRASH_CHANCE) Meteors.crash(level, pos, random)
    }

    companion object {
        private const val CRASH_CHANCE = 0.035f
        private val SHAPE = box(6.0, 0.0, 6.0, 9.0, 14.0, 9.0)
    }
}
