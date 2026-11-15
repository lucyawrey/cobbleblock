package com.lucyazalea.cobblemonwildloot.mixin;

import com.lucyazalea.cobblemonwildloot.CobblemonWildLoot;
import com.cobblemon.mod.common.api.drop.DropEntry;
import com.cobblemon.mod.common.api.drop.DropTable;
import com.cobblemon.mod.common.api.drop.ItemDropEntry;
import com.cobblemon.mod.common.entity.pokemon.PokemonEntity;
import com.cobblemon.mod.common.pokemon.FormData;
import com.lucyazalea.cobblemonwildloot.PokebasketEntity;
import kotlin.random.Random;
import kotlin.ranges.RangesKt;
import net.minecraft.core.BlockPos;
import net.minecraft.core.registries.Registries;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.entity.item.ItemEntity;
import net.minecraft.world.level.block.entity.BlockEntity;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import net.minecraft.world.item.ItemStack;

import java.util.Arrays;
import java.util.List;

import static java.lang.System.*;

@Mixin(PokemonEntity.class)
public class PokemonEntityTickMixin {
    @Inject(at = @At("HEAD"), method = "tick")
    public void tick(CallbackInfo ci) {
        PokemonEntity entity = (PokemonEntity) (Object) this;
        if (entity == null) return;
        var world = entity.level();
        if (world == null || world.isClientSide) return;

        double dropChance = CobblemonWildLoot.CONFIG.getDropChance() / CobblemonWildLoot.CONFIG.getDropCheckTicks();
        if (Math.random() < dropChance) {
            var pokemon = entity.getPokemon();
            if (pokemon == null) return;

            if (!pokemon.isFainted() && !pokemon.isBattleClone() && !pokemon.isNPCOwned() && !pokemon.isUncatchable()) {
                try {
                    FormData form = pokemon.getForm();
                    DropTable dropTable = form.getDrops();
                    List<DropEntry> drops = dropTable.getDrops(dropTable.getAmount(), pokemon);
                    if (drops.isEmpty()) return;

                    for (var drop : drops) {
                        if (drop instanceof ItemDropEntry itemDropEntry && !CobblemonWildLoot.CONFIG.getItemBlacklist().contains(itemDropEntry.getItem().toString())) {
                            var item = world.registryAccess().registryOrThrow(Registries.ITEM).get(itemDropEntry.getItem());
                            var quantity = itemDropEntry.getQuantityRange() != null ? RangesKt.random(itemDropEntry.getQuantityRange(), Random.Default) : itemDropEntry.getQuantity();
                            var chance = itemDropEntry.getPercentage() == 100f || Math.random() * 100f < itemDropEntry.getPercentage();
                            if (item != null && quantity > 0 && chance) {
                                var stack = new ItemStack(item, quantity);

                                var droppedIntoBasket = false;
                                BlockPos centerPos = entity.blockPosition();
                                var rad = CobblemonWildLoot.CONFIG.getPokebasketBlockRadius();
                                for (var pos : BlockPos.betweenClosed(centerPos.offset(-rad, -rad, -rad), centerPos.offset(rad, rad, rad))) {
                                    BlockEntity blockEntity = world.getBlockEntity(pos);
                                    if (blockEntity instanceof PokebasketEntity basket) {
                                        if (basket.addStack(stack)) {
                                            droppedIntoBasket = true;
                                        }
                                    }
                                }
                                if (!droppedIntoBasket) {
                                    var pos = entity.position();
                                    world.addFreshEntity(new ItemEntity(world, pos.x, pos.y, pos.z, stack));
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    CobblemonWildLoot.LOGGER.error(e.toString());
                }
            }
        }
    }
}