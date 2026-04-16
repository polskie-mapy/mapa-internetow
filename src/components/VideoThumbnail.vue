<template>
    <div
        class="video-thumbnail-container"
    >
        <div
            v-if="!failed"
            class="video-thumbnail overflow-hidden rounded w-full h-full relative"
        >
            <object
                ref="thumbnailObject"
                type="image/jpg"
                :data="thumbnailUrl"
                :class="[objectClass, 'pointer-events-none']"
            >
                <div class="h-full w-full grid place-items-center text-white bg-gray-300">
                    <fa-icon
                        icon="fa-solid fa-ellipsis"
                        class="slide-top"
                        size="5x"
                    />
                </div>
            </object>
            <div
                class="text-app bg-black/25 inset-0 absolute grid place-content-center pointer-events-none"
            >
                <fa-icon
                    icon="fa-regular fa-circle-play"
                    size="4x"
                    fixed-width
                />
            </div>
        </div>
        <div
            v-else
            class="h-full w-full tooltipped"
        >
            <div class="tooltip">
                Nagranie zostało usunięte
            </div>
            <div
                class="text-red-600 bg-gray-300 inset-0 absolute grid place-content-center rounded"
            >
                <fa-icon
                    icon="fa-solid fa-link-slash"
                    size="4x"
                    fixed-width
                />
            </div>
        </div>
    </div>
</template>

<script>
import {captureMessage} from '@sentry/vue';

export default {
    name: "VideoThumbnail",
    props: {
        targetUrl: {
            type: String,
            required: true,
        },
        pointId: {
            type: Number,
            required: true,
        },
        thumbnailUrl: {
            type: String,
            required: true,
        },
        objectClass: {
            type: [String, Array, Object],
            default: '',
        }
    },
    data: () => ({
        failed: false,
    }),
    methods: {
        errorHandler() {
            this.failed = true;

            captureMessage(`Video ${this.targetUrl} is unavailable`, {
                extra: {
                    videoUrl: this.targetUrl
                },
                tags: ['missing_video', `point_${this.pointId}`]
            })
        }
    },
    mounted() {
        this.$refs.thumbnailObject?.addEventListener('error', this.errorHandler);
    },
    beforeDestroy() {
        this.$refs.thumbnailObject?.removeEventListener('error', this.errorHandler);
    }
}
</script>

<style scoped>

</style>
