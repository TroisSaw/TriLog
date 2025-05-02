<template>
    <div @click="click"
        class="absolute w-full h-full z-0 overflow-hidden"
        :class="{ripple_brightness: isRipping}"
    >
        <slot></slot>
        <div class=" absolute w-full h-full z-10 bg-white opacity-0"
            :class="{ripple_opacity: isRipping}"></div>
        <div class=" absolute w-full h-full z-10 bg-white opacity-0 transition-opacity duration-200"
            :class="{hover: isHover && !disable}"></div>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';

let timer = 0
const isRipping = ref(false)
const isHover = ref(false)

function click() {
    clearTimeout(timer)
    isRipping.value = false
    requestAnimationFrame(()=>{
        isRipping.value = true
        timer = setTimeout(() => {
            isRipping.value = false
        }, 1000)
    })
}

function enter() {
    isHover.value = true
}

function leave() {
    isHover.value = false
}

const props = defineProps<{
    parent: HTMLElement
    disable?: boolean
}>()

onMounted(() => {
    // console.log(props.parent)
    props.parent.onclick = click
    props.parent.onmouseenter = enter
    props.parent.onmouseleave = leave
}) 
</script>
<style scoped>
.hover {
    opacity: .10;
}
.ripple_opacity {
  animation: ripple_opacity .4s linear
}
.ripple_brightness {
  animation: ripple_brightness .4s linear
}
@keyframes ripple_opacity {
    0%, 100% {
        opacity: 0;
    }
    20% {
        opacity: 0.3;
    }
}
@keyframes ripple_brightness {
    0%, 100% {
        filter: brightness(1);
    }
    20% {
        filter: brightness(1.01);
    }
}
/* @keyframes ripple {
    0%,100% { filter: brightness(1) }
    30% { filter: brightness(2) }
} */
</style>