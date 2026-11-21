<script setup lang="ts">
import { blockedReason, exposures, habitatErrors, spawnTypes, wouldBreak, type Habitat } from '#shared/rules'
import type { HabitatData } from '#shared/spawns'

definePageMeta({ key: 'habitats' })

const route = useRoute()
const toast = useToast()
const { data, refresh } = await useFetch<HabitatData>('/api/habitats')

const dimensions = ['minecraft:overworld', 'minecraft:the_nether', 'minecraft:the_end', 'cobbleblock:ancient_forest']
const exposureHelp = { outdoors: 'sky light 8–15', sheltered: 'sky light 0–7', any: 'no sky light check' }

const selectedId = computed(() => route.params.id as string | undefined)
const habitat = ref<Habitat>()

function load(id?: string) {
  const saved = data.value?.habitats.find(habitat => habitat.id === id)
  habitat.value = saved && structuredClone(toRaw(saved))
}
watch(selectedId, load, { immediate: true })

async function newHabitat() {
  await navigateTo('/habitats')
  habitat.value = { id: '', blocks: [], exposure: 'outdoors', dimensions: ['minecraft:overworld'], allowed: ['ground'] }
}

function useCount(id: string) {
  return data.value?.spawns.filter(spawn => spawn.habitat === id).length ?? 0
}

const errors = computed(() => habitat.value ? habitatErrors(habitat.value) : [])
const broken = computed(() => habitat.value && selectedId.value
  ? wouldBreak(data.value?.spawns.filter(spawn => spawn.habitat === selectedId.value) ?? [], { ...habitat.value, id: selectedId.value })
  : [])

function toggleType(type: typeof spawnTypes[number], on: boolean | 'indeterminate') {
  const allowed = habitat.value!.allowed.filter(other => other !== type)
  habitat.value!.allowed = on === true ? [...allowed, type] : allowed
}

const saving = ref(false)
async function save() {
  saving.value = true
  try {
    await $fetch(`/api/habitats/${selectedId.value || habitat.value!.id}`, { method: 'PUT', body: habitat.value })
    toast.add({ title: 'Saved', color: 'success' })
    await refresh()
    if (habitat.value!.id === selectedId.value) load(selectedId.value)
    else await navigateTo(`/habitats/${habitat.value!.id}`)
  } catch (error) {
    toast.add({ title: 'Not saved', description: errorMessage(error), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex flex-wrap">
    <aside class="flex w-64 flex-col gap-3 border-r border-default p-4">
      <UButton
        label="New habitat"
        icon="i-lucide-plus"
        color="neutral"
        variant="outline"
        @click="newHabitat"
      />
      <nav class="-mx-2">
        <NuxtLink
          v-for="other in data?.habitats"
          :key="other.id"
          :to="`/habitats/${other.id}`"
          class="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-elevated"
          :class="{ 'bg-elevated font-medium': other.id === selectedId }"
        >
          <span>{{ other.id }}</span>
          <span class="text-xs text-muted">{{ useCount(other.id) }}</span>
        </NuxtLink>
      </nav>
    </aside>

    <main
      v-if="habitat"
      class="flex min-w-0 flex-[999_1_560px] flex-col gap-6 p-6"
    >
      <UFormField
        label="ID"
        :error="errors[0]"
      >
        <div class="flex flex-wrap justify-between gap-3">
          <UInput
            v-model="habitat.id"
            class="w-60"
          />
          <UButton
            label="Save"
            :loading="saving"
            :disabled="errors.length > 0"
            @click="save"
          />
        </div>
      </UFormField>

      <div class="grid gap-6 md:grid-cols-3">
        <UFormField label="Dimensions">
          <UCheckboxGroup
            v-model="habitat.dimensions"
            :items="dimensions"
          />
        </UFormField>
        <UFormField label="Exposure">
          <URadioGroup
            v-model="habitat.exposure"
            :items="exposures.map(value => ({ label: value, value, description: exposureHelp[value] }))"
          />
        </UFormField>
        <UFormField label="Allowed spawn types">
          <div class="flex flex-col gap-2">
            <UCheckbox
              v-for="type in spawnTypes"
              :key="type"
              :label="type"
              :description="blockedReason(habitat, type)"
              :disabled="!!blockedReason(habitat, type)"
              :model-value="habitat.allowed.includes(type) && !blockedReason(habitat, type)"
              @update:model-value="toggleType(type, $event)"
            />
          </div>
        </UFormField>
      </div>

      <UFormField
        label="Blocks"
        help="Spawns need one of these nearby, and ground spawns can also stand on them. Leave empty for a habitat with no block check."
      >
        <BlockList v-model="habitat.blocks" />
      </UFormField>

      <UAlert
        v-if="broken.length > 0"
        color="warning"
        variant="subtle"
        title="Saving this breaks these spawns"
        :description="broken.map(spawn => `${spawn.id} (${spawn.type})`).join(', ')"
      />
    </main>
    <main
      v-else
      class="flex flex-1 items-center justify-center p-6 text-muted"
    >
      Pick a habitat or make a new one.
    </main>
  </div>
</template>
