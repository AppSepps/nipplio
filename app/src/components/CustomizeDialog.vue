<template>
    <q-dialog>
        <q-card style="width: 450px; max-width: 80vw">
            <q-card-section class="row items-center">
                <div class="text-h6">Select theme</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>
            <q-card-section class="q-p-none">
                <q-list>
                    <theme
                        v-for="theme in themes"
                        :key="theme.name"
                        :theme="theme"
                        :active="theme.id === currentThemeId"
                    />
                </q-list>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
import { mapState } from 'vuex'
import Theme from './Theme.vue'

export default {
    name: 'CustomizeDialog',
    computed: {
        ...mapState({
            currentThemeId: (state) => state.theme.currentThemeId,
            themes: (state) => state.theme.themes,
        }),
    },
    components: { Theme },
    methods: {},
}
</script>

<style></style>
