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
const avatarDiameter = 60;
const showCard = ref(false);
const metaData = ref({});
const screenWidth = ref(window.innerWidth);
const screenHeight = ref(window.innerHeight);
const radius = computed(() => {
    return Math.min(screenWidth.value / 2, screenHeight.value);
});
const orbitRadius = ref(null);
const data = ref([]);

function handleResize() {
    screenWidth.value = window.innerWidth;
    screenHeight.value = window.innerHeight;
}

function handleAvatarHover(event) {
    if (event.type === 'mouseenter') {
        showCard.value = true;
        return;
    }
    if (event.type === 'mouseleave') {
        showCard.value = false;
        return;
    }
}

function calculateOrbitRadius(currentRadius, dataLength, currentIndex) {
    return (currentRadius / dataLength) * (dataLength - currentIndex);
    // return (currentRadius / dataLength) * currentIndex;
}

function handleAvatarAngle(dataLength, currentIndex) {
    const baseAngle = 160 / dataLength;
    console.log(baseAngle * (currentIndex + 1), dataLength);
    return baseAngle * (currentIndex + 1);
}

onMounted(async () => {
    window.addEventListener('resize', handleResize);
    data.value = await useFetch(new Date().toISOString());
    console.log(data.value);
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
            v-for="(orbit, index) in data"
            :key="index"
        >
            <div class="orbit">
                <div
                    v-if="orbit.array !== 0"
                    v-for="(avatarItem, avatarIdx) in orbit.array"
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
                    <div class="avatar-wrapper">
                        <img
                            :src="avatarItem.img"
                            alt="Avatar 3"
                            class="avatar"
                            :style="{
                                // rotate: `-${160 / orbit.array.length}deg`,
                            }"
                            @mouseenter="handleAvatarHover"
                            @mouseleave="handleAvatarHover"
                        />
                        <div
                            class="avatar-info"
                            :style="{
                                rotate: `0deg`,
                            }"
                        >
                            <ActivityCard
                                :show-card="showCard"
                                :meta-data="orbit.array[avatarIdx]"
                                :id="orbit.array[avatarIdx].id"
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
    border-radius: 50%;
    display: grid;
    align-content: center;
    justify-content: center;
    position: relative;
    rotate: 10deg;
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
}
.avatar-info {
    position: absolute;
    bottom: 2rem;
    left: 0;
}
</style>
