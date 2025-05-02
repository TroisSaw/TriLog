<template>
    <div ref="wrapper" class="h-9 relative overflow-hidden rounded-md shrink-0 min-w-4 cursor-pointer group/icon-btn"
        :class="[bgCss]">
    
        <t-ripple v-if="wrapper" :parent="wrapper" class="rounded-b-md">    
            <div class="absolute z-10 w-full h-full rounded-b-md group-hover/icon-btn:bg-gray-200 transition-colors duration-300"
                :class="[bgCss]"></div>
        </t-ripple>

        <div class="relative z-20 text-white gap-2 flex justify-center items-center select-none h-full">
            <img :src="icon" class="w-5 mx-2" :class="[css]" alt="" draggable="false">
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import tRipple from './t-ripple.vue';
const props = defineProps<{
    icon: string
    bgCss?: string
    css?: string
}>()

const wrapper = ref(null)
</script>
<style>
</style>