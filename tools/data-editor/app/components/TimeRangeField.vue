<script setup lang="ts">
import { formatTicks, parseTicks, timeRanges } from '#shared/spawns'

const model = defineModel<string>({ required: true })

const items = [
  ...timeRanges.filter(value => value !== 'any').map(value => ({ label: value, value })),
  { label: 'custom ticks', value: 'custom' }
]

// The JSON value is a comma list of names and tick ranges, or 'any'.
const parts = computed(() => model.value === 'any' ? [] : model.value.split(','))
const names = computed(() => parts.value.filter(part => timeRanges.includes(part)))
const ticks = computed(() => parseTicks(parts.value.filter(part => !timeRanges.includes(part)).join(',')))

function write(names: string[], ticks?: [number, number]) {
  const all = [...names, ...(ticks ? [formatTicks(ticks)] : [])]
  model.value = all.length > 0 ? all.join(',') : 'any'
}

const selected = computed({
  get: () => [...names.value, ...(ticks.value ? ['custom'] : [])],
  set: values => write(values.filter(value => value !== 'custom'), values.includes('custom') ? ticks.value ?? [13000, 22999] : undefined)
})
const from = computed({ get: () => ticks.value![0], set: value => write(names.value, [value, ticks.value![1]]) })
const to = computed({ get: () => ticks.value![1], set: value => write(names.value, [ticks.value![0], value]) })
</script>

<template>
  <div class="flex flex-col gap-2">
    <USelectMenu
      v-model="selected"
      :items="items"
      value-key="value"
      multiple
      placeholder="any"
      class="w-full"
    />
    <div
      v-if="ticks"
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
