<template>
  <portal
    to="details"
  >
    <div
      class="absolute h-full w-full inset-0 flex flex-row z-modal bg-modal cursor-pointer"
      @click.self.prevent="hideDetails"
    >
      <div
        class="self-end flex w-full justify-center cursor-pointer"
        @click.self.prevent="hideDetails"
      >
        <div
          class="bg-white md:rounded-t p-3 pb-0 shadow border-t-2 border-b-0 border-app md:border-l-2 md:border-r-2 grid grid-cols-[12rem_1fr] auto-rows-min w-full md:w-auto md:min-w-prose gap-2 max-w-5xl md:gap-3 cursor-auto dark:bg-gray-700"
        >
          <div class="col-span-2 relative flex gap-x-3">
            <div class="flex-1 flex gap-x-3">
              <span class="text-2xl font-semibold dark:text-white">
                {{ point.title }}
              </span>
              <div
                v-if="point.assumedCoords"
                class="tooltipped self-center"
              >
                <div class="tooltip">
                  lokalizacja niedokładna, przybliżona bądź prawdopodobna
                </div>
                <div
                  class="p-1 bg-black text-yellow-300 text-xs rounded leading-[0]"
                >
                  <fa-icon
                    icon="fa-solid fa-triangle-exclamation"
                  />
                </div>
              </div>
            </div>
            <div
              class="flex-0 p-1 leading-none flex gap-x-1.5 text-base"
            >
              <div class="tooltipped">
                <div class="tooltip">
                  Pokaż na mapie
                </div>
                <router-link
                  class="h-8 w-8 inline-flex items-center justify-center rounded dark:text-white dark:hover:text-app hover:text-app"
                  :to="{ name:'MapPage', query: {focusPoint: point.id}, params: {mapId: map.id} }"
                >
                  <fa-icon
                    icon="fa-solid fa-crosshairs"
                  />
                </router-link>
              </div>
              <div class="tooltipped">
                <div class="tooltip">
                  Zaproponuj poprawkę
                </div>
                <a
                  class="h-8 w-8 inline-flex items-center justify-center rounded dark:text-white dark:hover:text-app hover:text-app cursor-pointer"
                  :href="proposeUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <fa-icon
                    icon="fa-solid fa-flag"
                  />
                </a>
              </div>
              <a
                class="h-8 w-8 inline-flex items-center justify-center rounded dark:text-white dark:hover:text-app hover:text-app cursor-pointer"
                @click.prevent="hideDetails"
              >
                <fa-icon
                  icon="fa-solid fa-times"
                />
              </a>
            </div>
          </div>
        <div class="col-span-2 text-sm -mt-2 text-black dark:text-white">
            {{ map.name }}
        </div>
          <div class="col-span-2 text-gray-500 dark:text-gray-300 text-xs gap-y-1 gap-x-3 md:flex hidden">
            <div>
              tagi:
              <div v-if="point.tags.length" class="inline-flex gap-x-0.5">
                <span
                  v-for="tag in point.tags"
                  :key="tag"
                  class="py-0.5 px-1 rounded-sm bg-app text-white dark:text-black"
                >
                  {{ tag.title }}
                </span>
              </div>
              <span
                v-else
                class="py-0.5 px-1 rounded-sm bg-app text-white dark:text-black"
              >
                brak
              </span>
            </div>
            <div v-if="difficultyValue > 0" class="inline-flex items-center gap-x-1">
              <span>trudność:</span>
              <span
                v-for="starIdx in 5"
                :key="`difficulty-desktop-${starIdx}`"
                :class="starIdx <= difficultyValue ? 'text-app' : 'text-gray-300 dark:text-gray-500'"
              >
                <fa-icon icon="fa-solid fa-star" />
              </span>
            </div>
          </div>
          <div
            v-if="difficultyValue > 0"
            class="col-span-2 text-xs text-gray-400 inline-flex md:hidden items-center gap-x-1 -mt-2"
          >
            <span>trudność:</span>
            <span
              v-for="starIdx in 5"
              :key="`difficulty-mobile-${starIdx}`"
              :class="starIdx <= difficultyValue ? 'text-app' : 'text-gray-300 dark:text-gray-500'"
            >
              <fa-icon icon="fa-solid fa-star" />
            </span>
          </div>
          <a
            v-if="ytLink"
            class="rounded hover:outline-2 hover:outline hover:outline-offset-1 hover:outline-app relative h-36 w-48 md:justify-self-auto justify-self-center col-span-2 md:col-span-1"
            :href="ytLink"
            @click.prevent="handleYtClick(ytRawLink)"
          >
            <VideoThumbnail
              :target-url="ytLink"
              :thumbnail-url="ytThumbnail"
              :point-id="point.id"
              object-class="h-36 w-48"
              class="h-36 w-48"
            />
          </a>
          <div
            v-else
            class="tooltipped"
          >
            <div class="tooltip">
              Brak nagrania :&lt;
            </div>
            <div
              class="rounded overflow-hidden relative bg h-36 w-48"
            >
              <div class="text-app bg-black/25 inset-0 absolute grid place-content-center">
                <fa-icon
                  icon="fa-solid fa-video-slash"
                  size="4x"
                  fixed-width
                />
              </div>
            </div>
          </div>
          <div class="grid grid-rows-1 auto-rows-min gap-y-2 relative md:col-span-1 col-span-2 mb-2 md:mb-0">
            <p class="break-all max-h-40 overflow-y-auto dark:text-gray-200">
              {{ point.excerpt }}
            </p>
            <a class="text-app hover:underline" :href="mapLink" @click="trackOutboundClick('map')">
              <fa-icon 
                icon="fa-solid fa-link"
                fixed-width
              />
              {{ 'map' | linkTypeDefaultTooltip }}
            </a>
            <p
              v-if="hasSubmitters"
              class="text-sm border-l-2 border-grey-500 pl-2 dark:text-gray-200"
            >
              pomógł -
              <a 
                v-for="submitter in submitters"
                :key="`${submitter.type}-${submitter.user}`"
                :href="submitter.url"
                class="hover:text-app font-bold dark:hover:text-app"
                target="_blank"
              >
                @{{ submitter.user }}
              </a>
            </p>
          </div>
          <div class="flex gap-2 mb-3">
            <div>
                <span class="dark:text-gray-200 text-sm">Linki:</span>
            </div>
            <div
              v-for="link in links"
              :key="link.url"
              class="tooltipped"
              :style="link.type | linkTypeColorStyle"
            >
              <div
                v-if="link.tooltip"
                class="tooltip color-inherit"
              >
                {{ link.tooltip }}
              </div>
              <a
                :href="link.type === 'yt' ? $H.ytLink(link.url) : link.url"
                class="bg-point-details-link-var px-3 py-1 text-white outline-2 hover:outline-offset-1 hover:outline outline-app rounded"
                :title="link.tooltip"
                :target="link.type === 'yt' ? null : '_blank'"
                @click.prevent="handleLinkClick(link)"
              >
                <fa-icon
                  :icon="link.type | linkTypeIcon"
                  fixed-width
                />
              </a>
            </div>
          </div>
          <div class="grid-rows-2 justify-end cursor-default hidden sm:grid">
            <div class="tooltipped">
              <div
                class="tooltip"
              >
                {{ createdAt | prettyDate }}
              </div>
              <p class="text-xs leading-[0] text-right text-gray-400 underline underline-offset-4">
                <span>dodano <span class="text-app">{{ createdAtDesc }}</span></span>
              </p>
            </div>
            <div class="tooltipped">
              <div
                v-if="recordedAt"
                class="tooltip"
              >
                {{ recordedAt | prettyDate }}
              </div>
              <p class="text-xs leading-[0] text-right text-gray-400">
                <span>nagrano <span class="text-app">{{ recordedAtDesc }}</span></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </portal>
</template>

<script>
import {DateTime} from 'luxon';
import {mapGetters} from 'vuex';
import store from "@/store";
import VideoThumbnail from "@/components/VideoThumbnail.vue";
import { trackEvent } from '@/analytics';

export default {
    name: 'PointDetails',
    components: {
        VideoThumbnail
    },
    beforeRouteEnter(to, _from, next) {
        const selectedPointId = parseInt(to.params.pointId);

        if (store.getters.point(selectedPointId)) {
            store.commit('setCurrentPoint', store.getters.point(selectedPointId));
            store.dispatch('markPointAsSeen', selectedPointId);
            const point = store.getters.point(selectedPointId);
            trackEvent('point_open', {
                point_id: point.id,
                map_id: point.mapId,
                source: to.query.source || 'url',
            });
        } else {
            trackEvent('point_not_found', {
                point_id: selectedPointId,
                map_id: Number.parseInt(to.params.mapId, 10),
                source: to.query.source || 'url',
            });
        }

        next();
    },
    beforeRouteUpdate(to, _from, next) {
        const selectedPointId = parseInt(to.params.pointId);

        if (store.getters.point(selectedPointId)) {
            store.commit('setCurrentPoint', store.getters.point(selectedPointId));
            store.dispatch('markPointAsSeen', selectedPointId);
            const point = store.getters.point(selectedPointId);
            trackEvent('point_open', {
                point_id: point.id,
                map_id: point.mapId,
                source: to.query.source || 'url',
            });
        } else {
            trackEvent('point_not_found', {
                point_id: selectedPointId,
                map_id: Number.parseInt(to.params.mapId, 10),
                source: to.query.source || 'url',
            });
        }

        next();
    },
    computed: {
        difficultyValue() {
            const parsed = Number.parseInt(this.point.difficulty, 10);

            if (Number.isNaN(parsed)) {
                return 0;
            }

            return Math.min(5, Math.max(0, parsed));
        },
        mapLink() {
            return this.$H.coords2GmapsPin(this.point.coords);
        },
        links() {
            const staticLinks = [{
                type: 'map',
                url: this.mapLink,
            }];
            
            const dynamicLinks = this.point.links.map(link => ({...link}));

            return [
                ...staticLinks,
                ...dynamicLinks
            ].map(x => ({
                tooltip: this.$H.linkTypeDefaultTooltip(x.type),
                ...x
            }));
        },
        ytThumbnail() {
            const link = this.point.links.find(x => x.type === 'yt');

            if (typeof link !== 'undefined') {
                return this.$H.ytThumbUrl(link.url);
            }

            return null;
        },
        ytLink() {
            const link = this.point.links.find(x => x.type === 'yt');

            if (typeof link !== 'undefined') {
                return this.$H.ytLink(link.url);
            }

            return null;
        },
        ytRawLink() {
            const link = this.point.links.find(x => x.type === 'yt');

            if (typeof link !== 'undefined') {
                return link.url;
            }

            return null;
        },
        hasSubmitters() {
            return this.point.submitters && this.point.submitters.length !== 0;
        },
        submitters() {
            if (!this.point.submitters || this.point.submitters.length === 0) {
                return [];
            }

            return this.point.submitters.map((submitter) => {
                return {
                    url: this.$H.linkTypeUrl(submitter.type, submitter.user),
                    ...submitter
                }
            });
        },
        createdAt() {
            return DateTime.fromISO(this.point.createdAt);
        },
        recordedAt() {
            return this.point.recordedAt ? DateTime.fromISO(this.point.recordedAt) : null;
        },
        createdAtDesc() {
            return this.$H.dateTimeDiffHumans(DateTime.fromISO(this.createdAt));
        },
        recordedAtDesc() {
            if (this.recordedAt === null) {
                return '¯\\_(ツ)_/¯';
            }

            return this.$H.dateTimeDiffHumans(DateTime.fromISO(this.recordedAt));
        },
        map() {
            return this.mapLookup(this.point.mapId);
        },
        proposeUrl: () => 'https://github.com/polskie-mapy/data/issues',
        ...mapGetters({
            point: 'currentPoint',
            mapLookup: 'map'
        })
    },
    methods: {
        hideDetails() {
            this.$router.push({
                name: 'MapPage',
                params: { mapId: this.point.mapId }
            });
        },
        trackOutboundClick(linkType) {
            trackEvent('point_outbound_click', {
                point_id: this.point.id,
                map_id: this.point.mapId,
                link_type: linkType || 'link',
            });
            trackEvent('link_click', {
                point_id: this.point.id,
                map_id: this.point.mapId,
                link_type: linkType || 'link',
            });
        },
        handleYtClick(rawUrl) {
            if (!rawUrl) {
                return;
            }

            this.trackOutboundClick('yt');
            this.$H.openYtLink(rawUrl);
        },
        handleLinkClick(link) {
            this.trackOutboundClick(link.type);

            if (link.type === 'yt') {
                this.$H.openYtLink(link.url);
                return;
            }

            window.open(link.url, '_blank', 'noopener,noreferrer');
        },
    },
};
</script>
