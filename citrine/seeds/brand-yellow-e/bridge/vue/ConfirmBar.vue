<script setup>
// 浮层内的原位确认条（种子配方）：抽屉 / 弹窗里要确认「丢弃修改 / 确定关闭」时，不再叠第二层 MessageBox，
// 而是把浮层底部替换成一条确认区域——一句话 + 「留下」（次要，自动聚焦）+ 确认（主按钮；不可逆动作用 danger）。
// Esc 在条内 = 留下。配合 useInlineConfirm()：ask() 返回 Promise<boolean>，用法与 confirmLeave 一样。
import { onMounted, ref } from 'vue'
const props = defineProps({
  message: { type: String, required: true },
  confirmText: { type: String, default: '确定离开' },
  cancelText: { type: String, default: '留下' },
  danger: { type: Boolean, default: false }
})
const emit = defineEmits(['confirm', 'cancel'])
const cancelRef = ref()
onMounted(() => { cancelRef.value?.$el?.focus?.() })
</script>

<template>
  <div class="confirm-bar" role="alertdialog" aria-live="assertive" :aria-label="message" @keydown.esc.stop.prevent="emit('cancel')">
    <span class="msg">{{ message }}</span>
    <el-button ref="cancelRef" @click="emit('cancel')">{{ cancelText }}</el-button>
    <el-button :type="danger ? 'danger' : 'primary'" @click="emit('confirm')">{{ confirmText }}</el-button>
  </div>
</template>
