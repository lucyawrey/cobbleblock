package com.lucyazalea.cobbleblockcore.mixin;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Map;
import net.minecraft.resources.ResourceLocation;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.ModifyVariable;

// Cobblemon applies species additions in hash map order, so when two files set the same field
// (such as ATM x MSD's drops and the pack's), the winner is arbitrary. The pack's go last.
@Mixin(targets = "com.cobblemon.mod.common.pokemon.SpeciesAdditions", remap = false)
public abstract class SpeciesAdditionsMixin {
    @ModifyVariable(method = "reload", at = @At("HEAD"), argsOnly = true)
    private Map<ResourceLocation, Object> cobbleblockcore$packAdditionsLast(Map<ResourceLocation, Object> data) {
        var ordered = new LinkedHashMap<ResourceLocation, Object>();
        data.entrySet().stream()
                .sorted(Comparator.comparing(entry -> entry.getKey().getNamespace().equals("cobbleblock")))
                .forEach(entry -> ordered.put(entry.getKey(), entry.getValue()));
        return ordered;
    }
}
