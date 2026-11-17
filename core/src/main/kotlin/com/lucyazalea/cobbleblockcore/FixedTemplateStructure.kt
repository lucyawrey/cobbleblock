package com.lucyazalea.cobbleblockcore

import com.mojang.serialization.MapCodec
import com.mojang.serialization.codecs.RecordCodecBuilder
import net.minecraft.core.BlockPos
import net.minecraft.nbt.CompoundTag
import net.minecraft.resources.ResourceLocation
import net.minecraft.util.RandomSource
import net.minecraft.world.level.ChunkPos
import net.minecraft.world.level.ServerLevelAccessor
import net.minecraft.world.level.levelgen.structure.BoundingBox
import net.minecraft.world.level.levelgen.structure.Structure
import net.minecraft.world.level.levelgen.structure.StructureType
import net.minecraft.world.level.levelgen.structure.TemplateStructurePiece
import net.minecraft.world.level.levelgen.structure.pieces.StructurePieceType
import net.minecraft.world.level.levelgen.structure.templatesystem.StructurePlaceSettings
import net.minecraft.world.level.levelgen.structure.templatesystem.StructureTemplateManager
import java.util.Optional

/** Places one structure template with its corner at a fixed block, for hand-built places in shrine dimensions. */
class FixedTemplateStructure(settings: StructureSettings, val template: ResourceLocation, val origin: BlockPos) : Structure(settings) {
    override fun findGenerationPoint(context: GenerationContext): Optional<GenerationStub> {
        if (context.chunkPos() != ChunkPos(origin)) return Optional.empty()
        return Optional.of(GenerationStub(origin) { it.addPiece(Piece(context.structureTemplateManager(), template, origin)) })
    }

    override fun type(): StructureType<*> = TYPE

    class Piece : TemplateStructurePiece {
        constructor(templates: StructureTemplateManager, template: ResourceLocation, origin: BlockPos) :
            super(PIECE_TYPE, 0, templates, template, template.toString(), PLACEMENT, origin)

        constructor(templates: StructureTemplateManager, tag: CompoundTag) : super(PIECE_TYPE, tag, templates, { PLACEMENT })

        override fun handleDataMarker(marker: String, pos: BlockPos, level: ServerLevelAccessor, random: RandomSource, box: BoundingBox) {}
    }

    companion object {
        private val PLACEMENT = StructurePlaceSettings().setKnownShape(true)

        val CODEC: MapCodec<FixedTemplateStructure> = RecordCodecBuilder.mapCodec { instance ->
            instance.group(
                settingsCodec(instance),
                ResourceLocation.CODEC.fieldOf("template").forGetter { it.template },
                BlockPos.CODEC.fieldOf("origin").forGetter { it.origin },
            ).apply(instance, ::FixedTemplateStructure)
        }
        val TYPE = StructureType { CODEC }
        val PIECE_TYPE = StructurePieceType.StructureTemplateType(FixedTemplateStructure::Piece)
    }
}
