<template>
    <slot />
</template>

<script setup lang="ts">
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);
const timer = ref<any>(null);
const updatedTime = ref('0:00');

function startCounter() {
    if (seconds.value === 59) {
        seconds.value = 0;
        minutes.value = minutes.value + 1;
        seconds.value--;
    }
    if (minutes.value === 60) {
        minutes.value = 0;
        hours.value = hours.value + 1;
    }
    seconds.value++;

    let minutesCount: string | number = minutes.value;
    let secondsCount = seconds.value < 10 ? '0' + seconds.value : seconds.value;
    const hoursCount = hours.value > 0 ? hours.value + ':' : '';

    if (hoursCount) {
        minutesCount = minutesCount < 10 ? '0' + minutesCount : minutesCount;
        secondsCount =
            (typeof secondsCount === 'string' ? parseInt(secondsCount) : secondsCount) < 10 ? '0' + secondsCount : secondsCount;

        if (minutesCount === 0) {
            minutesCount = '00';
        }
    }

    updatedTime.value = hoursCount + minutesCount + ':' + secondsCount;
}

function start() {
    timer.value = setInterval(() => startCounter(), 1000);
}

function stop() {
    clearInterval(timer.value);
    const output = updatedTime.value;
    hours.value = 0;
    minutes.value = 0;
    seconds.value = 0;
    updatedTime.value = '0:00';
    return output;
}

defineExpose({ start, stop, updatedTime });
</script>
