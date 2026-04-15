import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/pro-solid-svg-icons';
import { far } from '@fortawesome/pro-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import PortalVue from 'portal-vue';
import VueHelpers from '@/helpers';
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";
import 'virtual:windi.css';
import 'virtual:windi-devtools';
import '@/assets/ui.css';
import { APP_VERSION } from './app-helpers';
import { initAnalyticsNavigationTracking, initAnalyticsQueue } from './analytics';

library.add(fas, far, fab);
Vue.component('FaIcon', FontAwesomeIcon);

Vue.config.productionTip = false;

Vue.use(PortalVue);
Vue.use(VueHelpers);
initAnalyticsNavigationTracking();
initAnalyticsQueue();

if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
        Vue,
        release: APP_VERSION,
        logErrors: true,
        dsn: import.meta.env.VITE_SENTRY_DSN,
        integrations: [
            new BrowserTracing({
                routingInstrumentation: Sentry.vueRouterInstrumentation(router),
                tracingOrigins: [/^(\*\.)?mapainternetow\.pl/, /^\//],
            }),
        ],
        tracesSampleRate: import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0,
    });
}

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
