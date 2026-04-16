import {round, trimStart} from "lodash";
import {DateTime} from "luxon";
import {findIconDefinition as faFindIconDefinition} from "@fortawesome/fontawesome-svg-core";
import _isMobile from 'ismobilejs';

export const ytUriRegex = new RegExp(
    /^(?:https?:\/\/)?(?:\w+\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})(?:&t=\d+s?)?$/,
    'i',
);

export const LINK_TYPE_COLOR = {
    ['yt']: '#d70000',
    ['ig']: '#405de6',
    ['map']: '#0b4a6e',
    ['news']: '#75716f',
};
export const LINK_TYPE_ICONS = {
    ['yt']: 'fa-brands fa-youtube',
    ['ig']: 'fa-brands fa-instagram',
    ['map']: 'fa-solid fa-map-location-dot',
    ['news']: 'fa-regular fa-newspaper',
    ['link']: linkTypeIconDefault(),
};
export const LINK_TYPE_URL = {
    ['ig']: 'https://www.instagram.com/:id/',
    ['wykop']: 'https://www.wykop.pl/ludzie/:id/',
    ['github']: 'https://github.com/:id',
    ['discord']: '#', // not handling that case
    ['label']: '#', // not handling that case
};

export const COLOR_SCHEMES = [
    'system',
    'dark',
    'light'
];

export const DATEDIFF_PRIORITIES = [
    'years', 'months', 'weeks', 'days'
];

export const DATEDIFF_LANG = {
    years: ['rok temu', ':v lata temu', 'dawno temu'],
    months: ['miesiąc temu', ':v m-ce temu', ':v m-cy temu'],
    weeks: ['tydzień temu', ':v tygodnie temu', ':v tygodni temu'],
    days: ['dzień temu', ':v dni temu', ':v dni temu'],
    recently: ['niedawno']
};

export const LINK_TYPE_TOOLTIPS = {
    ['yt']: 'Zobacz nagranie na YT',
    ['map']: 'Zobacz miejsce na Google Maps',
    ['news']: 'Zobacz artykuł dotyczący tego nagrania',
}

export const LS_YT_NATIVE_SUPPORTED = 'mi:yt-native-supported';

export function isIos() {
    return _isMobile(window.navigator).apple.device;
}

export function isAndroid() {
    return _isMobile(window.navigator).android.device;
}

export function ytId(link) {
    return ytUriRegex.exec(link)[1];
}

export function ytLink(link) {
    if (isYtNativeSupported() === true) {
        const native = ytNativeLink(link);

        if (native) {
            return native;
        }
    }

    return link;
}

export function ytNativeLink(link) {
    if (isIos()) {
        return `youtube://${ytId(link)}`;
    }

    if (isAndroid()) {
        return `vnd.youtube:${ytId(link)}`;
    }

    return null;
}

export function isYtNativeSupported() {
    if (typeof window === 'undefined') {
        return null;
    }

    const raw = window.localStorage.getItem(LS_YT_NATIVE_SUPPORTED);
    if (raw === '1') {
        return true;
    }
    if (raw === '0') {
        return false;
    }

    return null;
}

export function markYtNativeSupport(value) {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(LS_YT_NATIVE_SUPPORTED, value ? '1' : '0');
}

export function openYtLink(link) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

    // Desktop/laptop: always open YouTube in new tab.
    if (!isIos() && !isAndroid()) {
        window.open(link, '_blank', 'noopener,noreferrer');
        return;
    }

    const nativeUrl = ytNativeLink(link);
    if (!nativeUrl) {
        window.location.href = link;
        return;
    }

    const supported = isYtNativeSupported();
    if (supported === true) {
        window.location.href = nativeUrl;
        return;
    }
    if (supported === false) {
        window.location.href = link;
        return;
    }

    let hidden = false;
    const onVisibility = () => {
        if (document.visibilityState === 'hidden') {
            hidden = true;
        }
    };

    document.addEventListener('visibilitychange', onVisibility, true);
    window.location.href = nativeUrl;

    window.setTimeout(() => {
        document.removeEventListener('visibilitychange', onVisibility, true);

        if (hidden) {
            markYtNativeSupport(true);
            return;
        }

        markYtNativeSupport(false);
        window.location.href = link;
    }, 800);
}

export function linkTypeColor(type) {
    return LINK_TYPE_COLOR[type] || linkTypeColorDefault();
}

export function linkTypeIcon(type) {
    return LINK_TYPE_ICONS[type] || linkTypeIconDefault();
}

export function linkTypeColorDefault() {
    return '#f2741c';
}

export function linkTypeIconDefault() {
    return 'fa-solid fa-link';
}

export function linkTypeColorStyle(value) {
    return `--pm-point-details-link-color: ${linkTypeColor(value)}`
}

export function coord2Dms(coord, winds) {
    if (typeof coord !== 'number') throw TypeError('number expected');

    const absDegrees = Math.abs(coord);
    const floorAbsDegrees = Math.floor(coord);
    const sign = Math.sign(coord);
    const degrees = sign * floorAbsDegrees;
    const minutes = Math.floor(60 * (absDegrees - floorAbsDegrees));
    const seconds = 3600 * (absDegrees - floorAbsDegrees) - 60 * minutes;
    const wind = sign >= 0 ? winds[0] : winds[1];

    return `${degrees}°${round(minutes, 3)}'${round(seconds, 3)}"${wind}`;
}

export function coords2Dms(coords) {
    const winds = [['E', 'W'], ['N', 'S']];

    return coords.map(coord => coord2Dms(coord, winds.pop())).join(' ');
}

export function coords2GmapsPin(coords) {
    const loc = coords.join(',');
    const placePin = encodeURIComponent(coords2Dms(coords));
    const zoom = 17;
    
    if (isIos()) {
        return `comgooglemaps://?q=${placePin}&center=${loc}&zoom=${zoom}`;
    }

    if (isAndroid()) {
        return `geo:${loc}?q=${placePin}&zoom=${zoom}`;
    }

    return `https://www.google.com/maps/place/${placePin}/@${loc},${zoom}z`;
}

export function ytThumbUrl(ytUrl) {
    return `https://img.youtube.com/vi/${ytId(ytUrl)}/hqdefault.jpg`
}

export function linkTypeUrl(type, id) {
    const template = LINK_TYPE_URL[type];

    return template ? template.replace(':id', id) : null;

}

export function langChoice(langArr, value) {
    if (value === 1) {
        return langArr[0].replace(':v', value);
    } else if (value >= 5) {
        return langArr[2].replace(':v', value);
    }

    return langArr[1].replace(':v', value);
}

export function dateTimeDiffHumans(date) {
    const dur = DateTime.now().diff(date, DATEDIFF_PRIORITIES).toObject();

    for (const k of DATEDIFF_PRIORITIES) {
        if (dur[k] > 0) {
            return langChoice(DATEDIFF_LANG[k], Math.floor(dur[k]));
        }
    }

    // if too small to show difference (<day), show generic recently title
    return langChoice(DATEDIFF_LANG.recently, 1);
}

export function prettyDate(date) {
    if (typeof date === 'string') {
        date = DateTime.fromISO(date);
    }

    return date.toLocaleString(DateTime.DATETIME_MED);
}

export function translateIconCode(code) {
    if (code) {
        const icon = code.split(':');
        return {
            prefix: icon[0],
            iconName: icon[1],
        }
    }

    return {
        prefix: 'fa-solid',
        iconName: 'fa-marker'
    };
}

export function findIconDefinition(code) {
    const tr = translateIconCode(code);
    const iconLookup = {
        prefix: `fa${tr.prefix[3]}`,
        iconName: tr.iconName.substring(3)
    }

    return faFindIconDefinition(iconLookup);
}

export function linkTypeDefaultTooltip(type) {
    return LINK_TYPE_TOOLTIPS[type];
}

export function iconCodeToIconName(code) {
    const {iconName, prefix} = translateIconCode(code);

    return `${prefix} ${iconName}`;
}

export function rsrcUrl(url) {
    return `${import.meta.env.VITE_DATA_BASE_URL}/${trimStart(url, '/')}${import.meta.env.VITE_DATA_URL_SUFFIX}`;
}

export default {
    install(Vue) {
        Vue.prototype.$H = {
            ytId,
            linkTypeColor,
            linkTypeIcon,
            coords2Dms,
            coords2GmapsPin,
            ytThumbUrl,
            linkTypeUrl,
            dateTimeDiffHumans,
            findIconDefinition,
            linkTypeDefaultTooltip,
            ytLink,
            openYtLink,
        };

        Vue.mixin({
            filters: {
                linkTypeColorStyle,
                linkTypeDefaultTooltip,
                linkTypeIcon,
                prettyDate,
                iconCodeToIconName
            }
        })
    },
};
