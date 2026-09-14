<script setup>
import { IconProvider, DEFAULT_ICON_CONFIGS } from '@icon-park/vue-next'
// IconPark 全局配置（与 @wycm9527/citrine/iconpark.config 的 iconParkDefaults 一致）：在根组件 setup 里 provide 一次
IconProvider({ ...DEFAULT_ICON_CONFIGS, size: '1em', strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round', theme: 'outline', prefix: 'i' })
</script>

<template>
  <router-view />
</template>
