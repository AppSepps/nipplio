<template>
    <!-- eslint-disable -->
    <q-dialog>
        <q-card style="width: 700px; max-width: 80vw">
            <q-card-section class="row items-center">
                <div class="text-h6">Slot Settings</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>
            <q-card-section>
                <div class="row q-mb-lg">
                    <q-select
                        class="col-md-6 col-sm-8 col-12"
                        filled
                        v-model="selectedBoard"
                        :options="sortedBoards"
                        option-value="id"
                        option-label="name"
                        label="Board"
                    />
                </div>
                <div v-for="(slot, index) in device.slots" :key="index">
                    <div class="row q-py-md">
                        <div class="col-4 text-bold self-center">
                            {{ slot }}
                        </div>
                        <q-select
                            class="col-8"
                            filled
                            dense
                            v-model="selectedSounds[index]"
                            :options="sounds"
                            option-value="id"
                            :option-label="
                                (sound) =>
                                    sounds.filter((s) => {
                                        return s.id === sound.id
                                    })[0]
                                        ? sounds.filter((s) => {
                                              return s.id === sound.id
                                          })[0].name
                                        : null
                            "
                            label="Sound"
                        >
                            <template v-slot:append>
                                <q-icon
                                    v-if="selectedSounds[index]"
                                    name="close"
                                    @click.stop="removeMappedSound(index)"
                                    class="cursor-pointer"
                                />
                            </template>
                        </q-select>
                    </div>
                    <q-separator dark />
                </div>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn
                    no-caps
                    label="Save"
                    color="primary"
                    @click="onSave"
                    v-close-popup
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
    name: 'SlotMappingDialog',
    data() {
        return {
            device: undefined,
            selectedBoard: null,
            selectedSounds: {},
        }
    },
    computed: {
        ...mapGetters('board', ['sortedBoards']),
        ...mapState({
            sounds: (state) => state.settings.availableSlotSounds,
        }),
    },
    watch: {
        selectedBoard(val, old) {
            if (!old || val.id !== old.id) {
                this.$store.dispatch('settings/getAvailableSlotSounds', {
                    boardId: val.id,
                })
                if (this.device[val.id] && this.device[val.id].slots) {
                    const slotMapping = {}
                    this.device[val.id].slots.forEach((slot, index) => {
                        slotMapping[index] = { id: slot }
                    })
                    this.selectedSounds = slotMapping
                } else {
                    this.selectedSounds = {}
                }
            }
        },
    },
    mounted() {
        this.bus.on('onChangeSlotMapping', (device) => {
            this.device = device
            this.selectedBoard = this.$store.state.board.activeBoard
                ? {
                      name: this.$store.state.board.activeBoard.name,
                      id: this.$store.state.board.activeBoard.id,
                  }
                : null
        })
    },
    methods: {
        removeMappedSound: function (index) {
            delete this.selectedSounds[index]
        },
        onSave: function () {
            this.$store.dispatch('settings/saveSlotMapping', {
                device: this.device,
                boardId: this.selectedBoard.id,
                selectedSounds: this.selectedSounds,
            })
        },
    },
}
</script>

<style></style>
