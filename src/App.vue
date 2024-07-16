<script setup>
import {
    ref,
    onMounted,
    onUnmounted,
    computed,
    defineAsyncComponent,
} from 'vue';
import { useFetch } from './composables/useFetch';
const ActivityCard = defineAsyncComponent(() =>
    import('./components/ActivityCard.vue')
);
// const avatarDiameter = 60;
const hoveredId = ref(null);
const hoveredPosition = ref({ x: 0, y: 0 });
const showCard = ref(false);
const cursorOnPopover = ref(false);

const screenWidth = ref(window.innerWidth);
const screenHeight = ref(window.innerHeight);

const radius = computed(() => {
    return Math.min(screenWidth.value / 2, screenHeight.value);
});

const data = ref([]);

function handleDuplicateIds(originalArr) {
    return new Set(originalArr);
}

function handleResize() {
    screenWidth.value = window.innerWidth;
    screenHeight.value = window.innerHeight;
}

function handleScroll() {
    console.log(window.scrollY);
}

function handleAvatarEnter(event, elementId) {
    // if (event.target.id !== String(elementId)) return;
    if (event.type === 'mouseenter' && event.target.id === String(elementId)) {
        hoveredId.value = event.target.id;
        showCard.value = true;

        const rect = event.target.getBoundingClientRect();
        hoveredPosition.value = {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
        };

        return;
    }
}
function handleAvatarLeave(event, elementId) {
    // if (event.target.id !== String(elementId)) return;
    // console.log(event.target.id === String(elementId));
    if (event.type === 'mouseleave' && event.target.id === String(elementId)) {
        hoveredId.value = null;
        showCard.value = false;
        hoveredPosition.value = { x: 0, y: 0 }; // Reset position
        return;
    }
}

function calculateOrbitRadius(currentRadius, dataLength, currentIndex) {
    return (currentRadius / dataLength) * (dataLength - currentIndex);
}

function handleAvatarAngle(dataLength, currentIndex) {
    const baseAngle = 160 / dataLength;
    return baseAngle * (currentIndex + 1);
}

onMounted(async () => {
    window.addEventListener('resize', handleResize);
    data.value = await useFetch(new Date().toISOString());
    // console.log(data.value);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});
</script>

<template>
    <div class="container">
        <div
            class="orbit-container"
            :style="{
                height: `${calculateOrbitRadius(radius, data.length, index)}px`,
                width: `${calculateOrbitRadius(radius, data.length, index)}px`,
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
                        @mouseleave="
                            ($event) =>
                                handleAvatarLeave($event, avatarItem?.id)
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
                                :show-card="showCard"
                                :meta-data="orbit.array[avatarIdx]"
                                :id="orbit.array[avatarIdx].id"
                                :hovered-id="hoveredId"
                                :contact-date="orbit.contact_date"
                                :custom-styles="{
                                    left: `${hoveredPosition.x}px`,
                                    top: `${hoveredPosition.y}px`,
                                }"
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
    /* place-items: center; */
}
.avatar-container {
    /* display: flex; */
    /* justify-content: flex-start; */
    /* transform: rotate(10deg); */
    /* position: relative; */
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
    /* transform: rotate(-10deg); */
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
    overflow: hidden;
}
.avatar-info {
    position: absolute;
}
</style>
