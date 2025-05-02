<template>
    <div ref="wrapper" class="h-9 relative overflow-hidden rounded-md shrink-0 min-w-4 cursor-pointer">
        <div class="absolute z-0 w-full h-full brightness-85"
            :style="active_bg">
        </div>
    
        <t-ripple v-if="wrapper" :parent="wrapper" class="bottom-1 rounded-b-md" :disable="disable">    
            <div class="absolute z-10 w-full h-full rounded-b-md"
                :style="active_bg">
            </div>
        </t-ripple>

        <div class="relative z-20 text-white gap-2 flex justify-center items-center select-none [&_*]:shrink-0 h-8"
            
            :class="pre&&!(text||suf)?['px-2']:['px-8']"
        >
            <img v-if="pre" :src="reqSrc(`icons/${pre}`)" class="w-5" alt="">
            <div v-if="text" :class="css">{{ text }}</div>
            <img v-if="suf" :src="reqSrc(`icons/${suf}`)" class="w-5" alt="">
        </div>

        <div v-show="disable" @click.stop="" @mouseenter.stop=""
            class="absolute inset-0 z-20 bg-white opacity-60 cursor-not-allowed"></div>
    </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import reqSrc from '../util/reqSrc';
import tRipple from './t-ripple.vue';
const props = withDefaults(defineProps<{
    text?: string
    color?: string
    pre?: string
    suf?: string
    disable?: boolean
    css?: string
}>(), {
    color: 'forestgreen',
})
const active_bg = computed(() => ({
    background: props.color
}))

const wrapper = ref()
</script>
<style>
</style>