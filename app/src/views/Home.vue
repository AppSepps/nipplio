<template>
    <q-page padding>
        <div class="row">
            <div class="col-8">
                <div v-if="activeBoard">
                    <q-btn-dropdown
                        split
                        color="grey-9"
                        :label="activeBoard.name"
                    >
                        <q-list>
                            <q-item
                                v-for="board in boards"
                                :key="board.id"
                                clickable
                                v-close-popup
                            >
                                <q-item-section>
                                    <q-item-label>{{
                                        board.name
                                    }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                </div>
            </div>
            <div class="col-4 text-right q-gutter-sm q-ml-none">
                <q-btn unelevated icon="settings" color="grey-9" />
                <q-btn
                    no-caps
                    unelevated
                    color="grey-9"
                    label="Sign out"
                    v-on:click="signOut"
                />
            </div>
        </div>
        <div class="row q-pt-md">
            <div class="col-8" v-if="user">
                <h1 class="text-h5 q-mt-none">
                    Hello <strong>{{ user.username }}</strong>
                </h1>
            </div>
            <div class="col-4" v-if="boardUsers && boardUsers.length > 0">
                <q-list bordered separator dark>
                    <q-item
                        clickable
                        v-ripple
                        v-for="user in boardUsers"
                        :key="user.id"
                    >
                        <q-item-section avatar>
                            <q-avatar color="secondary" text-color="white">
                                {{ user.username[0].toUpperCase() }}
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{ user.username }}</q-item-label>
                            <q-item-label caption>Not connected</q-item-label>
                        </q-item-section>
                        <q-item-section avatar>
                            <q-icon color="negative" name="mic_off" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>
        </div>
    </q-page>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'Home',
    components: {},
    computed: mapState({
        user: (state) => state.app.user,
        activeBoard: (state) => state.app.activeBoard,
        boardUsers: (state) => state.app.boardUsers,
        boards: (state) => state.app.boards,
    }),
    mounted() {
        this.$store.dispatch('app/getUserAndBoardData')
        setTimeout(() => {
            console.log(this)
        }, 3000)
    },
    methods: {
        signOut: function () {
            this.$store.dispatch('app/signOut')
            this.$router.push('/login')
        },
    },
}
</script>

<style>
.home-container {
    padding: 20px;
}
</style>
