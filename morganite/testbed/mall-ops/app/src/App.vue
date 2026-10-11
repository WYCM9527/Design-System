<script setup>
import { IconProvider, DEFAULT_ICON_CONFIGS } from '@icon-park/vue-next'
import { iconParkDefaults } from '@wycm9527/morganite/iconpark.config'
// IconPark 全局配置从种子的桥接取（描边、线帽、尺寸跟随字号），在根组件 setup 里 provide 一次
IconProvider({ ...DEFAULT_ICON_CONFIGS, ...iconParkDefaults })
</script>

<template>
  <router-view />
</template>
