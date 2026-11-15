package com.lucyazalea.cobblemonwildloot;

import com.mojang.serialization.MapCodec;
import dev.architectury.event.EventResult;
import dev.architectury.event.events.common.InteractionEvent;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.world.Containers;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.*;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.entity.BlockEntityTicker;
import net.minecraft.world.level.block.entity.BlockEntityType;
import net.minecraft.world.level.block.state.BlockState;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

public class PokebasketBlock extends BaseEntityBlock implements InteractionEvent.RightClickBlock {
    public static final MapCodec<PokebasketBlock> CODEC = simpleCodec(PokebasketBlock::new);

    @Override
    protected @NotNull MapCodec<? extends BaseEntityBlock> codec() {
        return CODEC;
    }

    protected PokebasketBlock(Properties properties) {
        super(properties);
        this.registerDefaultState(this.getStateDefinition().any());
        InteractionEvent.RIGHT_CLICK_BLOCK.register(this);
    }

    @Override
    protected void onRemove(@NotNull BlockState state, @NotNull Level level, @NotNull BlockPos pos, @NotNull BlockState newState, boolean movedByPiston) {
        Containers.dropContentsOnDestroy(state, newState, level, pos);
        super.onRemove(state, level, pos, newState, movedByPiston);
    }

    @Override
    public EventResult click(Player player, InteractionHand interactionHand, BlockPos blockPos, Direction direction) {
        if(player.level().getBlockEntity(blockPos) == null || !(player.level().getBlockEntity(blockPos) instanceof PokebasketEntity blockEntity)){
            return EventResult.pass();
        }
        if(player.isShiftKeyDown()){
            return EventResult.pass();
        }

        player.openMenu(blockEntity);

        return EventResult.interruptTrue();
    }

    @Override
    public @NotNull RenderShape getRenderShape(@NotNull BlockState state) {
        return RenderShape.MODEL; // Tells Minecraft to use the standard JSON model
    }

    @Override
    public @Nullable BlockEntity newBlockEntity(@NotNull BlockPos pos, @NotNull BlockState state) {
        return new PokebasketEntity(pos, state);
    }

//    @Override
//    public @Nullable <T extends BlockEntity> BlockEntityTicker<T> getTicker(@NotNull Level level, @NotNull BlockState state, @NotNull BlockEntityType<T> blockEntityType) {
//        return new PokebasketEntity.Ticker<>();
//    }
}