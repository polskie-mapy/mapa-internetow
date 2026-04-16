<template>
  <div>
    <div class="flex justify-between">
      <div class="flex items-center">
        <input
          :id="`ml-map-${map.id}`"
          :checked="isInCurrentMaps"
          :disabled="fetchingData"
          type="checkbox"
          class="appearance-none h-6 w-6 border border-gray-300 rounded bg-white checked:bg-app checked:border-app hover:outline hover:outline-2 hover:outline-offset-1 hover:outline-app focus:outline-none align-top mr-2 cursor-pointer"
          @change="toggleCurrentMaps"
        >
        <label
          class="inline-block select-none cursor-pointer dark:text-white flex-1"
          :for="`ml-map-${map.id}`"
        >
          {{ map.name }}
        </label>
      </div>
      <div
        v-if="fetchingData"
        class="text-app"
      >
        <fa-icon
          icon="fa-solid fa-sync"
          spin
        />
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";

export default {
    name: "MapConfig",
    props: {
        map: {
            type: Object,
            required: true
        }
    },
    data: () => ({
        fetchingData: false,
    }),
    computed: {
        togglerIcon() {
            return this.expanded
                ? 'fa-solid fa-chevron-up'
                : 'fa-solid fa-chevron-down';
        },
        ...mapState({
            currentMaps: 'currentMaps'
        }),
        ...mapGetters({
            maps: 'maps',
            points: 'points',
            currentMapsIds: 'currentMapsIds',
        }),
        isInCurrentMaps() {
            return this.currentMaps.has(this.map.id);
        },
    },
    methods: {
        async toggleCurrentMaps(ev) {
            this.$store.commit('toggleCurrentMaps', {
                map: this.map,
                enabled: ev.target.checked
            });

            this.fetchingData = true;
            await this.$store.dispatch('fetchPoints', this.map.id);
            this.fetchingData = false;
        }
    },
}
</script>

<style scoped>

</style>
