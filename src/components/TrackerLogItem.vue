<template>
  <div :class="['tracker-log-item', state, isRelevant ? 'relevant' : 'irrelevant']" ref="parent" :style="itemStyles">
    <div v-html="itemText" ref="child" class="px-2 py-2"></div>
  </div>
</template>

<script setup lang="ts">
import { useArchiStore } from '@/store/archi';
import type { JSONMessagePart } from 'archipelago.js';
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue';

export type TrackerLogItemPayload = {
  data: JSONMessagePart[];
  id: string;
}

type ItemState = 'init' | 'revealing' | 'done' | 'hiding';
const state = ref<ItemState>('init');
const calculatedHeight = ref(0);
const targetHeight = ref(0);
const store = useArchiStore();

const emit = defineEmits(['removed'])

const props = defineProps<{
  item: TrackerLogItemPayload;
}>();

const parentElement = useTemplateRef<HTMLElement>('parent');
// const childElement = useTemplateRef<HTMLElement>('child');

const itemText = computed(() => {
  return store.messagePartsToMessage(props.item.data);
  // return props.item.map(part => part.text).join('');
});

const itemStyles = computed(() => {
  switch (state.value) {
    case 'init':
      return '';
    default:
      return `height: ${targetHeight.value}px;`;
  }
});

const isRelevant = computed(() => {
  return props.item.data.some(a => a.type === 'player_id' && a.text === store.slotId.toString());
});

onMounted(async () => {
  setTimeout(() => {
    state.value = 'hiding'
    setTimeout(() => {
      emit('removed', props.item.id);
    }, 300);
  }, 7000);

  setTimeout(() => {
    calculatedHeight.value = parentElement.value?.offsetHeight || 50;

    nextTick(() => {
      state.value = 'revealing';

      setTimeout(() => {
        targetHeight.value = calculatedHeight.value;
      }, 1);

      setTimeout(() => {
        state.value = 'done';
      }, 500);
    });

  }, 500);
});

</script>

<style lang="scss">
.tracker-log-item {

  width: 100%;
  // transition: all 0.3s ease-out;
  overflow: hidden;
  box-sizing: border-box;

  >div {
    border-radius: 5px;
    color: white;
    font-size: 18px;

    span {
      color: white;

      &.name-0 {
        color: brown;
      }

      &.name-1 {
        color: rgb(165, 42, 134);
      }

      &.item {
        color: aqua;
      }

      &.location {
        color: red;
      }
    }
  }

  &.relevant {
    >div {
      background-color: #045742;
      color: #c7ffea;
    }
  }

  &.irrelevant {
    >div {
      background-color: #2c2c2c;
      color: #b1b1b1;
    }
  }

  &.init {
    position: absolute;
    opacity: 0;
    transform: translateX(calc(100% + 16px));
  }

  &.hiding {
    opacity: 0;
    transform: translateX(calc(100% + 16px));
  }

  &.revealing {
    opacity: 1;
    position: relative;
    height: 0px;
    transform: translateX(calc(100% + 16px));
  }

  &.done {
    opacity: 1;
    position: relative;
    transform: translateX(0%);
  }
}
</style>
