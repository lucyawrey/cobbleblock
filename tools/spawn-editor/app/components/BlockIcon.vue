<script setup lang="ts">
import type { BlockIcon } from '~~/server/utils/blocks'

const props = defineProps<{ id: string }>()

// Three faces of an 11px cube, seen from above at the front corner, with the sides darkened as in game.
const faces = [
  { texture: 'top', transform: 'rotateX(90deg) translateZ(5.5px)', filter: 'none' },
  { texture: 'side', transform: 'translateZ(5.5px)', filter: 'brightness(0.8)' },
  { texture: 'side', transform: 'rotateY(90deg) translateZ(5.5px)', filter: 'brightness(0.6)' }
] as const

const { data } = useFetch<BlockIcon>('/api/blocks/icon', { query: { id: props.id }, server: false, lazy: true })
</script>

<template>
  <span class="flex size-5 shrink-0 items-center justify-center">
    <UIcon
      v-if="id.startsWith('#')"
      name="i-lucide-tag"
      class="size-4 text-muted"
    />
    <img
      v-else-if="data?.flat"
      :src="data.flat"
      alt=""
      class="size-4 [image-rendering:pixelated]"
    >
    <span
      v-else-if="data?.top"
      class="relative size-[11px]"
      style="transform-style: preserve-3d; transform: rotateX(-30deg) rotateY(45deg)"
    >
      <img
        v-for="(face, index) in faces"
        :key="index"
        :src="data[face.texture]"
        alt=""
        class="absolute inset-0 size-[11px] [image-rendering:pixelated]"
        :style="{ transform: face.transform, filter: face.filter }"
      >
    </span>
  </span>
</template>
