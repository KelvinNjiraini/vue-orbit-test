<script setup>
import { computed, ref } from 'vue';
const emits = defineEmits(['cardHoverOn', 'cardHoverOff']);
const props = defineProps([
    // 'showCard',
    'metaData',
    'id',
    'hoveredId',
    'contactDate',
    'customStyles',
]);
// const showCard = computed(() => props.showCard);
const metaData = computed(() => props.metaData);
const id = computed(() => props.id);
const hoveredId = computed(() => props.hoveredId);
const contactDate = computed(() => props.contactDate);
const customStyles = computed(() => props.customStyles);
const cursorOnPopover = ref(false);
const showMore = ref(false);

const differenceInMilliseconds = ref(null);
const differenceInSeconds = ref(null);
const differenceInMinutes = ref(null);
const differenceInHours = ref(null);
const differenceInDays = ref(null);

const now = new Date();
const receivedDate = computed(() => {
    return metaData?.value.created_at;
});

differenceInMilliseconds.value = now - receivedDate.value;
differenceInSeconds.value = Math.floor(differenceInMilliseconds.value / 1000);
differenceInMinutes.value = Math.floor(differenceInSeconds.value / 60);
differenceInHours.value = Math.floor(differenceInMinutes.value / 60);
differenceInDays.value = Math.floor(differenceInHours.value / 24);

const durationAgo = computed(() => {
    if (differenceInHours.value > 24)
        return `${differenceInDays.value} day(s) ago`;
    if (differenceInMinutes.value > 60)
        return `${differenceInHours.value} hour(s) ago`;
    if (differenceInSeconds.value > 60)
        return `${differenceInMinutes.value} minutes(s) ago`;
    if (differenceInMilliseconds.value > 1000)
        return `${differenceInSeconds} seconds ago`;
});

function onCursorEnter(event) {
    cursorOnPopover.value = true;
    // console.log(event);
    emits('cardHoverOn', cursorOnPopover.value, event);
}

function onCursorLeave(event) {
    cursorOnPopover.value = false;
    emits('cardHoverOff', cursorOnPopover.value, event);
}
</script>

<template>
    <!-- main card container -->
    <teleport to="body">
        <div
            :style="{
                ...customStyles,
                position: 'absolute',
                zIndex: 200,
                pointerEvents: 'none',
            }"
            @mouseenter="($event) => onCursorEnter($event)"
            @mouseleave="($event) => onCursorLeave($event)"
        >
            <div class="activity" :id="id">
                <!-- activity-header -->
                <transition mode="out-in" name="header">
                    <div
                        class="activity__header"
                        v-if="Number(hoveredId) === id"
                    >
                        <div class="activity__img">
                            <img
                                :src="metaData.img"
                                :alt="`${metaData.name} img`"
                            />
                        </div>
                        <div class="bio-section">
                            <h4 class="bio-section__name">
                                {{ metaData.name }}
                            </h4>
                            <p class="bio-section__position">
                                {{ metaData.position }}
                            </p>
                            <p class="bio-section__location">
                                {{ metaData.city }}
                            </p>
                            <div class="bio-section__reactions">
                                <div class="bio-section__connects">
                                    <img
                                        src="/png/avatar-4.png"
                                        alt="avatar 4"
                                        class="bio-section__connection"
                                    />
                                    <img
                                        src="/png/avatar-1.png"
                                        alt="avatar 1"
                                        class="bio-section__connection"
                                    />
                                    <img
                                        src="/png/avatar-2.png"
                                        alt="avatar 2"
                                        class="bio-section__connection"
                                    />
                                    <img
                                        src="/png/avatar-3.png"
                                        alt="avatar 3"
                                        class="bio-section__connection"
                                    />
                                </div>
                                <p class="bio-section__mutuals">
                                    Peter Swage, John Eremic, and 281 other
                                    mutual connections
                                </p>
                            </div>
                        </div>
                    </div>
                </transition>
                <!-- activity-info -->
                <transition mode="out-in" name="info">
                    <div
                        class="activity__info-container"
                        v-if="Number(hoveredId) === id"
                    >
                        <div class="activity__info">
                            <div class="activity__info__action">
                                <img
                                    src="/svg/envelope.svg"
                                    alt="envelope svg"
                                />
                                <p>Reply from Emery Wells</p>
                            </div>
                            <div class="info-content">
                                <div class="info-content__date">
                                    <p class="info-content__time">
                                        {{
                                            new Date(contactDate).toUTCString()
                                        }}
                                    </p>
                                    <p class="info-content__time">
                                        {{ durationAgo }}
                                    </p>
                                </div>
                                <h5 class="message-title">
                                    {{
                                        metaData._orbits_last_message
                                            .message_head
                                    }}
                                </h5>
                                <p class="message-content">
                                    {{
                                        showMore
                                            ? metaData._orbits_last_message
                                                  .message
                                            : `${metaData._orbits_last_message.message
                                                  .split(' ')
                                                  .slice(0, 10)
                                                  .join(' ')}...`
                                    }}
                                </p>
                                <button @click="showMore = !showMore">
                                    <span>
                                        {{ showMore ? 'Less' : 'More' }}
                                    </span>
                                    <svg
                                        width="24"
                                        height="25"
                                        viewBox="0 0 24 25"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        :class="showMore ? '' : 'showMoreSvg'"
                                    >
                                        <path
                                            d="M18 15.5732L12 9.57324L6 15.5732"
                                            stroke="white"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
    </teleport>
</template>
<style scoped>
.activity {
    position: relative;
    border-radius: 10px;
    width: 502px;
    z-index: 200;
}

.activity > * {
    pointer-events: auto;
}
.activity::before {
    content: '';
    /* background: linear-gradient(to bottom, var(--light-gray), var(--dark-gray)); */
    border-radius: 10px;
    position: absolute;
    z-index: -1;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    margin: -1px;
}
.activity__header {
    background: var(--background-color);
    display: flex;
    align-items: center;
    color: #ffffff;
    padding: 10px;
    /* border-radius: 12px; */
    position: relative;
    /* pointer-events: auto; */
}
.activity__header::before {
    content: '';
    background: linear-gradient(to bottom, var(--light-gray), var(--dark-gray));
    border-radius: 15px;
    position: absolute;
    z-index: -1;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    margin: -1px;
}
.activity__img {
    margin-right: 15px;
}
.activity__img img {
    height: 100px;
    width: 100px;
    object-fit: cover;
    border-radius: 50%;
}
.bio-section__name {
    font-weight: 700;
    font-size: 16px;
    line-height: 19.36px;
    margin-bottom: 5px;
}
.bio-section__reactions {
    display: flex;
    align-items: center;
}

.bio-section__position,
.bio-section__location {
    line-height: 14.52px;
    font-size: 12px;
    margin-bottom: 5px;
}
.bio-section__connects {
    display: flex;
    align-items: center;
}

.bio-section__connection {
    width: 20px;
    height: 20px;
    object-fit: cover;
    border: 1px solid var(--medium-gray);
    border-radius: 50%;
}
.bio-section__mutuals {
    font-size: 12px;
    line-height: 14.52px;
    color: white;
    max-width: 193px;
    margin-left: 6px;
}
.activity__info-container {
    padding: 10px;
    background: var(--background-color-2);
    pointer-events: auto;
}
.info-content {
    color: white;
    padding: 10px;
    background-color: #0a0a0ad9;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
}
.info-content__date {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}
.info-content__time {
    color: var(--medium-gray);
    line-height: 16.94px;
    font-size: 14px;
}
.activity__info__action {
    display: flex;
    align-items: center;
    padding: 10px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    /* background: linear-gradient(to right, #0a0a0ad9, #ffffff0d); */
    background-color: #ffffff0d;
}
.activity__info__action p {
    color: white;
    margin-left: 10px;
}
.message-title {
    font-weight: 700;
    line-height: 19.36px;
    margin-bottom: 5px;
    font-size: 16px;
}
.message-content {
    font-weight: 300;
    line-height: 19.36px;
    margin-bottom: 10px;
    word-wrap: break-word;
}
.info-content button {
    outline: none;
    background: transparent;
    display: flex;
    align-items: center;
    border: none;
    cursor: pointer;
}
.info-content button span {
    line-height: 19.36px;
    display: inline-block;
    color: white;
    margin-right: 5px;
}
.info-content button svg {
    transition: all 0.3s;
}

/* transition styles */
.header-enter-from,
.header-leave-to,
.info-enter-from,
.info-leave-to {
    opacity: 0;
    visibility: hidden;
}
.header-enter-to,
.header-leave-from,
.info-enter-to,
.info-leave-from {
    opacity: 1;
    visibility: visible;
}
.header-enter-active {
    transition: all 200ms ease-in;
}

.info-enter-active {
    transition: all 200ms ease-in;
    transition-delay: 0.2s;
}

.showMoreSvg {
    rotate: 180deg;
}
</style>
