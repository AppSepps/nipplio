<template>
    <q-item ripple clickable @click="onClick(theme.id)">
        <q-item-section avatar>
            <div>
                <q-avatar
                    size="sm"
                    :style="'z-index: 1; background-color: ' + theme.primary"
                />
                <q-avatar
                    size="sm"
                    :style="
                        'z-index: 0; margin-left: -10px; background-color: ' +
                        theme.secondary
                    "
                />
            </div>
        </q-item-section>
        <q-item-section
            ><span :class="active ? 'text-bold' : ''">{{
                theme.name
            }}</span></q-item-section
        >
        <q-item-section v-if="active" side>
            <q-icon name="check" />
        </q-item-section>
    </q-item>
</template>

<script>
export default {
    name: 'Theme',
    props: ['theme', 'active'],
    methods: {
        onClick(id) {
            this.$store.dispatch('theme/setTheme', {
                id,
            })
        },
    },
}
</script>

<style></style>
