<template>
  <div class="tracker-progress">
    <div class="labels-container py-2">
      <div class="slot" v-if="props.slotName">
        {{ props.slotName }}
      </div>
      <div class="labels">
        <div class="name">{{ props.label }}</div>
        <div class="current">{{ props.current }}</div>
        <div class="of">/</div>
        <div class="total">{{ props.total }}</div>
        <div class="percentage">({{ percentageLabel }}%)</div>
      </div>
    </div>
    <div class="border"></div>
    <div class="bar" :style="barStyles"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

const props = defineProps<{
  label: string;
  total: number;
  slotName?: string;
  current: number;
}>();

const percentage = computed(() => {
  if (props.current && props.total > 0) {
    return props.current / props.total;
  } else {
    return 0;
  }
})

const percentageLabel = computed(() => {
  return (percentage.value * 100).toFixed(0);
});

const barStyles = computed(() => {
  return `width: ${percentage.value * 100}%`;
})

onMounted(() => {

});

</script>

<style lang="scss">
.tracker-progress {
  width: 100%;
  min-height: 35px;
  box-sizing: 8px;
  position: relative;
  display: flex;
  overflow: hidden;
  border-radius: 8px;
  background-color: rgba(black, .8);

  .border {
    width: 100%;
    height: 100%;
    position: absolute;
    border: 2px solid white !important;
    box-sizing: border-box;
    z-index: 3;
    border-radius: 8px;
    top: 0;
  }

  .bar {
    height: 100%;
    background-color: rgb(45, 141, 96);
    position: absolute;
    top: 0;
    z-index: 0;
  }

  .labels-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0px 8px;
    align-items: flex-start;

    .slot {
      color: white;
      font-size: 14px;
      z-index: 1;
      background-color: rgb(26, 52, 124);
      padding: 0 3px;
      border-radius: 4px;
      margin-bottom: 2px;
    }

    .labels {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      font-size: 18px;
      color: white;
      display: flex;
      align-items: center;
      box-sizing: border-box;

      .name {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .of {
        margin-left: 4px;
        margin-right: 4px;
        opacity: .7;
      }

      .total {
        margin-right: 4px;
        color: rgb(255, 64, 230);
      }

      .current {
        color: rgb(214, 255, 64);
      }
    }

  }
}
</style>
