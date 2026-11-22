<script setup lang="ts">
import { copy } from '#shared/copy'

const model = defineModel<string[]>({ required: true })

const { data: blocks } = await useFetch<string[]>('/api/blocks')

const blockToAdd = ref<string | null>(null)
const blockOptions = computed(() => (blocks.value ?? []).filter(block => !model.value.includes(block)))
watch(blockToAdd, (block) => {
  if (!block) return
  model.value.push(block)
  blockToAdd.value = null
})
</script>

<template>
  <div class="flex max-w-xl flex-col gap-1">
    <div
      v-for="(block, index) in model"
      :key="block"
      class="flex items-center justify-between gap-2 rounded-md border border-default px-2 py-1 text-sm"
    >
      <span class="flex items-center gap-2">
        <BlockIcon :id="block" />
        {{ block }}
        <UBadge
          v-if="blocks && !blocks.includes(block)"
          color="warning"
          variant="subtle"
          size="sm"
          :label="copy.blockList.notInPack"
        />
      </span>
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="xs"
        :aria-label="copy.blockList.remove"
        @click="model.splice(index, 1)"
      />
    </div>
    <UInputMenu
      v-model.nullable="blockToAdd"
      :items="blockOptions"
      virtualize
      :placeholder="copy.blockList.add"
      class="w-full"
    />
  </div>
</template>
