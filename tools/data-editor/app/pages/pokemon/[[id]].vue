<script setup lang="ts">
import { copy, fill } from '#shared/copy'
import { isAllowed, spawnTypes } from '#shared/rules'
import { buckets, moonPhases, newSpawn, weathers, type EditorSpawn, type HabitatData, type PokemonDetail, type PokemonListItem, type PokemonStatus } from '#shared/spawns'

definePageMeta({ key: 'pokemon' })

const route = useRoute()
const toast = useToast()

const { data: list, refresh: refreshList } = await useFetch<PokemonListItem[]>('/api/pokemon')
const { data: habitatData } = await useFetch<HabitatData>('/api/habitats')

const search = ref('')
const statusFilter = ref<PokemonStatus | 'all'>('all')
const statusLabels: Record<PokemonStatus, string> = copy.pokemon.status
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
  return habitat?.blocks.length === 0 ? copy.pokemon.signatureOnly : copy.pokemon.signatureAlso
}

function addSpawn() {
  const id = detail.value!.species.id
  spawns.value.push(newSpawn(`${id}-${spawns.value.length + 1}`))
}

const saving = ref(false)
async function save() {
  saving.value = true
  try {
    await $fetch(`/api/pokemon/${selectedId.value}`, { method: 'PUT', body: spawns.value })
    toast.add({ title: copy.common.saved, color: 'success' })
    await Promise.all([refreshDetail(), refreshList()])
  } catch (error) {
    toast.add({ title: copy.common.notSaved, description: errorMessage(error), color: 'error' })
  } finally {
    saving.value = false
  }
}

const showSources = useCookie('show-sources', { default: () => false })
const sources = computed(() => {
  if (!detail.value) return []
  return [
    { label: copy.pokemon.sources.cobblemon, data: detail.value.base.cobblemon },
    { label: copy.pokemon.sources.atm, data: detail.value.base.atm },
    { label: copy.pokemon.sources.megaShowdown, data: detail.value.base.megaShowdown },
    { label: copy.pokemon.sources.sheet, data: detail.value.sheet },
    { label: copy.pokemon.sources.pack, data: detail.value.pack }
  ].filter(source => source.data?.length)
})
</script>

<template>
  <div class="flex flex-wrap">
    <aside class="flex max-h-[calc(100vh-var(--ui-header-height))] w-72 flex-col gap-3 border-r border-default p-4">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        :placeholder="copy.pokemon.search"
      />
      <USelect
        v-model="statusFilter"
        :items="[{ label: copy.pokemon.all, value: 'all' }, ...Object.entries(statusLabels).map(([value, label]) => ({ label, value }))]"
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
          <span class="flex gap-1">
            <UBadge
              v-for="kind in pokemon.kinds"
              :key="kind"
              color="secondary"
              variant="subtle"
              size="sm"
              :label="copy.pokemon.kinds[kind]"
            />
            <UBadge
              :color="statusColors[pokemon.status]"
              variant="subtle"
              size="sm"
              :label="statusLabels[pokemon.status]"
            />
          </span>
        </NuxtLink>
      </nav>
    </aside>

    <main
      v-if="detail"
      class="flex min-w-0 flex-[999_1_560px] flex-col gap-6 p-6"
    >
      <section class="flex flex-wrap items-start gap-6">
        <ClientOnly>
          <PokemonPreview :id="detail.species.id" />
        </ClientOnly>
        <div class="flex flex-1 flex-col gap-2">
          <h1 class="text-2xl font-semibold">
            {{ String(detail.species.dex).padStart(4, '0') }} {{ detail.species.name }}
          </h1>
          <p class="text-muted">
            {{ [detail.species.types.join(' / '), ...detail.species.kinds.map(kind => copy.pokemon.kinds[kind]), statusLabels[detail.status]].join(' · ') }}
          </p>
          <div class="mt-2 flex gap-2">
            <UButton
              :label="copy.common.save"
              :loading="saving"
              @click="save"
            />
            <UButton
              :label="copy.pokemon.addSpawn"
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
            {{ copy.pokemon.oldFormat }}
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
              :aria-label="copy.pokemon.spawnId"
              class="w-60"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              :aria-label="copy.pokemon.removeSpawn"
              @click="spawns.splice(index, 1)"
            />
          </div>
        </template>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <UFormField :label="copy.pokemon.habitat">
            <USelect
              v-model="spawn.habitat"
              :items="habitats.map(habitat => habitat.id)"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="copy.pokemon.spawnType">
            <USelect
              v-model="spawn.type"
              :items="typeOptions(spawn)"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="copy.pokemon.bucket">
            <USelect
              v-model="spawn.bucket"
              :items="buckets"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="copy.pokemon.weight">
            <UInputNumber
              v-model="spawn.weight"
              :min="0"
              :step="0.1"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="copy.pokemon.level">
            <UInput
              v-model="spawn.level"
              :placeholder="copy.pokemon.levelPlaceholder"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="copy.pokemon.weather">
            <USelect
              v-model="spawn.weather"
              :items="[...weathers]"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="copy.pokemon.dark"
            :help="copy.pokemon.darkHelp"
          >
            <USwitch v-model="spawn.dark" />
          </UFormField>
          <UFormField :label="copy.pokemon.timeRange">
            <TimeRangeField v-model="spawn.timeRange" />
          </UFormField>
          <UFormField :label="copy.pokemon.moonPhase">
            <USelectMenu
              v-model="spawn.moonPhases"
              :items="moonPhases.map((label, value) => ({ label, value }))"
              value-key="value"
              multiple
              :placeholder="copy.common.any"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="copy.pokemon.properties"
            :help="copy.pokemon.propertiesHelp"
          >
            <UInput
              v-model="spawn.properties"
              :placeholder="copy.pokemon.propertiesPlaceholder"
              class="w-full"
            />
          </UFormField>
          <UFormField
            v-if="spawn.type === 'fishing'"
            :label="copy.pokemon.lureBoosts"
            :help="copy.pokemon.lureBoostsHelp"
            class="md:col-span-2"
          >
            <div class="flex gap-2">
              <UInputNumber
                v-for="(_, level) in spawn.lureBoosts"
                :key="level"
                v-model="spawn.lureBoosts[level]"
                :min="0"
                :step="0.5"
                :aria-label="fill(copy.pokemon.lureLevel, { level: level + 1 })"
              />
            </div>
          </UFormField>
        </div>
        <UFormField
          :label="copy.pokemon.signatureBlocks"
          :help="signatureHelp(spawn)"
          class="mt-3"
        >
          <BlockList v-model="spawn.signatureBlocks" />
        </UFormField>
      </UCard>

      <UCollapsible v-model:open="showSources">
        <UButton
          :label="copy.pokemon.sourcesToggle"
          color="neutral"
          variant="ghost"
          :trailing-icon="showSources ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
        />
        <template #content>
          <section class="mt-2 grid gap-4 md:grid-cols-3">
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
        </template>
      </UCollapsible>
    </main>
    <main
      v-else
      class="flex flex-1 items-center justify-center p-6 text-muted"
    >
      {{ copy.pokemon.empty }}
    </main>
  </div>
</template>
