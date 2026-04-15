<template>
  <div class="grid grid-rows-2 grid-cols-1 shadow">
    <button
      class="h-11 w-11 p-0 rounded-b-none hover:outline outline-2 outline-offset-1 text-white rounded flex flex-cols justify-center items-center dark:text-gray-800 active:scale-[0.98] touch-manipulation"
      :class="zoomInClass"
      @click="zoomIn"
    >
      <fa-icon
        icon="fa-solid fa-plus"
        size="xl"
        fixed-width
      />
    </button>
    <button
      class="h-11 w-11 p-0 rounded-t-none outline-2 outline-offset-1 text-white rounded flex flex-cols justify-center items-center dark:text-gray-800 active:scale-[0.98] touch-manipulation"
      :class="zoomOutClass"
      @click="zoomOut"
    >
      <fa-icon
        icon="fa-solid fa-minus"
        size="xl"
        fixed-width
      />
    </button>
  </div>
</template>

<script>
import {Map as L_Map} from "leaflet";
import { trackEvent } from "@/analytics";

export default {
    name: "MapControls",
    props: {
        mapObject: {
            type: L_Map,
            required: true,
        }
    },
    computed: {
        zoomInClass() {
            return this.mapObject.getMaxZoom() > this.mapObject.getZoom()
                ? 'bg-app outline-app hover:outline'
                : 'bg-gray-400 outline-transparent cursor-default touch-none'
        },
        zoomOutClass() {
            return this.mapObject.getMinZoom() < this.mapObject.getZoom()
                ? 'bg-app outline-app hover:outline'
                : 'bg-gray-400 outline-transparent cursor-default touch-none'
        }
    },
    methods: {
        zoomIn() {
            this.mapObject.zoomIn();
            trackEvent('map_zoom', { direction: 'in' });
        },
        zoomOut() {
            this.mapObject.zoomOut();
            trackEvent('map_zoom', { direction: 'out' });
        }
    }
}
</script>

<style scoped>

</style>
