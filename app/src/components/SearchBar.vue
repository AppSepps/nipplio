<template>
    <q-input
        tabindex="0"
        dark
        dense
        standout
        v-model="searchText"
        ref="input"
        class="q-mx-sm row"
        placeholder="Search..."
        style="width: 500px !important"
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
    methods: {
        focus: function () {
            this.$refs.input.focus()
        },
    },
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
