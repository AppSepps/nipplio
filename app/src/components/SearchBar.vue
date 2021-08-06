<template>
    <q-input
        tabindex="0"
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
    computed: {
        searchText: {
            get() {
                return this.$store.state.sound.searchText
            },
            set(value) {
                return this.$store.dispatch('sound/onSearchChange', {
                    text: value,
                })
            },
        },
    },
}
</script>

<style></style>
