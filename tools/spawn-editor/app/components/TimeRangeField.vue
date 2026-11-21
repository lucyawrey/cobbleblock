<script setup lang="ts">
import { formatTicks, parseTicks, timeRanges } from '#shared/spawns'

const model = defineModel<string>({ required: true })

const items = [
  ...Object.entries(timeRanges).map(([value, ticks]) => ({ label: ticks ? `${value} (${ticks})` : value, value })),
  { label: 'custom ticks', value: 'custom' }
]

const choice = computed({
  get: () => model.value in timeRanges ? model.value : 'custom',
  set: value => model.value = value === 'custom' ? '13000-22999' : value
})

const ticks = computed<[number, number]>(() => parseTicks(model.value) ?? [0, 23999])
const from = computed({ get: () => ticks.value[0], set: value => model.value = formatTicks([value, ticks.value[1]]) })
const to = computed({ get: () => ticks.value[1], set: value => model.value = formatTicks([ticks.value[0], value]) })
</script>

<template>
  <div class="flex flex-col gap-2">
    <USelect
      v-model="choice"
      :items="items"
      class="w-full"
    />
    <div
      v-if="choice === 'custom'"
      class="flex items-center gap-2"
    >
      <UInputNumber
        v-model="from"
        orientation="vertical"
        class="min-w-0 flex-1"
        :min="0"
        :max="23999"
        :step="100"
        aria-label="From tick"
      />
      <span class="text-muted">to</span>
      <UInputNumber
        v-model="to"
        orientation="vertical"
        class="min-w-0 flex-1"
        :min="0"
        :max="23999"
        :step="100"
        aria-label="To tick"
      />
    </div>
  </div>
</template>
