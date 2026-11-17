package com.lucyazalea.cobbleblockcore.shrine

import net.minecraft.core.BlockPos
import net.minecraft.core.Direction
import net.minecraft.server.level.ServerPlayer
import net.minecraft.world.InteractionHand
import net.minecraft.world.ItemInteractionResult
import net.minecraft.world.entity.player.Player
import net.minecraft.world.item.ItemStack
import net.minecraft.world.item.context.BlockPlaceContext
import net.minecraft.world.level.BlockGetter
import net.minecraft.world.level.Level
import net.minecraft.world.level.block.Block
import net.minecraft.world.level.block.SoundType
import net.minecraft.world.level.block.state.BlockState
import net.minecraft.world.level.block.state.StateDefinition
import net.minecraft.world.level.block.state.properties.BlockStateProperties
import net.minecraft.world.phys.BlockHitResult
import net.minecraft.world.phys.shapes.CollisionContext
import net.minecraft.world.phys.shapes.VoxelShape

class ShrineBlock(private val shape: Shape) : Block(
    Properties.of().sound(SoundType.STONE).strength(10f, 100f).requiresCorrectToolForDrops().noOcclusion()
) {
    init {
        registerDefaultState(stateDefinition.any().setValue(FACING, Direction.NORTH))
    }

    override fun createBlockStateDefinition(builder: StateDefinition.Builder<Block, BlockState>) {
        builder.add(FACING)
    }

    override fun getStateForPlacement(context: BlockPlaceContext): BlockState =
        defaultBlockState().setValue(FACING, context.horizontalDirection.opposite)

    override fun getShape(state: BlockState, level: BlockGetter, pos: BlockPos, context: CollisionContext): VoxelShape =
        if (state.getValue(FACING).axis == Direction.Axis.Z) shape.northSouth else shape.eastWest

    override fun useItemOn(
        stack: ItemStack, state: BlockState, level: Level, pos: BlockPos, player: Player, hand: InteractionHand, hit: BlockHitResult,
    ): ItemInteractionResult {
        if (hand != InteractionHand.MAIN_HAND) return ItemInteractionResult.SKIP_DEFAULT_BLOCK_INTERACTION
        if (player is ServerPlayer) ShrineUse.use(player, pos, state)
        return ItemInteractionResult.sidedSuccess(level.isClientSide)
    }

    /** The shrine's hitbox: [northSouth] when it faces north or south, [eastWest] when it faces east or west. */
    enum class Shape(val northSouth: VoxelShape, val eastWest: VoxelShape) {
        NARROW(box(2.0, 0.0, 2.0, 14.0, 13.0, 14.0), box(2.0, 0.0, 2.0, 14.0, 13.0, 14.0)),
        WIDE(box(0.0, 0.0, 2.0, 16.0, 13.0, 14.0), box(2.0, 0.0, 0.0, 14.0, 13.0, 16.0)),
    }

    companion object {
        val FACING = BlockStateProperties.HORIZONTAL_FACING
    }
}
