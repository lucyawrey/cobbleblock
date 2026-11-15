package com.lucyazalea.cobblemonwildloot;

import net.minecraft.core.BlockPos;
import net.minecraft.core.HolderLookup;
import net.minecraft.core.NonNullList;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.network.chat.Component;
import net.minecraft.world.ContainerHelper;
import net.minecraft.world.entity.player.Inventory;
import net.minecraft.world.inventory.AbstractContainerMenu;
import net.minecraft.world.inventory.ChestMenu;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.block.entity.BaseContainerBlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import org.jetbrains.annotations.NotNull;

public class PokebasketEntity extends BaseContainerBlockEntity {

    public static final int INVENTORY_SIZE = 27;
    private NonNullList<ItemStack> inventory;

    public PokebasketEntity(BlockPos pos, BlockState state) {
        super(CobblemonWildLoot.POKEBASKET_ENTITY.get(), pos, state);

        this.inventory = NonNullList.withSize(INVENTORY_SIZE, ItemStack.EMPTY);
    }

    @Override
    protected @NotNull Component getDefaultName() {
        return Component.translatable("block.cobblemonwildloot.pokebasket");
    }

    @Override
    protected @NotNull NonNullList<ItemStack> getItems() {
        return this.inventory;
    }

    @Override
    protected void setItems(@NotNull NonNullList<ItemStack> items) {
        this.inventory = items;
    }

    public boolean addStack(ItemStack newStack) {
        for (var i = 0; i < inventory.size(); i++) {
            var stack = inventory.get(i);
            if (stack.isEmpty()) {
                inventory.set(i, newStack);
                setChanged();
                return true;
            } else if (stack.is(newStack.getItem()) && stack.getCount() + newStack.getCount() < stack.getMaxStackSize()) {
                inventory.get(i).setCount(stack.getCount() + newStack.getCount());
                setChanged();
                return true;
            }
        }
        return false;
    }

    @Override
    protected void loadAdditional(@NotNull CompoundTag tag, HolderLookup.@NotNull Provider registries) {
        super.loadAdditional(tag, registries);

        this.inventory = NonNullList.withSize(getContainerSize(), ItemStack.EMPTY);
        ContainerHelper.loadAllItems(tag, this.inventory, registries);
    }

    @Override
    protected void saveAdditional(@NotNull CompoundTag tag, HolderLookup.@NotNull Provider registries) {
        super.saveAdditional(tag, registries);

        ContainerHelper.saveAllItems(tag, this.inventory, registries);
    }

    @Override
    protected @NotNull AbstractContainerMenu createMenu(int containerId, @NotNull Inventory inventory) {
        return ChestMenu.threeRows(containerId, inventory, this);
    }

    @Override
    public int getContainerSize() {
        return INVENTORY_SIZE;
    }
}
