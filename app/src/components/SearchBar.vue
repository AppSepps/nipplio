<template>
    <q-input
        v-if="activeBoard"
        dark
        dense
        standout
        v-model="searchText"
        class="q-mx-sm row"
        placeholder="Search..."
        style="width: 300px !important"
    >
        <template v-slot:append>
            <q-icon v-if="searchText === ''" name="search" />
            <q-icon
                v-else
                name="clear"
                class="cursor-pointer"
                @click="searchText = ''"
            />
        </template>
    </q-input>
</template>

<script>
export default {
    name: 'SearchBar',
    props: ['activeBoard'],
    components: {},
    data() {
        return {
            searchText: '',
        }
    },
    watch: {
        searchText(val) {
            this.$store.dispatch('app/onSearchChange', { text: val })
        },
    },
}
</script>

<style></style>
