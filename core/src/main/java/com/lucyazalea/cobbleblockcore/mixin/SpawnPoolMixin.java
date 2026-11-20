package com.lucyazalea.cobbleblockcore.mixin;

import com.cobblemon.mod.common.api.spawning.SpawnSet;
import com.cobblemon.mod.common.api.spawning.detail.SpawnPool;
import java.util.Map;
import java.util.stream.Collectors;
import net.minecraft.resources.ResourceLocation;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.ModifyVariable;

@Mixin(value = SpawnPool.class, remap = false)
public abstract class SpawnPoolMixin {
    @Shadow
    public abstract String getName();

    @ModifyVariable(method = "reload", at = @At("HEAD"), argsOnly = true)
    private Map<ResourceLocation, SpawnSet> cobbleblockcore$onlyPackSpawns(Map<ResourceLocation, SpawnSet> data) {
        if (!getName().equals("world")) {
            return data;
        }

        return data.entrySet().stream()
                .filter(entry -> entry.getKey().getNamespace().equals("cobbleblock"))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }
}
