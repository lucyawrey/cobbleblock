<script setup lang="ts">
import type { BlockIcon } from '~~/server/utils/blocks'

const props = defineProps<{ id: string }>()

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
      v-else-if="data?.texture"
      :src="data.texture"
      alt=""
      class="size-4 [image-rendering:pixelated]"
    >
  </span>
</template>
