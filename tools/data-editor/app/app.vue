<script setup lang="ts">
useHead({ title: 'Cobbleblock Data Editor', htmlAttrs: { lang: 'en' } })
</script>

<template>
  <UApp>
    <UHeader title="Cobbleblock Data Editor">
      <UNavigationMenu
        :items="[
          { label: 'Pokémon', to: '/pokemon' },
          { label: 'Habitats', to: '/habitats' }
        ]"
      />
      <template #right>
        <UColorModeButton />
      </template>
    </UHeader>
    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
