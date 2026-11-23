<script setup lang="ts">
import { copy } from '#shared/copy'
import { blockedReason, exposures, habitatErrors, spawnTypes, wouldBreak, type Habitat } from '#shared/rules'
import type { HabitatData } from '#shared/spawns'

definePageMeta({ key: 'habitats' })

const route = useRoute()
const toast = useToast()
const { data, refresh } = await useFetch<HabitatData>('/api/habitats')

const dimensions = ['minecraft:overworld', 'minecraft:the_nether', 'minecraft:the_end', 'cobbleblock:ancient_forest']

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
const renamed = computed(() => habitat.value && selectedId.value && habitat.value.id !== selectedId.value
  ? data.value?.spawns.filter(spawn => spawn.habitat === selectedId.value) ?? []
  : [])
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
    toast.add({ title: copy.common.saved, color: 'success' })
    await refresh()
    if (habitat.value!.id === selectedId.value) load(selectedId.value)
    else await navigateTo(`/habitats/${habitat.value!.id}`)
  } catch (error) {
    toast.add({ title: copy.common.notSaved, description: errorMessage(error), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex flex-wrap">
    <aside class="flex w-64 flex-col gap-3 border-r border-default p-4">
      <UButton
        :label="copy.habitats.new"
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
          <span class="flex items-center gap-2">
            <UBadge
              v-if="other.draft"
              color="info"
              variant="subtle"
              size="sm"
              :label="copy.habitats.draft"
            />
            <span class="text-xs text-muted">{{ useCount(other.id) }}</span>
          </span>
        </NuxtLink>
      </nav>
    </aside>

    <main
      v-if="habitat"
      class="flex min-w-0 flex-[999_1_560px] flex-col gap-6 p-6"
    >
      <UFormField
        :label="copy.habitats.id"
        :error="errors[0]"
      >
        <div class="flex flex-wrap justify-between gap-3">
          <UInput
            v-model="habitat.id"
            class="w-60"
          />
          <UButton
            :label="copy.common.save"
            :loading="saving"
            :disabled="errors.length > 0"
            @click="save"
          />
        </div>
      </UFormField>

      <div class="grid gap-6 md:grid-cols-3">
        <UFormField :label="copy.habitats.dimensions">
          <UCheckboxGroup
            v-model="habitat.dimensions"
            :items="dimensions"
          />
        </UFormField>
        <UFormField :label="copy.habitats.exposure">
          <URadioGroup
            v-model="habitat.exposure"
            :items="exposures.map(value => ({ label: value, value, description: copy.habitats.exposureHelp[value] }))"
          />
        </UFormField>
        <UFormField :label="copy.habitats.allowedTypes">
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
        :label="copy.habitats.blocks"
        :help="copy.habitats.blocksHelp"
      >
        <BlockList v-model="habitat.blocks" />
      </UFormField>

      <UAlert
        v-if="broken.length > 0"
        color="warning"
        variant="subtle"
        :title="copy.habitats.breaksSpawns"
        :description="broken.map(spawn => `${spawn.id} (${spawn.type})`).join(', ')"
      />
      <UAlert
        v-if="renamed.length > 0"
        color="info"
        variant="subtle"
        :title="copy.habitats.renamesSpawns"
        :description="renamed.map(spawn => spawn.id).join(', ')"
      />
    </main>
    <main
      v-else
      class="flex flex-1 items-center justify-center p-6 text-muted"
    >
      {{ copy.habitats.empty }}
    </main>
  </div>
</template>
