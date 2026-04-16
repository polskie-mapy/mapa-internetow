<template>
  <portal to="modal">
    <div
      class="absolute inset-0 z-modal bg-modal flex"
      @click.self.prevent="closeModal('backdrop')"
      @touchend.self.prevent="closeModal('backdrop')"
    >
      <div class="m-auto w-full max-w-3xl px-3 sm:px-4" @click.self.prevent="closeModal('backdrop')" @touchend.self.prevent="closeModal('backdrop')">
        <div class="bg-white dark:bg-gray-700 border-2 border-app rounded shadow cursor-auto max-h-[85vh] flex flex-col">
          <div class="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-600 flex items-center gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-lg sm:text-2xl font-semibold dark:text-white truncate">
                Ostatnio dodane
              </p>
              <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-300">
                Najnowsze punkty na mapach
              </p>
            </div>
            <button class="h-11 w-11 inline-flex items-center justify-center rounded hover:text-app dark:text-white dark:hover:text-app" @click="closeModal('x')">
              <fa-icon icon="fa-solid fa-times" fixed-width />
            </button>
          </div>

          <div class="overflow-y-auto p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <article
              v-for="point in points"
              :key="`welcome-point-${point.id}`"
              class="border border-app/40 rounded p-2 bg-gray-50 dark:bg-gray-800/40"
            >
              <div class="flex gap-2 sm:gap-3">
                <a
                  v-if="ytLink(point)"
                  :href="ytLink(point)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="h-20 w-28 sm:h-24 sm:w-36 rounded overflow-hidden shrink-0"
                  @click.prevent="openYtFromThumbnail(point)"
                  @touchend.prevent="openYtFromThumbnail(point)"
                >
                  <VideoThumbnail
                    :target-url="ytLink(point)"
                    :thumbnail-url="ytThumb(point)"
                    :point-id="point.id"
                    object-class="h-20 w-28 sm:h-24 sm:w-36"
                    class="h-20 w-28 sm:h-24 sm:w-36"
                  />
                </a>
                <div
                  v-else
                  class="h-20 w-28 sm:h-24 sm:w-36 rounded overflow-hidden relative bg-gray-300 dark:bg-gray-600 shrink-0"
                >
                  <div class="text-app bg-black/25 inset-0 absolute grid place-content-center">
                    <fa-icon icon="fa-solid fa-video-slash" size="2x" fixed-width />
                  </div>
                </div>

                <div class="min-w-0 flex-1 flex flex-col">
                  <p class="font-semibold text-sm sm:text-base dark:text-white line-clamp-2">
                    {{ point.title }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-300 line-clamp-1">
                    {{ mapLabel(point.mapId) }}
                  </p>
                  <div class="mt-auto pt-2">
                    <button
                      class="w-full sm:w-auto bg-app text-white dark:text-gray-800 px-3 py-2 rounded text-xs sm:text-sm hover:outline outline-2 outline-offset-1 outline-app active:scale-[0.98] touch-manipulation"
                      @click="openPoint(point)"
                    >
                      Na mapie
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </portal>
</template>

<script>
import { mapGetters } from 'vuex';
import VideoThumbnail from '@/components/VideoThumbnail.vue';
import { trackEvent } from '@/analytics';

export default {
    name: 'WelcomeModal',
    components: {
        VideoThumbnail,
    },
    computed: {
        ...mapGetters({
            points: 'welcomeModalPoints',
            mapLookup: 'map',
            welcomeModalMode: 'welcomeModalMode',
        }),
    },
    methods: {
        async closeModal(method = 'x') {
            if (this._closingModal) {
                return;
            }

            this._closingModal = true;
            this._closeTracked = true;
            trackEvent('welcome_modal_close', { method });
            const mapId = Number.parseInt(this.$route.params.mapId, 10);

            try {
                await this.$router.replace({
                    name: 'MapPage',
                    params: { mapId },
                }).catch((err) => {
                    if (err && err.name !== 'NavigationDuplicated') {
                        throw err;
                    }
                });

                if (this.$route.name === 'MapWelcome') {
                    this.$router.back();
                }
            } finally {
                this._closingModal = false;
            }
        },
        mapLabel(mapId) {
            return this.mapLookup(mapId)?.name || 'Mapa';
        },
        ytLink(point) {
            const yt = point.links.find((link) => link.type === 'yt');
            return yt ? this.$H.ytLink(yt.url) : null;
        },
        ytThumb(point) {
            const yt = point.links.find((link) => link.type === 'yt');
            return yt ? this.$H.ytThumbUrl(yt.url) : null;
        },
        openPoint(point) {
            trackEvent('welcome_modal_cta_click', {
                point_id: point.id,
                map_id: point.mapId,
            });
            this.$router.push({
                name: 'PointDetails',
                params: {
                    mapId: point.mapId,
                    pointId: point.id,
                },
                query: {
                    source: 'welcome',
                }
            });
        },
        openYtFromThumbnail(point) {
            const link = this.ytLink(point);
            if (!link) {
                return;
            }

            this.trackOutboundLink(point, 'yt');
            window.open(link, '_blank', 'noopener,noreferrer');
        },
        trackOutboundLink(point, linkType) {
            trackEvent('point_outbound_click', {
                point_id: point.id,
                map_id: point.mapId,
                link_type: linkType || 'link',
                source: 'welcome_modal',
            });
            trackEvent('link_click', {
                point_id: point.id,
                map_id: point.mapId,
                link_type: linkType || 'link',
                source: 'welcome_modal',
            });
        },
    },
    mounted() {
        trackEvent('welcome_modal_show', {
            items_count: this.points.length,
            mode: this.welcomeModalMode || 'latest_10',
        });
    },
    beforeRouteLeave(to, _from, next) {
        if (!this._closeTracked && to.name === 'MapPage') {
            trackEvent('welcome_modal_close', { method: 'back' });
        }

        next();
    },
};
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
