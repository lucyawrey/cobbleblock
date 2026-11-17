package com.lucyazalea.cobbleblockcore

import net.minecraft.network.chat.Component
import net.minecraft.world.InteractionHand
import net.minecraft.world.InteractionResultHolder
import net.minecraft.world.entity.Entity
import net.minecraft.world.entity.LivingEntity
import net.minecraft.world.entity.player.Player
import net.minecraft.world.item.Item
import net.minecraft.world.item.ItemStack
import net.minecraft.world.item.UseAnim
import net.minecraft.core.component.DataComponents
import net.minecraft.world.level.Level

// Using a page is what unlocks it: the journal advancements trigger on `minecraft:using_item` and match its `cobbleblock:page`.
class TornPageItem : Item(Properties()) {
    override fun use(level: Level, player: Player, hand: InteractionHand): InteractionResultHolder<ItemStack> {
        player.startUsingItem(hand)
        return InteractionResultHolder.consume(player.getItemInHand(hand))
    }

    override fun getUseDuration(stack: ItemStack, entity: LivingEntity) = 1

    override fun getUseAnimation(stack: ItemStack) = UseAnim.NONE

    override fun finishUsingItem(stack: ItemStack, level: Level, entity: LivingEntity): ItemStack {
        if (!level.isClientSide) stack.shrink(1)
        return stack
    }

    override fun getName(stack: ItemStack): Component =
        stack.get(CobbleblockContent.PAGE)?.let { Component.translatable("$descriptionId.$it") } ?: super.getName(stack)

    // Pages made before the `cobbleblock:page` component (in saves, and in the meteor_journal_1 template) carry
    // `custom_data` `torn_page_id` and a fixed name; they're converted once they reach an inventory.
    override fun inventoryTick(stack: ItemStack, level: Level, entity: Entity, slot: Int, selected: Boolean) {
        if (level.isClientSide || stack.has(CobbleblockContent.PAGE)) return
        val data = stack.get(DataComponents.CUSTOM_DATA) ?: return
        val page = data.copyTag().getString("torn_page_id").ifEmpty { return }
        stack.set(CobbleblockContent.PAGE, page)
        stack.remove(DataComponents.CUSTOM_DATA)
        stack.remove(DataComponents.ITEM_NAME)
    }

    companion object {
        fun of(page: String) = ItemStack(CobbleblockContent.TORN_PAGE.get()).apply { set(CobbleblockContent.PAGE, page) }
    }
}
