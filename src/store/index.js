import Vue from 'vue'
import Vuex from 'vuex'
import { rsrcUrl } from "@/helpers";
import search from './search';
import createDelegatedTasksHandler from "@/store/delegated-tasks";
import { APP_BUILT_DATE, APP_VERSION } from '@/app-helpers';

Vue.use(Vuex);

const LS_LAST_VISIT_AT = 'mi:last-visit-at';
const LS_LAST_SEEN_NEW_POINT_AT = 'mi:last-seen-new-point-added-at';
const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_LIMIT = 10;

function parseIsoTs(value) {
    if (!value || typeof value !== 'string') {
        return null;
    }

    const ts = Date.parse(value);

    return Number.isNaN(ts) ? null : ts;
}

function clampDifficulty(value) {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) {
        return 0;
    }

    return Math.min(5, Math.max(0, parsed));
}

export default new Vuex.Store({
    state: {
        colorScheme: 'system',
        maps: new Map(),
        points: new Map(),
        currentMaps: new Map(),
        currentPoint: null,
        focusedPoint: null,
        focusedLocation: null,
        showRecentlyAddedOnly: false,
        showHardestOnly: false,
        visitBaselineAtTs: null,
        visitWithin30Days: false,
        visitContextInitialized: false,
        welcomeModalShownInRuntime: false,
        welcomeModalPoints: [],
        welcomeModalMode: null,
    },
    // set - overwrites value(s)
    // unset - removes value(s)
    // add - appends value(s)
    // toggle - switches between predefined value(s) (i.e: true and false)
    // mark - one-way toggle (i.e: false to true, subsequent calls don't modify value)
    mutations: {
        setColorScheme(state, scheme) {
            state.colorScheme = scheme;
        },
        toggleColorScheme(state) {
            if (state.colorScheme === 'system') {
                state.colorScheme = 'dark';
            } else if (state.colorScheme === 'dark') {
                state.colorScheme = 'light';
            } else {
                state.colorScheme = 'system';
            }
        },
        addMaps(state, maps) {
            maps.forEach(x => state.maps.set(x.id, x));

            state.maps = new Map(state.maps);
        },
        addPoints(state, points) {
            points.forEach(x => state.points.set(x.id, x))

            state.points = new Map(state.points);
        },
        setCurrentMap(state, map) {
            state.currentMaps.set(map.id, map);

            state.currentMaps = new Map(state.currentMaps);
        },
        setCurrentPoint(state, point) {
            state.currentPoint = point;
        },
        toggleCurrentMaps(state, { map, enabled }) {
            if (enabled) {
                state.currentMaps.set(map.id, map);
            } else {
                state.currentMaps.delete(map.id);
            }

            state.currentMaps = new Map(state.currentMaps);
        },
        setFocusedPoint(state, point) {
            state.focusedPoint = point;
        },
        unsetFocusedPoint(state) {
            state.focusedPoint = null;
        },
        setFocusedLocation(state, location) {
            state.focusedLocation = location;
        },
        setShowRecentlyAddedOnly(state, enabled) {
            state.showRecentlyAddedOnly = !!enabled;
        },
        setShowHardestOnly(state, enabled) {
            state.showHardestOnly = !!enabled;
        },
        setVisitContext(state, { baselineAtTs, within30Days }) {
            state.visitBaselineAtTs = baselineAtTs;
            state.visitWithin30Days = within30Days;
        },
        markVisitContextInitialized(state) {
            state.visitContextInitialized = true;
        },
        markWelcomeModalShownInRuntime(state) {
            state.welcomeModalShownInRuntime = true;
        },
        setWelcomeModalPoints(state, points) {
            state.welcomeModalPoints = points;
        },
        setWelcomeModalMode(state, mode) {
            state.welcomeModalMode = mode;
        }
    },
    getters: {
        defaultMap(state) {
            for (const el of state.maps.values()) {
                if (el.isDefault === true) {
                    return el;
                }
            }

            return state.maps.values().next().value;
        },
        currentPoint(state) {
            return state.currentPoint;
        },
        anyMapSelected(state) {
            return state.currentMaps.size > 0;
        },
        currentMap(state, getters) {
            return state.currentMaps.values().next().value || getters.defaultMap;
        },
        currentMapsIds(state) {
            return Array.from(state.currentMaps.keys()).map(x => x);
        },
        points(state) {
            return Array.from(state.points.values());
        },
        currentPoints(_state, getters) {
            const basePoints = getters.points.filter(x => getters.currentMapsIds.includes(x.mapId));

            if (!getters.showRecentlyAddedOnly && !getters.showHardestOnly) {
                return basePoints;
            }

            const currentMapId = getters.currentMap?.id;
            const pointsFromCurrentMap = basePoints.filter(point => point.mapId === currentMapId);
            const pointsFromOtherMaps = basePoints.filter(point => point.mapId !== currentMapId);

            let filteredCurrentMapPoints = pointsFromCurrentMap;

            if (getters.showRecentlyAddedOnly) {
                if (getters.visitWithin30Days && getters.visitBaselineAtTs) {
                    filteredCurrentMapPoints = filteredCurrentMapPoints.filter((point) => {
                        const createdAtTs = parseIsoTs(point.createdAt);
                        return createdAtTs && createdAtTs > getters.visitBaselineAtTs;
                    });
                } else {
                    filteredCurrentMapPoints = filteredCurrentMapPoints
                        .slice()
                        .sort((a, b) => (parseIsoTs(b.createdAt) || 0) - (parseIsoTs(a.createdAt) || 0))
                        .slice(0, RECENT_LIMIT);
                }
            }

            if (getters.showHardestOnly) {
                filteredCurrentMapPoints = filteredCurrentMapPoints.filter((point) => clampDifficulty(point.difficulty) >= 4);
            }

            return [...filteredCurrentMapPoints, ...pointsFromOtherMaps];
        },
        maps(state) {
            return Array.from(state.maps.values());
        },
        point(state) {
            return (id) => state.points.get(id)
        },
        map(state) {
            return (id) => state.maps.get(id)
        },
        pinGroups(_state, getters) {
            return new Set(getters.points.map(x => x.group));
        },
        version() {
            return APP_VERSION;
        },
        builtDate() {
            return APP_BUILT_DATE;
        },
        colorSchemeIcon(state) {
            if (state.colorScheme === 'light') {
                return 'fa-solid fa-sun';
            }

            if(state.colorScheme === 'dark') {
                return 'fa-solid fa-moon';
            }

            return 'fa-solid fa-desktop';
        },
        showRecentlyAddedOnly(state) {
            return state.showRecentlyAddedOnly;
        },
        showHardestOnly(state) {
            return state.showHardestOnly;
        },
        visitBaselineAtTs(state) {
            return state.visitBaselineAtTs;
        },
        visitWithin30Days(state) {
            return state.visitWithin30Days;
        },
        welcomeModalPoints(state) {
            return state.welcomeModalPoints;
        },
        welcomeModalMode(state) {
            return state.welcomeModalMode;
        },
        globalMostRecentNewPointAddedAtTs(state) {
            return Math.max(
                0,
                ...Array
                    .from(state.maps.values())
                    .map((map) => parseIsoTs(map.mostRecentNewPointAddedAt) || 0)
            ) || null;
        }
    },
    actions: {
        initializeVisitContext(ctx) {
            if (ctx.state.visitContextInitialized) {
                return;
            }

            const nowTs = Date.now();
            const storedLastVisitAtTs = parseIsoTs(window.localStorage.getItem(LS_LAST_VISIT_AT));
            const within30Days = !!storedLastVisitAtTs && (nowTs - storedLastVisitAtTs) <= 30 * DAY_MS;

            ctx.commit('setVisitContext', {
                baselineAtTs: storedLastVisitAtTs,
                within30Days,
            });
            ctx.commit('markVisitContextInitialized');

            window.localStorage.setItem(LS_LAST_VISIT_AT, new Date(nowTs).toISOString());
        },
        async maybePrepareWelcomeModal(ctx) {
            if (ctx.state.welcomeModalShownInRuntime) {
                return false;
            }

            const globalMostRecentTs = ctx.getters.globalMostRecentNewPointAddedAtTs;
            if (!globalMostRecentTs) {
                return false;
            }

            const lastSeenGlobalTs = parseIsoTs(window.localStorage.getItem(LS_LAST_SEEN_NEW_POINT_AT));
            if (lastSeenGlobalTs && globalMostRecentTs <= lastSeenGlobalTs) {
                return false;
            }

            let targetMaps = ctx.getters.maps;
            let mode = 'latest_10';
            if (ctx.getters.visitWithin30Days && ctx.getters.visitBaselineAtTs) {
                mode = 'since_last_visit';
                targetMaps = ctx.getters.maps.filter((map) => {
                    const recentForMapTs = parseIsoTs(map.mostRecentNewPointAddedAt);
                    return recentForMapTs && recentForMapTs > ctx.getters.visitBaselineAtTs;
                });
            }

            await Promise.all(targetMaps.map((map) => ctx.dispatch('fetchPoints', map.id)));

            let points = ctx.getters.points.slice();
            if (ctx.getters.visitWithin30Days && ctx.getters.visitBaselineAtTs) {
                points = points.filter((point) => {
                    const createdAtTs = parseIsoTs(point.createdAt);
                    return createdAtTs && createdAtTs > ctx.getters.visitBaselineAtTs;
                });
            }

            const welcomePoints = points
                .slice()
                .sort((a, b) => (parseIsoTs(b.createdAt) || 0) - (parseIsoTs(a.createdAt) || 0))
                .slice(0, RECENT_LIMIT);

            if (welcomePoints.length === 0) {
                return false;
            }

            ctx.commit('setWelcomeModalPoints', welcomePoints);
            ctx.commit('setWelcomeModalMode', mode);
            ctx.commit('markWelcomeModalShownInRuntime');
            window.localStorage.setItem(LS_LAST_SEEN_NEW_POINT_AT, new Date(globalMostRecentTs).toISOString());

            return true;
        },
        async fetchPoints(ctx, mapId) {
            if (ctx.getters.points.find(x => x.mapId === mapId)) {
                // already fetched, no need to do that
                return;
            }

            const points = await (async () => {
                const resp = await fetch(rsrcUrl(`/maps/${mapId}/points`));

                return resp.json();
            })();

            ctx.commit('addPoints', points);
            ctx.dispatch('search/extendSearchIndex', points);
        },
        async fetchMaps(ctx) {
            const maps = await (async () => {
                const resp = await fetch(rsrcUrl('/maps'));

                return resp.json();
            })();

            ctx.commit('addMaps', maps);
        }
    },
    modules: {
        search
    },
    plugins: [
        createDelegatedTasksHandler(
            () => new Worker(
                new URL('../web-worker.js', import.meta.url),
                { type: 'module' }
            )
        )
    ]
})
