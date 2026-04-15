import Vue from 'vue'
import VueRouter from 'vue-router'
import MapPage from '../views/MapPage.vue'
import PointDetails from "@/components/PointDetails.vue";
import WelcomeModal from "@/views/WelcomeModal.vue";
import store from '@/store';

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        component: MapPage,
        children: [
            {
                path: 'about',
                name: 'About',
                component: () => import('@/views/AboutModal.vue')
            }
        ]
    },
    {
        path: '/maps/:mapId/',
        name: 'MapPage',
        component: MapPage,
        children: [
            {
                path: 'welcome',
                name: 'MapWelcome',
                component: WelcomeModal,
            },
            {
                path: 'point/:pointId',
                component: PointDetails,
                name: 'PointDetails',
                props: (route) => ({pointId: Number.parseInt(route.params.pointId, 10)})
            }
        ],
        props: (route) => ({mapId: Number.parseInt(route.params.mapId, 10)})
    },
]

const router = new VueRouter({
    routes,
    linkActiveClass: '',
    linkExactActiveClass: '',
    mode: import.meta.env.PROD ? 'history' : 'hash',
})

function routeSeo(to) {
    const baseTitle = 'Mapa internetów';
    const baseDescription = 'Zobacz legendarne filmy internetu na mapie internetów. Jeszcze więcej punktów i nowe mapy.';
    const defaultCanonical = 'https://mapainternetow.pl/';
    const mapId = Number.parseInt(to.params.mapId, 10);
    const pointId = Number.parseInt(to.params.pointId, 10);
    const mapName = !Number.isNaN(mapId)
        ? (store.getters.map(mapId)?.name || 'Mapa internetów')
        : 'Mapa internetów';
    const pointName = !Number.isNaN(pointId)
        ? (store.getters.point(pointId)?.title || 'Punkt')
        : null;

    if (to.name === 'PointDetails' && !Number.isNaN(mapId) && !Number.isNaN(pointId)) {
        return {
            title: `${pointName} na ${mapName} | ${baseTitle}`,
            description: `${pointName} na ${mapName}. ${baseDescription}`,
            canonical: `https://mapainternetow.pl/maps/${mapId}/point/${pointId}`,
        };
    }

    if ((to.name === 'MapPage' || to.name === 'MapWelcome') && !Number.isNaN(mapId)) {
        return {
            title: `${mapName} | ${baseTitle}`,
            description: `Przeglądaj punkty na mapie ${mapName}. ${baseDescription}`,
            canonical: `https://mapainternetow.pl/maps/${mapId}/`,
        };
    }

    if (to.name === 'About') {
        return {
            title: `O projekcie | ${baseTitle}`,
            description: baseDescription,
            canonical: defaultCanonical,
        };
    }

    return {
        title: baseTitle,
        description: baseDescription,
        canonical: defaultCanonical,
    };
}

router.afterEach((to) => {
    const seo = routeSeo(to);
    document.title = seo.title;

    const descriptionEl = document.querySelector('meta[name="description"]');
    const ogTitleEl = document.querySelector('meta[property="og:title"]');
    const ogDescriptionEl = document.querySelector('meta[property="og:description"]');
    const twitterTitleEl = document.querySelector('meta[name="twitter:title"]');
    const twitterDescriptionEl = document.querySelector('meta[name="twitter:description"]');
    const canonicalEl = document.querySelector('link[rel="canonical"]');

    descriptionEl?.setAttribute('content', seo.description);
    ogTitleEl?.setAttribute('content', seo.title);
    ogDescriptionEl?.setAttribute('content', seo.description);
    twitterTitleEl?.setAttribute('content', seo.title);
    twitterDescriptionEl?.setAttribute('content', seo.description);
    canonicalEl?.setAttribute('href', seo.canonical);
});

export default router
