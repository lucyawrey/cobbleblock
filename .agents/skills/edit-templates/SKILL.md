---
name: edit-templates
description: Read or edit a structure template (.nbt) by converting it to SNBT text and back. Use when a task needs to see or change what a template holds, such as blocks, chest contents or entities.
---

# Edit structure templates

Templates are binary, gzipped `.nbt` files, so read and edit them as SNBT text:

- Core's templates: `core/src/main/resources/data/cobbleblock/structure/`
- Skyblock Builder's island and portal templates: `pack/config/skyblockbuilder/templates/`

## Steps

1. Convert to text: `./gradlew :core:templateToText -Pfile=<path>.nbt`. This writes `<path>.snbt` beside it, and fails if the text wouldn't read back the same.
2. Edit the `.snbt`. Search it with grep and read ranges; large templates run to thousands of lines.
3. Convert back: `./gradlew :core:templateFromText -Pfile=<path>.snbt`. This writes `<path>.nbt` and deletes the `.snbt`.

`.snbt` files are git-ignored, so the text copy is never committed. Commit only the `.nbt`.

## Layout

The text is vanilla's SNBT template format:

- `palette`: block states as strings, such as `"minecraft:chest{facing:south,type:single,waterlogged:false}"`.
- `blocks`: one line per block, `{pos: [x, y, z], state: <palette entry>, nbt: {...}}`. `nbt` is the block entity, for example a chest's `Items`. The `state` must be a string that's in `palette`.
- `entities`: `{blockPos, pos, nbt}` per entity. Usually empty.
- `size` and `DataVersion`: leave as they are.

Items use 1.21 components, for example a torn page: `{Slot: 0b, components: {"cobbleblock:page": "page_5_meteor"}, count: 1, id: "cobbleblock:torn_page"}`.
