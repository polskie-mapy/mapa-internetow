<template>
  <div>
    <l-control
      position="topleft"
      class="lg:w-80 w-64 sm:w-full"
    >
      <div class="flex gap-1">
        <button
          class="h-11 w-11 p-0 bg-app hover:outline outline-2 outline-offset-1 outline-app text-white rounded shadow flex flex-cols justify-center items-center dark:text-gray-800 active:scale-[0.98] touch-manipulation"
          @click="menuVisible = !menuVisible"
        >
          <fa-icon
            :icon="toggleIcon"
            size="xl"
            fixed-width
          />
        </button>
        <div
          v-if="menuVisible"
          class="border-app border-2 rounded shadow outline-none ring-app hover:outline hover:outline-app outline-offset-1 outline-2 text-lg w-full flex"
          :class="{'border-gray-600 hover:outline-gray-600': !searchIndexInitialized, 'hover:outline-app ring-app focus:ring': searchIndexInitialized}"
        >
          <input
            :disabled="!searchIndexInitialized"
            type="text"
            class="px-2 py-1 w-full outline-none border-none disabled:bg-white disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:placeholder-gray-300"
            placeholder="Szukaj pinezki (min. 2 znaki)"
            :value="searchQuery"
            @input="setSearchQuery"
          >
          <div
            v-if="performingSearch || !searchIndexInitialized"
            class="inline px-2 bg-white flex text-app dark:bg-gray-700"
          >
            <fa-icon
              class="self-center"
              icon="fa-solid fa-sync"
              spin
            />
          </div>
        </div>
      </div>
    </l-control>
    <l-control
      position="topleft"
      class="lg:w-80 w-64 sm:w-full"
    >
      <div
        v-if="menuVisible && hasSearchResults && hasSearchQuery"
        class="flex flex-col bg-white border-app border-2 rounded shadow divide-y mb-3 dark:bg-gray-700"
      >
          <template 
            v-for="item in searchResults"
          >
              <router-link
                  v-if="item.type === 'point'"
                  :key="item.id"
                  :to="{ name: 'PointDetails', params: { pointId: item.id, mapId: item.mapId }, query: { source: 'search' } }"
                  class="py-2 px-4 flex gap-1 hover:bg-app hover:text-white border-transparent border last:mb-px dark:text-white dark:hover:text-black"
                  :title="item.title"
                  @click.native="trackSearchResultClick(item)"
              >
                  <fa-icon
                      :icon="item.icon | iconCodeToIconName"
                      fixed-width
                      class="self-center"
                  />
                  <span class="text-ellipsis break-all w-full whitespace-nowrap overflow-x-hidden">{{ item.title }}</span>
              </router-link>
              <div
                  v-else
                  :key="item.id"
                  :title="item.title"
                  class="py-2 px-4 flex gap-1 hover:bg-app hover:text-white border-transparent border last:mb-px dark:text-white dark:hover:text-black cursor-pointer"
                  @click="moveToLocation(item)"
              >
                  <fa-icon
                      :icon="['fas', 'fa-map-marker-alt']"
                      fixed-width
                      class="self-center"
                  />
                  <span class="text-ellipsis break-all w-full whitespace-nowrap overflow-x-hidden">{{ item.title }}</span>
              </div>
          </template>
      </div>
      <div
        v-else-if="hasSearchQuery && !hasSearchResults && !performingSearch"
        class="flex flex-col bg-white border-app border-2 rounded shadow divide-y py-2 px-4 mb-3 dark:bg-gray-700 dark:text-white"
      >
        <p>nie znaleziono wyników :&lt;</p>
      </div>

      <div
        v-if="menuVisible"
        class="py-2 px-4 bg-white border-app border-2 rounded shadow mb-4 dark:bg-gray-700"
      >
        <div class="text-lg leading-loose divide-y dark:text-white">
          Filtry
        </div>
        <ul class="my-2 ml-4 flex flex-col gap-y-2">
          <li class="flex items-center">
            <input
              id="ml-filter-recent"
              :checked="showRecentlyAddedOnly"
              type="checkbox"
              class="appearance-none h-6 w-6 border border-gray-300 rounded bg-white checked:bg-app checked:border-app hover:outline hover:outline-2 hover:outline-offset-1 hover:outline-app focus:outline-none align-top mr-2 cursor-pointer"
              @change="toggleRecentlyAddedFilter"
            >
            <label for="ml-filter-recent" class="inline-block select-none cursor-pointer dark:text-white flex-1">
              Ostatnio dodane
            </label>
          </li>
          <li class="flex items-center">
            <input
              id="ml-filter-hardest"
              :checked="showHardestOnly"
              type="checkbox"
              class="appearance-none h-6 w-6 border border-gray-300 rounded bg-white checked:bg-app checked:border-app hover:outline hover:outline-2 hover:outline-offset-1 hover:outline-app focus:outline-none align-top mr-2 cursor-pointer"
              @change="toggleHardestFilter"
            >
            <label for="ml-filter-hardest" class="inline-block select-none cursor-pointer dark:text-white flex-1">
              Najtrudniejsze (4-5★)
            </label>
          </li>
          <li class="flex items-center">
            <input
              id="ml-filter-unseen"
              :checked="showUnseenOnly"
              type="checkbox"
              class="appearance-none h-6 w-6 border border-gray-300 rounded bg-white checked:bg-app checked:border-app hover:outline hover:outline-2 hover:outline-offset-1 hover:outline-app focus:outline-none align-top mr-2 cursor-pointer"
              @change="toggleUnseenFilter"
            >
            <label for="ml-filter-unseen" class="inline-block select-none cursor-pointer dark:text-white flex-1">
              Nieobejrzane punkty
            </label>
          </li>
        </ul>
      </div>

      <div
        v-if="menuVisible"
        class="py-2 px-4 bg-white border-app border-2 rounded shadow mb-4 dark:bg-gray-700"
      >
        <div class="text-lg leading-loose divide-y dark:text-white">
          Wyświetlane mapy
        </div>
        <ul class="my-2 ml-4 flex flex-col gap-y-2">
          <li
            v-for="map in maps"
            :key="map.id"
          >
            <MapConfig :map="map" />
          </li>
        </ul>
      </div>
    </l-control>
  </div>
</template>

<script>
import {debounce} from "lodash";
import {mapGetters, mapState} from "vuex";
import {LControl} from "vue2-leaflet";
import MapConfig from "@/components/MapConfig.vue";
import { trackEvent } from "@/analytics";

export default {
    name: "MapLookup",
    components: {
        MapConfig,
        LControl
    },
    data: () => ({
        menuVisible: true,
        searchDebouncer: Function,
        lastTrackedQuery: '',
    }),
    computed: {
        toggleIcon() {
            return this.menuVisible
                ? 'fa-solid fa-chevron-left'
                : 'fa-solid fa-chevron-right';
        },
        ...mapState({
            currentMaps: 'currentMaps',
            showRecentlyAddedOnly: 'showRecentlyAddedOnly',
            showHardestOnly: 'showHardestOnly',
            showUnseenOnly: 'showUnseenOnly',
        }),
        ...mapGetters({
            maps: 'maps',
            pinGroups: 'pinGroups',
            currentMap: 'currentMap',
        }),
        ...mapGetters('search', {
            hasSearchResults: 'hasSearchResults',
            hasSearchQuery: 'hasQuery'
        }),
        ...mapState('search', {
            searchQuery: (state) => state.query,
            searchIndexInitialized: (state) => state.indexInitialized,
            searchResults: (state) => state.searchResults,
            performingSearch: (state) => state.performingSearch,

        }),
    },
    mounted() {
        this.$store.dispatch('search/initSearchIndex');

        this.searchDebouncer = debounce(() => {
            if (this.searchQuery.length > 1) {
                this.$store.dispatch('search/doSearch');
            }
        }, 500);
    },
    methods: {
        toggleRecentlyAddedFilter(ev) {
            this.$store.commit('setShowRecentlyAddedOnly', ev.target.checked);
            trackEvent('filter_toggle', {
                filter: 'recent',
                enabled: !!ev.target.checked,
                map_id: this.currentMap?.id,
            });
        },
        toggleHardestFilter(ev) {
            this.$store.commit('setShowHardestOnly', ev.target.checked);
            trackEvent('filter_toggle', {
                filter: 'hardest',
                enabled: !!ev.target.checked,
                map_id: this.currentMap?.id,
            });
        },
        toggleUnseenFilter(ev) {
            this.$store.commit('setShowUnseenOnly', ev.target.checked);
            trackEvent('filter_toggle', {
                filter: 'unseen',
                enabled: !!ev.target.checked,
                map_id: this.currentMap?.id,
            });
        },
        setSearchQuery(ev) {
            this.$store.commit('search/setQuery', ev.target.value);

            if (!this.hasSearchQuery) {
                this.$store.commit('search/unsetSearchResults');
            } else {
                this.searchDebouncer();
            }
        },
        moveToLocation(item) {
            this.$store.commit('setFocusedLocation', [item.coords[0], item.coords[1]]);
            trackEvent('search_result_click', {
                result_type: item.type,
                source: 'search_list',
            });
        },
        trackSearchResultClick(item) {
            trackEvent('search_result_click', {
                result_type: item.type,
                source: 'search_list',
            });
        }
    },
    watch: {
        performingSearch(newValue, oldValue) {
            if (oldValue === true && newValue === false && this.searchQuery.length > 1 && this.searchQuery !== this.lastTrackedQuery) {
                trackEvent('search_use', {
                    query_len: this.searchQuery.length,
                    results_count: this.searchResults.length,
                });
                this.lastTrackedQuery = this.searchQuery;
            }
        },
    }
}
</script>

<style scoped>

</style>
