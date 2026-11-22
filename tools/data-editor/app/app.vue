<script setup lang="ts">
import { copy } from '#shared/copy'

useHead({ title: copy.app.title, htmlAttrs: { lang: 'en' } })
</script>

<template>
  <UApp>
    <UHeader :title="copy.app.title">
      <UNavigationMenu
        :items="[
          { label: copy.app.nav.pokemon, to: '/pokemon' },
          { label: copy.app.nav.habitats, to: '/habitats' }
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
