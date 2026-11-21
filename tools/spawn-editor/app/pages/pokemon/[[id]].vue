<script setup lang="ts">
import { isAllowed, spawnTypes } from '#shared/rules'
import { buckets, timeRanges, type EditorSpawn, type HabitatData, type PokemonDetail, type PokemonListItem, type PokemonStatus } from '#shared/spawns'

definePageMeta({ key: 'pokemon' })

const route = useRoute()
const toast = useToast()

const { data: list, refresh: refreshList } = await useFetch<PokemonListItem[]>('/api/pokemon')
const { data: habitatData } = await useFetch<HabitatData>('/api/habitats')

const search = ref('')
const statusFilter = ref<PokemonStatus | 'all'>('all')
const statusLabels: Record<PokemonStatus, string> = { none: 'no spawns', old: 'old format', draft: 'draft', new: 'done' }
const statusColors = { none: 'neutral', old: 'warning', draft: 'info', new: 'success' } as const

const filtered = computed(() => (list.value ?? []).filter(pokemon =>
  (statusFilter.value === 'all' || pokemon.status === statusFilter.value)
  && `${pokemon.dex} ${pokemon.name}`.toLowerCase().includes(search.value.toLowerCase())
))

const selectedId = computed(() => route.params.id as string | undefined)
const { data: detail, refresh: refreshDetail } = await useAsyncData(
  () => `pokemon-${selectedId.value}`,
  () => selectedId.value ? $fetch<PokemonDetail>(`/api/pokemon/${selectedId.value}`) : Promise.resolve(undefined)
)

const spawns = ref<EditorSpawn[]>([])
watch(detail, value => spawns.value = structuredClone(toRaw(value?.spawns ?? [])), { immediate: true })

const habitats = computed(() => habitatData.value?.habitats ?? [])

function typeOptions(spawn: EditorSpawn) {
  const habitat = habitats.value.find(habitat => habitat.id === spawn.habitat)
  return spawnTypes.map(type => ({ label: type, value: type, disabled: !habitat || !isAllowed(habitat, type) }))
}

function signatureHelp(spawn: EditorSpawn) {
  const habitat = habitats.value.find(habitat => habitat.id === spawn.habitat)
  return habitat?.blocks.length === 0 ? 'Only spawns near these blocks, since this habitat needs none' : 'Also spawns near these blocks'
}

function addSpawn() {
  const id = detail.value!.species.id
  spawns.value.push({ id: `${id}-${spawns.value.length + 1}`, habitat: 'overworld', type: 'ground', bucket: 'common', weight: 1, level: '1-50', timeRange: 'any', dark: false, signatureBlocks: [] })
}

const saving = ref(false)
async function save() {
  saving.value = true
  try {
    await $fetch(`/api/pokemon/${selectedId.value}`, { method: 'PUT', body: spawns.value })
    toast.add({ title: 'Saved', color: 'success' })
    await Promise.all([refreshDetail(), refreshList()])
  } catch (error) {
    toast.add({ title: 'Not saved', description: errorMessage(error), color: 'error' })
  } finally {
    saving.value = false
  }
}

const sources = computed(() => {
  if (!detail.value) return []
  return [
    { label: 'Cobblemon 1.8.4', data: detail.value.base.cobblemon },
    { label: 'ATM x MSD', data: detail.value.base.atm },
    { label: 'Mega Showdown', data: detail.value.base.megaShowdown },
    { label: 'Sheet', data: detail.value.sheet },
    { label: 'Pack (current file)', data: detail.value.pack }
  ].filter(source => source.data?.length)
})
</script>

<template>
  <div class="flex flex-wrap">
    <aside class="flex max-h-[calc(100vh-var(--ui-header-height))] w-72 flex-col gap-3 border-r border-default p-4">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Search by name or number"
      />
      <USelect
        v-model="statusFilter"
        :items="[{ label: 'All', value: 'all' }, ...Object.entries(statusLabels).map(([value, label]) => ({ label, value }))]"
      />
      <nav class="-mx-2 flex-1 overflow-y-auto">
        <NuxtLink
          v-for="pokemon in filtered"
          :key="pokemon.id"
          :to="`/pokemon/${pokemon.id}`"
          class="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-elevated"
          :class="{ 'bg-elevated font-medium': pokemon.id === selectedId }"
        >
          <span>{{ String(pokemon.dex).padStart(4, '0') }} {{ pokemon.name }}</span>
          <UBadge
            :color="statusColors[pokemon.status]"
            variant="subtle"
            size="sm"
            :label="statusLabels[pokemon.status]"
          />
        </NuxtLink>
      </nav>
    </aside>

    <main
      v-if="detail"
      class="flex min-w-0 flex-[999_1_560px] flex-col gap-6 p-6"
    >
      <section class="flex flex-wrap items-start gap-6">
        <div class="flex size-52 shrink-0 items-center justify-center rounded-xl border border-dashed border-accented text-sm text-muted">
          3D preview comes next
        </div>
        <div class="flex flex-1 flex-col gap-2">
          <h1 class="text-2xl font-semibold">
            {{ String(detail.species.dex).padStart(4, '0') }} {{ detail.species.name }}
          </h1>
          <p class="text-muted">
            {{ detail.species.types.join(' / ') }} · {{ statusLabels[detail.status] }}
          </p>
          <div class="mt-2 flex gap-2">
            <UButton
              label="Save"
              :loading="saving"
              @click="save"
            />
            <UButton
              label="Add spawn"
              color="neutral"
              variant="outline"
              icon="i-lucide-plus"
              @click="addSpawn"
            />
          </div>
          <p
            v-if="detail.status === 'old'"
            class="text-sm text-muted"
          >
            The pack's file uses the old format. Add spawns here to replace it when you save.
          </p>
        </div>
      </section>

      <UCard
        v-for="(spawn, index) in spawns"
        :key="index"
      >
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <UInput
              v-model="spawn.id"
              aria-label="Spawn ID"
              class="w-60"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              aria-label="Remove spawn"
              @click="spawns.splice(index, 1)"
            />
          </div>
        </template>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <UFormField label="Habitat">
            <USelect
              v-model="spawn.habitat"
              :items="habitats.map(habitat => habitat.id)"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Spawn type">
            <USelect
              v-model="spawn.type"
              :items="typeOptions(spawn)"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Bucket">
            <USelect
              v-model="spawn.bucket"
              :items="buckets"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Weight">
            <UInputNumber
              v-model="spawn.weight"
              :min="0"
              :step="0.1"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Level">
            <UInput
              v-model="spawn.level"
              placeholder="5-32"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Time range">
            <USelect
              v-model="spawn.timeRange"
              :items="timeRanges"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Dark"
            help="Light 0–7, so it avoids torch-lit spots"
          >
            <USwitch v-model="spawn.dark" />
          </UFormField>
        </div>
        <UFormField
          label="Signature blocks"
          :help="signatureHelp(spawn)"
          class="mt-3"
        >
          <UInputTags
            v-model="spawn.signatureBlocks"
            placeholder="minecraft:short_grass"
            class="w-full"
          />
        </UFormField>
      </UCard>

      <section class="grid gap-4 md:grid-cols-3">
        <div
          v-for="source in sources"
          :key="source.label"
          class="flex flex-col gap-2 rounded-lg border border-default bg-elevated/50 p-3"
        >
          <h3 class="text-sm font-semibold">
            {{ source.label }}
          </h3>
          <pre class="overflow-x-auto text-xs whitespace-pre-wrap text-toned">{{ source.data }}</pre>
        </div>
      </section>
    </main>
    <main
      v-else
      class="flex flex-1 items-center justify-center p-6 text-muted"
    >
      Pick a Pokémon from the list.
    </main>
  </div>
</template>
