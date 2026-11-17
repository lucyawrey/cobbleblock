package com.lucyazalea.cobbleblockcore

import net.minecraft.world.InteractionHand
import net.minecraft.world.InteractionResultHolder
import net.minecraft.world.entity.LivingEntity
import net.minecraft.world.entity.player.Player
import net.minecraft.world.item.Item
import net.minecraft.world.item.ItemStack
import net.minecraft.world.item.UseAnim
import net.minecraft.world.level.Level

// Using a page is what unlocks it: the journal advancements trigger on `minecraft:using_item` and match its `torn_page_id`.
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
}
