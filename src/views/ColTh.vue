<template>
    <t-cell
        v-if="head.end"
        th scope="col" rowspan="2" colspan="1"
        v-model:text="head.text"
        v-model:width="head.width"
        h-fixed
        :id="`${head.r}:${head.c}:${head.p}`"
        v-cell-field
        class="sub"
    />
    <t-cell
        v-else
        th scope="col" rowspan="1" :colspan="head.list.length"
        v-model:text="head.text"
        :width="0"
        @update:width="updateWidth"
        h-fixed
        :id="`${head.r}:${head.c}:${head.p}`"
        v-cell-field
    />
</template>
<script setup lang="ts">
import tCell from '@/components/t-cell.vue';
import type { ColHeadList } from '@/models/table';
import useCellField from '@/store/useCellField';
import type { PropType } from 'vue';

const props = defineProps({
    head: {
        type: Object as PropType<ColHeadList[number]>,
        required: true
    }
})

const { vCellField } = useCellField()

function updateWidth(w: number) {
    if (!props.head.end) {
        const allWidth = props.head.list.reduce((p, v) => p + v.width, 0)
        const lastSub = props.head.list[props.head.list.length - 1]
        lastSub.width = Math.max(100, w - allWidth + lastSub.width) 
    }
}

</script>
<style lang="">
    
</style>