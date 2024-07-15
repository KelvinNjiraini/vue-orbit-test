<script setup>
import {
    ref,
    onMounted,
    onUnmounted,
    computed,
    defineAsyncComponent,
} from 'vue';
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
const orbits = Array.from({ length: 9 });

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

onMounted(() => {
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});
</script>

<template>
    <div class="container">
        <div
            class="orbit-container"
            :style="{ height: `${radius}px`, width: `${radius}px` }"
        >
            <div class="orbit">
                <div
                    class="avatar-container"
                    :style="{ width: `${radius + avatarDiameter}px` }"
                >
                    <div
                        class="avatar-wrapper"
                        @mouseenter="handleAvatarHover"
                        @mouseleave="handleAvatarHover"
                    >
                        <img
                            src="/png/avatar-4.png"
                            alt="Avatar 3"
                            class="avatar"
                        />
                        <div class="avatar-info">
                            <ActivityCard
                                :show-card="showCard"
                                :meta-data="metaData"
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
        var(--dark-gray) 43%,
        transparent 50%
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
}
.avatar-container {
    display: flex;
    justify-content: flex-start;
    transform: rotate(10deg);
    position: relative;
}
.avatar {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 50%;
    transform: rotate(-10deg);
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
    rotate: -10deg;
}
</style>
