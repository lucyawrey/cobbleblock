<script setup lang="ts">
useHead({ title: 'Spawn editor', htmlAttrs: { lang: 'en' } })
</script>

<template>
  <UApp>
    <UHeader title="Spawn editor">
      <UNavigationMenu
        :items="[
          { label: 'Pokémon', to: '/' },
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
