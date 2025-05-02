<template>
    <div ref="wrapper" class="h-9 relative overflow-hidden rounded-md shrink-0 min-w-4 cursor-pointer pointer-events-auto
        group/text-btn"
        :class="[bgCss]">
    
        <t-ripple v-if="wrapper" :parent="wrapper" class="rounded-b-md">    
            <div class="bg-gray-100 absolute z-10 w-full h-full rounded-b-md group-hover/text-btn:!bg-gray-200 transition-colors duration-300"
                :class="[bgCss]"></div>
        </t-ripple>

        <div class="relative z-20 gap-2 flex justify-center items-center select-none px-6 h-full text-nowrap"
            :class="[css]">
            {{ text }}
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import tRipple from './t-ripple.vue';
const props = defineProps<{
    text: string
    css?: string
    bgCss?: string
}>()

const wrapper = ref(null)
</script>
<style>
</style>