<script setup>
import {
    ref,
    onMounted,
    onUnmounted,
    computed,
    defineAsyncComponent,
    onBeforeMount,
    onBeforeUnmount,
} from 'vue';
import { useFetch } from './composables/useFetch';
const ActivityCard = defineAsyncComponent(() =>
    import('./components/ActivityCard.vue')
);
// const avatarDiameter = 60;
const hoveredId = ref(null);
const hoveredPosition = ref({ x: 0, y: 0 });
const isCursorOnCard = ref(false);

const screenWidth = ref(window.innerWidth);
const screenHeight = ref(window.innerHeight);

const radius = computed(() => {
    return Math.min(screenWidth.value / 2, screenHeight.value);
});

const data = ref([]);

function handleDuplicateIds(originalArr) {
    return new Set(originalArr);
}

function handleAvatarEnter(event, elementId) {
    // if (event.target.id !== String(elementId)) return;
    if (event.type === 'mouseenter' && event.target.id === String(elementId)) {
        hoveredId.value = event.target.id;
        // showCard.value = true;

        const rect = event.target.getBoundingClientRect();
        let topPosition = rect.top;
        let distanceFromBottom = window.innerHeight - topPosition;
        if (distanceFromBottom < 400) {
            hoveredPosition.value = {
                x: rect.left + window.scrollX,
                y: window.innerHeight - 400,
            };
            return;
        }
        hoveredPosition.value = {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
        };

        return;
    }
}

function handleCursorOnCard(cursorOnPopover) {
    if (!cursorOnPopover && isCursorOnCard.value) {
        setTimeout(() => {
            // Reset position
            hoveredId.value = null;
            hoveredPosition.value = { x: 0, y: 0 };
            isCursorOnCard.value = false;
        }, 100);
        return;
    }
    if (cursorOnPopover && !isCursorOnCard.value) {
        isCursorOnCard.value = true;
    }
}

function calculateOrbitRadius(currentRadius, dataLength, currentIndex) {
    return (currentRadius / dataLength) * (dataLength - currentIndex);
}

function handleAvatarAngle(dataLength, currentIndex) {
    const baseAngle = 160 / dataLength;
    return baseAngle * (currentIndex + 1);
}
onBeforeMount(() => {
    window.addEventListener('scroll', function (event) {
        console.log(event);
    });
});

onMounted(async () => {
    //
    data.value = await useFetch(new Date().toISOString());
    // console.log(data.value);
});

onUnmounted(() => {
    //
});
</script>

<template>
    <div class="container">
        <div
            class="orbit-container"
            :style="{
                height: `${calculateOrbitRadius(
                    screenWidth * 0.8,
                    data.length,
                    index
                )}px`,
                width: `${calculateOrbitRadius(
                    screenWidth * 0.8,
                    data.length,
                    index
                )}px`,
            }"
            v-if="data.length !== 0"
            v-for="(orbit, index) in data.slice(0, 7)"
            :key="index"
        >
            <div class="orbit">
                <div
                    v-if="orbit.array !== 0"
                    v-for="(avatarItem, avatarIdx) in handleDuplicateIds(
                        orbit.array
                    )"
                    :key="avatarItem?.id"
                    class="avatar-container"
                    :style="{
                        // width: `${
                        //     calculateOrbitRadius(radius, data.length, index) +
                        //     avatarDiameter
                        // }px`,
                        rotate: `${handleAvatarAngle(
                            orbit.array.length,
                            avatarIdx
                        )}deg`,
                    }"
                >
                    <div
                        class="avatar-wrapper"
                        :id="avatarItem?.id"
                        @mouseenter="
                            ($event) =>
                                handleAvatarEnter($event, avatarItem?.id)
                        "
                    >
                        <img
                            :src="avatarItem.img"
                            alt="Avatar 3"
                            class="avatar"
                            :style="{
                                rotate: `-${
                                    handleAvatarAngle(
                                        orbit.array.length,
                                        avatarIdx
                                    ) +
                                    160 / orbit.array.length
                                }deg`,
                            }"
                        />
                        <div
                            class="avatar-info"
                            :style="{
                                rotate: `-${handleAvatarAngle(
                                    orbit.array.length,
                                    avatarIdx
                                )}deg`,
                            }"
                        >
                            <ActivityCard
                                :meta-data="orbit.array[avatarIdx]"
                                :id="orbit.array[avatarIdx].id"
                                :hovered-id="hoveredId"
                                :contact-date="orbit.contact_date"
                                :custom-styles="{
                                    left: `${hoveredPosition.x}px`,
                                    top: `${hoveredPosition.y}px`,
                                }"
                                @card-hover-on="handleCursorOnCard"
                                @card-hover-off="handleCursorOnCard"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
}
.orbit-container {
    position: absolute;
    border-radius: 50%;
    left: 50%;
    transform: translate(-50%, 50%);
    bottom: 0;
    background-image: linear-gradient(
        180deg,
        var(--light-gray),
        var(--dark-gray) 30%,
        #000000 65%
    );
    transition: all 200ms ease-in-out;
    padding: 1px;
}
.orbit {
    width: 100%;
    height: 100%;
    background: var(--background-color);
    border-radius: 52%;
    display: grid;
    align-content: center;
    justify-content: center;
    position: relative;
    rotate: 5deg;
}
.avatar-container {
    position: absolute;
    transform: translate(0, 50%);
    bottom: 50%;
    width: 50%;
    transform-origin: 100%;
}
.avatar {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 50%;
    position: relative;
    z-index: -1;
}
.avatar::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: -2;
    background-image: linear-gradient(
        180deg,
        var(--light-gray),
        var(--dark-gray) 60%
    );
    border-radius: inherit;
    /* margin: -1px; */
}
.avatar-wrapper {
    position: relative;
    height: 0px;
    display: flex;
    align-items: center;
    margin-left: -30px;
}
.avatar-info {
    position: absolute;
}
.disable-pointer-events {
    pointer-events: 'none';
}
</style>
