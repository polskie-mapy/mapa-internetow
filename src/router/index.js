import Vue from 'vue'
import VueRouter from 'vue-router'
import MapPage from '../views/MapPage.vue'
import PointDetails from "@/components/PointDetails.vue";

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

export default router
