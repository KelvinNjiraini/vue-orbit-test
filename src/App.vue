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
const generalViewAngle = 160;
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
const radius = ref(screenWidth.value * 0.8);
const calculatedRadius = ref(0);

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
    arr = arr.map((el, idx) => {
        return {
            ...el,
            isOuterMost: idx === 0 ? true : false,
            visible: idx < 7 ? true : false,
        };
    });
    modifiedArr.value = arr;
    return modifiedArr.value;
}

function handleDuplicateIds(originalArr, idx) {
    const uniqueArr = originalArr.filter(
        (obj, index, self) =>
            index === self.findIndex((el) => el.name === obj['name'])
    );

    return uniqueArr;
}

function handleAvatarEnter(event, elementId) {
    // if (event.target.id !== String(elementId)) return;
    if (event.type === 'mouseenter' && event.target.id === String(elementId)) {
        hoveredId.value = event.target.id;
        // showCard.value = true;

        const rect = event.target.getBoundingClientRect();
        let xPosition;
        let yPosition;
        let topPosition = rect.top;
        let rightPosition = rect.right;

        let distanceFromBottom = window.innerHeight - topPosition;
        let distanceFromRight = window.innerWidth - rightPosition;

        if (distanceFromBottom < 350) {
            // minus avatar radius to cover the avatar as well
            yPosition = window.innerHeight - 330;
        } else {
            yPosition = rect.top + window.scrollY;
        }

        if (distanceFromRight < 580) {
            // 580 plus the avatar diameter to bring it a bit more to the left and cover it
            xPosition = window.innerWidth - 640;
        } else {
            xPosition = rect.left + window.scrollX;
        }

        hoveredPosition.value = {
            x: xPosition,
            y: yPosition,
        };

        return;
    }
}

function handleCursorOnCard(cursorOnPopover, event) {
    if (!cursorOnPopover && isCursorOnCard.value) {
        setTimeout(() => {
            // Reset position
            hoveredId.value = null;
            const rect = event.target.getBoundingClientRect();
            hoveredPosition.value = { x: rect.left, y: rect.top };
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
    const baseAngle = 180 / dataLength;
    return baseAngle * (currentIndex + 1);
}

function addition() {
    //console.log(
    //  `Data length: ${data.value.length}, current Count: ${
    //    maxOrbitCount + startingPoint.value
    //}`
    //);
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
                    radius,
                    data.length,
                    index,
                    orbit.visible
                )}px`,
                width: `${calculateOrbitRadius(
                    radius,
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
                        orbit.array,
                        index
                    )"
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
                                rotate: `-${handleAvatarAngle(
                                    orbit.array.length,
                                    avatarIdx
                                )}deg`,
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
    transition: all 0.4s ease-in;
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
    transition: all 0.4s ease-in;
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
    transition: all 0.4s ease-in;
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
    pointer-events: none;
    /* transition: all 0.4s ease-in; */
}

.show-orbit > *,
.show-orbit .avatar {
    visibility: visible;
    scale: 1;
    opacity: 1;
    pointer-events: auto;
}
</style>
