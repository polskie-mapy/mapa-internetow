let popstateNavigationPending = false;
const queuedEvents = [];
const MAX_QUEUE_SIZE = 200;
let queueInitialized = false;

function isUmamiReady() {
    return typeof window !== 'undefined' && window.umami && typeof window.umami.track === 'function';
}

function flushQueuedEvents() {
    if (!isUmamiReady() || queuedEvents.length === 0) {
        return;
    }

    while (queuedEvents.length > 0) {
        const queued = queuedEvents.shift();
        window.umami.track(queued.eventName, queued.props);
    }
}

export function initAnalyticsQueue() {
    if (queueInitialized || typeof window === 'undefined') {
        return;
    }

    queueInitialized = true;
    window.addEventListener('load', flushQueuedEvents);

    // Umami script is deferred and may be ready shortly after app boot.
    window.setInterval(flushQueuedEvents, 1000);
}

export function initAnalyticsNavigationTracking() {
    window.addEventListener('popstate', () => {
        popstateNavigationPending = true;
    });
}

export function consumePopstateNavigation() {
    const value = popstateNavigationPending;
    popstateNavigationPending = false;

    return value;
}

export function trackEvent(eventName, props = {}) {
    const normalizedProps = Object
        .entries(props)
        .filter(([, value]) => typeof value !== 'undefined' && value !== null)
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});

    if (!isUmamiReady()) {
        queuedEvents.push({
            eventName,
            props: normalizedProps,
        });

        if (queuedEvents.length > MAX_QUEUE_SIZE) {
            queuedEvents.shift();
        }

        return;
    }

    flushQueuedEvents();
    window.umami.track(eventName, normalizedProps);
}
