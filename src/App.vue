<script setup lang="ts">
import TopBar from './views/TopBar.vue'
import TableBody from './views/TableBody.vue';
import useCellMenu from './store/useCellMenu';

const { vCellMenuWrapper } = useCellMenu()
</script>

<template>
    <div
        @contextmenu.prevent
        class="w-screen h-screen bg-gray-100 flex flex-col overflow-hidden"
        v-cell-menu-wrapper
    >
        <TopBar/>
        <TableBody></TableBody>
    </div>
</template>

<style scoped></style>
