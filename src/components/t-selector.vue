<template>
    <div
        @click.stop
        ref="selector"
        class="absolute z-50 overflow-hidden shrink-0 border-1 border-gray-500
            pointer-events-none transition-all duration-200"
        :class="[isShow ? 'opacity-100' : 'opacity-0']"
    >
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';

const emit = defineEmits<{
    mounted: [HTMLElement, typeof exposeFn]
}>()

const selector = ref()

const isShow = ref(false)

function show() {
    isShow.value = true
}

function close() {
    isShow.value = false
}

const exposeFn = {
    show,
    close,
}

onMounted(() => {
    emit('mounted', selector.value, exposeFn)
})

</script>