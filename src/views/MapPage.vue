<template>
  <div id="map-viewer">
    <MapView ref="mapView" />
    <portal-target
      name="details"
      slim
    />
    <portal-target
      name="modal"
      slim
    />
  </div>
</template>

<script>
import MapView from '@/components/MapView.vue';
import store from '@/store';
import { consumePopstateNavigation, trackEvent } from '@/analytics';

export default {
    name: 'MapPage',
    components: {
        MapView,
    },
    async beforeRouteEnter(to, _from, next) {
        await store.dispatch('fetchMaps');
        store.dispatch('initializeVisitContext');

        if (!store.getters.anyMapSelected && typeof to.params.mapId === 'undefined') {
            store.commit('setCurrentMap', store.getters.defaultMap.id);

            return next({
                name: 'MapPage',
                params: {
                    mapId: store.getters.defaultMap.id
                }
            });
        }

        const selectedMapId = parseInt(to.params.mapId);

        if (store.getters.map(selectedMapId)) {
            store.commit('setCurrentMap', store.getters.map(selectedMapId));

            await store.dispatch('fetchPoints', selectedMapId);
        }

        next(vm => {
            if (to.query.focusPoint) {
                const point = vm.$store.getters.point(to.query.focusPoint);

                if (point) {
                    vm.$store.commit('setFocusedPoint', point);
                }
            }

            vm.trackMapOpen(to);
            vm.maybeOpenWelcomeModal();
        });
    },
    async beforeRouteUpdate(to, from, next) {
        if (
            typeof to.params.mapId !== 'undefined'
            && (from.params.mapId != to.params.mapId
            || !this.$store.getters.currentMapsIds.includes(to.params.mapId))
        ) {
            const selectedMapId = parseInt(to.params.mapId);

            await this.$store.dispatch('fetchPoints', selectedMapId);

            store.commit('setCurrentMap', store.getters.map(selectedMapId));
        }

        next();

        if (to.query.focusPoint) {
            const point = this.$store.getters.point(to.query.focusPoint);

            if (point) {
                this.$store.commit('setFocusedPoint', point);
            } else {
                this.$store.commit('unsetFocusedPoint');
            }
        } else {
            this.$store.commit('unsetFocusedPoint');
        }

        if (to.name === 'MapPage' && to.params.mapId !== from.params.mapId) {
            this.trackMapOpen(to);
            this.$nextTick(() => {
                this.maybeOpenWelcomeModal();
            });
        }
    },
    methods: {
        async maybeOpenWelcomeModal() {
            if (this.$route.name !== 'MapPage') {
                return;
            }

            const shouldOpen = await this.$store.dispatch('maybePrepareWelcomeModal');
            if (!shouldOpen) {
                return;
            }

            this.$router.push({
                name: 'MapWelcome',
                params: {
                    mapId: this.$store.getters.currentMap.id,
                },
            });
        },
        trackMapOpen(route) {
            const mapId = Number.parseInt(route.params.mapId, 10);
            if (Number.isNaN(mapId)) {
                return;
            }

            const navSource = route.query.navSource;

            let source = 'direct';
            if (consumePopstateNavigation()) {
                source = 'back_forward';
            } else if (navSource === 'switcher') {
                source = 'switcher';
            }

            trackEvent('map_open', {
                map_id: mapId,
                source,
            });
        }
    },
    mounted() {
        this.maybeOpenWelcomeModal();
    }
};
</script>
