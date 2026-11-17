package com.lucyazalea.cobbleblockcore.templates;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.List;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.NbtAccounter;
import net.minecraft.nbt.NbtIo;
import net.minecraft.nbt.NbtUtils;
import net.minecraft.nbt.Tag;

/** Converts a structure template between binary `.nbt` and SNBT text, so it can be read and edited. */
public class TemplateText {
    public static void main(String[] args) throws Exception {
        if (args.length != 2 || !List.of("to-text", "from-text").contains(args[0])) {
            throw new IllegalArgumentException("usage: (to-text <template.nbt> | from-text <template.snbt>)");
        }
        Path file = Path.of(args[1]);
        if (args[0].equals("to-text")) {
            Path text = sibling(file, ".nbt", ".snbt");
            if (Files.exists(text)) throw new IllegalStateException(text + " already exists; convert it back or delete it first");
            CompoundTag tag = NbtIo.readCompressed(file, NbtAccounter.unlimitedHeap());
            Files.writeString(text, NbtUtils.structureToSnbt(tag.copy()));
            if (!comparable(NbtUtils.snbtToStructure(Files.readString(text))).equals(comparable(tag))) {
                throw new IllegalStateException(text + " doesn't read back the same as " + file);
            }
            System.out.println("Wrote " + text);
        } else {
            Path binary = sibling(file, ".snbt", ".nbt");
            CompoundTag tag = NbtUtils.snbtToStructure(Files.readString(file));
            NbtIo.writeCompressed(tag, binary);
            Files.delete(file);
            System.out.println("Wrote " + binary + " and removed " + file);
        }
    }

    private static Path sibling(Path file, String from, String to) {
        String name = file.getFileName().toString();
        if (!name.endsWith(from)) throw new IllegalArgumentException(file + " isn't a " + from + " file");
        return file.resolveSibling(name.substring(0, name.length() - from.length()) + to);
    }

    // Block and entity order doesn't matter to a template, and the SNBT writer changes it.
    private static List<Object> comparable(CompoundTag tag) {
        CompoundTag rest = tag.copy();
        rest.remove("blocks");
        rest.remove("entities");
        return List.of(rest, new HashSet<Tag>(tag.getList("blocks", Tag.TAG_COMPOUND)), new HashSet<Tag>(tag.getList("entities", Tag.TAG_COMPOUND)));
    }
}
