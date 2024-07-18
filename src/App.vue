<script setup>
import {
    ref,
    onMounted,
    onUnmounted,
    computed,
    defineAsyncComponent,
    watch,
} from 'vue';
import { useFetch } from './composables/useFetch';
const ActivityCard = defineAsyncComponent(() =>
    import('./components/ActivityCard.vue')
);
// const avatarDiameter = 60;
const maxOrbitCount = 7;
const startingPoint = ref(0);
const currentOrbitCount = ref(maxOrbitCount);
const hoveredId = ref(null);
const hoveredPosition = ref({ x: 0, y: 0 });
const isCursorOnCard = ref(false);
const screenWidth = ref(window.innerWidth);
const screenHeight = ref(window.innerHeight);
const data = ref([]);
const slicedData = computed(() => {
    return data?.value.slice(startingPoint.value, currentOrbitCount.value);
});
const modifiedArr = ref([]);

// watch(
//     () => startingPoint.value,
//     () => {
//         console.log(startingPoint);
//         modifyData(data.value);
//     }
// );

function modifyData(data) {
    let arr = [];
    let outerHiddenArr = [];
    let visibleArr = [];
    let innerHiddenArr = [];

    for (let i = 0; i < data.length; i++) {
        if (
            i >= startingPoint.value &&
            i <= startingPoint.value + maxOrbitCount
        ) {
            visibleArr.push({ ...data[i], visible: true });
        } else if (i >= startingPoint.value + maxOrbitCount) {
            innerHiddenArr.push({ ...data[i], visible: false });
        } else if (i <= startingPoint.value) {
            innerHiddenArr.push({ ...data[i], visible: false });
        }
    }

    arr = [...outerHiddenArr, ...visibleArr, ...innerHiddenArr];
    console.log(arr);
    modifiedArr.value = arr;
    return modifiedArr.value;
}

function handleDuplicateIds(originalArr) {
    const uniqueIds = originalArr.reduce((accumulator, current) => {
        if (!accumulator.includes(current)) {
            accumulator.push(current);
        }
        return accumulator;
    }, []);

    return uniqueIds;
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

function calculateOrbitRadius(
    currentRadius,
    dataLength,
    currentIndex,
    visible
) {
    // subtracting 40px from top as margin
    return visible
        ? (currentRadius / maxOrbitCount - 40) * (dataLength - currentIndex)
        : 0;
}

function handleAvatarAngle(dataLength, currentIndex) {
    const baseAngle = 160 / dataLength;
    return baseAngle * (currentIndex + 1);
}

function addition() {
    console.log(
        `Data length: ${data.value.length}, current Count: ${
            maxOrbitCount + startingPoint.value
        }`
    );
    if (startingPoint.value + maxOrbitCount < data.value.length) {
        startingPoint.value += 1;
    }
}

function subtraction() {
    if (startingPoint.value <= 0) return;
    startingPoint.value -= 1;
}

function scrollHandler(e) {
    let deltaY = e.deltaY;

    if (deltaY < 0) {
        console.log('Scrolling Up');
        console.log('starting point: ' + startingPoint.value);
        subtraction();
        return;
    }
    if (deltaY > 0) {
        addition();
        return;
    }
}

onMounted(async () => {
    data.value = await useFetch(new Date().toISOString());
    window.addEventListener('wheel', scrollHandler);
});

onUnmounted(() => {
    window.removeEventListener('wheel', scrollHandler);
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
                    index,
                    orbit.visible
                )}px`,
                width: `${calculateOrbitRadius(
                    screenWidth * 0.8,
                    data.length,
                    index,
                    orbit.visible
                )}px`,
            }"
            v-if="data.length !== 0"
            v-for="(orbit, index) in modifyData(data)"
            :key="orbit.contact_date"
        >
            <div class="orbit">
                <div
                    v-if="orbit.array !== 0"
                    v-for="(avatarItem, avatarIdx) in handleDuplicateIds(
                        orbit.array
                    ).slice(0, 12)"
                    :key="avatarItem?.id"
                    class="avatar-container"
                    :class="{
                        'hide-orbit': !orbit.visible,
                        'show-orbit': orbit.visible,
                    }"
                    :style="{
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
    transition: all 0.3s ease-in;
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
    transition: all 0.3s ease-in;
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
    transition: all 0.3s ease-in;
}
.avatar-info {
    position: absolute;
}
.disable-pointer-events {
    pointer-events: 'none';
}

.hide-orbit > *,
.hide-orbit .avatar {
    visibility: hidden;
    scale: 0;
    opacity: 0;
    /* transition: all 0.3s ease-in; */
}

.show-orbit > *,
.show-orbit .avatar {
    visibility: visible;
    scale: 1;
    opacity: 1;
}
</style>
