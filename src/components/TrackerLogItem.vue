<template>
  <div :id="item.id"
    :class="['tracker-log-item', state, isRelevant ? 'relevant' : 'irrelevant', ...tagLabels.map(t => t.toLowerCase())]"
    ref="node" :style="style">
    <div class="bg-video">
      <video autoplay loop src="./../assets/trap.webm" v-if="tags.isTrap"></video>
      <video autoplay loop src="./../assets/filler.webm" v-else-if="tags.isFiller"></video>
      <video autoplay loop src="./../assets/useful.webm" v-else-if="tags.isUseful"></video>
      <video autoplay loop src="./../assets/progression.webm" v-else-if="tags.isProgression"></video>
    </div>
    <div class="content">
      <div class="message" v-if="props.item.data?.message">{{ props.item.data.message }}</div>
      <div class="names" v-if="props.item.data?.names?.[0]">
        <span>{{ props.item.data.names[0] }}</span>
        <span class="arrow"></span>
        <span>{{ props.item.data.names[1] ?? props.item.data.names[0] }}</span>
      </div>
      <div class="item-type">
        <span v-for="(tag, index) in tagLabels" :key="index" :class="tag.toLowerCase()">{{ tag }}</span>
      </div>
      <div class="item-name" v-if="props.item.data?.itemName">{{ props.item.data?.itemName }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useArchiStore, type ParsedMessageParts } from '@/store/archi';
import { computed, onMounted, ref, useTemplateRef } from 'vue';

export type TrackerLogItemPayload = {
  data: ParsedMessageParts;
  id: string;
}

const PADDING = 16;

type ItemState = 'init' | 'shown';
const node = useTemplateRef<HTMLElement>('node');
const state = ref<ItemState>('init');
const store = useArchiStore();
// const x = ref(0);
const y = ref(0);
const targetY = ref(0);
const width = ref(0);
const height = ref(0);
const interval = ref(0);
// const timeout = ref(0);
const emit = defineEmits(['removed', 'yChanged'])

const props = defineProps<{
  item: TrackerLogItemPayload;
  index?: number;
  minY?: number;
}>();

const isRelevant = computed(() => {
  return props.item.data.names?.some(a => a === store.slot);
});

const tags = computed(() => {
  return {
    isProgression: props.item.data?.itemFlags !== undefined ? ((props.item.data.itemFlags & 1) !== 0) : false,
    isUseful: props.item.data?.itemFlags !== undefined ? ((props.item.data.itemFlags & 2) !== 0) : false,
    isTrap: props.item.data?.itemFlags !== undefined ? ((props.item.data.itemFlags & 4) !== 0) : false,
    isFiller: props.item.data?.itemFlags !== undefined ? (props.item.data.itemFlags === 0) : false
  }
});

function toTagLabel(value: keyof typeof tags.value): string {
  switch (value) {
    case 'isFiller': return 'Filler';
    case 'isUseful': return 'Useful';
    case 'isTrap': return 'Trap';
    case 'isProgression': return 'Progression';
  }
}

const tagLabels = computed(() => {
  const labels: string[] = [];
  Object.entries(tags.value).forEach(v => {
    if (v[1]) labels.push(toTagLabel(v[0] as keyof typeof tags.value));
  });
  return labels;
})

onMounted(() => {
  interval.value = setInterval(() => {
    if (node.value?.offsetHeight) {
      height.value = node.value.offsetHeight;
      width.value = node.value.offsetWidth;
      node.value.style.opacity = '1';
      node.value.style.position = 'absolute';
      y.value = -height.value;
      targetY.value = 0;
      clearInterval(interval.value);
      state.value = 'shown';
      startSimulation()
    }
  }, 100);
});

const startSimulation = () => {
  interval.value = setInterval(() => {

    if (props.minY) {
      targetY.value = props.minY + PADDING;
    }

    const delta = (targetY.value - y.value) / 1.5;
    y.value = y.value + delta;
    emit('yChanged', y.value + height.value);

    if ((y.value + height.value) > store.h) {
      kill();
    }
  }, 60)
}

const kill = () => {
  emit('removed');
  clearInterval(interval.value);
  console.log('kill');
}

const style = computed(() => {
  if (state.value === 'init') {
    return '';
  } else if (state.value === 'shown') {
    return `bottom: ${(-height.value).toString()}px; transform: translateY(${(-height.value - y.value).toString()}px)`;
  }

  return '';
});

</script>

<style lang="scss">
@use "sass:color";
$progression: rgb(148, 35, 158);
$useful: rgb(24, 95, 201);
$trap: rgb(228, 25, 18);
$filler: rgb(94, 94, 94);

.tracker-log-item {
  width: 100%;
  transition: all 0.3s ease-out;
  box-sizing: border-box;
  position: absolute;
  opacity: 0;
  border-radius: 5px;
  text-align: center;
  box-shadow: 0px 2px 5px rgba(black, .5);
  overflow: hidden;
  background-color: rgb(68, 68, 68);

  .bg-video {
    position: absolute;
    z-index: 0;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    opacity: .5;
    mix-blend-mode: screen;

    video {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      object-fit: cover;
      object-position: center;
    }
  }

  .content {
    position: relative;
    z-index: 1;
    color: white;
    font-size: 18px;
    padding: 16px;

    .item-type {
      display: flex;
      justify-content: center;

      >span {
        font-size: 12px;
        background-color: black;
        border-radius: 4px;
        padding: 2px 4px;
        text-shadow: 0px 1px 2px rgba(black, .5);

        &.progression {
          background-color: $progression;
          color: color.adjust($progression, $lightness: 75%);
        }

        &.trap {
          background-color: $trap;
          color: color.adjust($trap, $lightness: 75%);
        }

        &.useful {
          background-color: $useful;
          color: color.adjust($useful, $lightness: 75%);
        }

        &.filler {
          background-color: $filler;
          color: color.adjust($filler, $lightness: 75%);
        }
      }
    }

    .names {
      font-size: 14px;
      display: flex;
      margin-bottom: 4px;

      >span {
        flex: 1 1 0px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: white;

        &:first-child {
          text-align: right;
          margin-right: 4px;
        }

        &.arrow {
          background: url(https://img.icons8.com/?size=100&id=11759&format=png&color=FFFFFF);
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
          flex: 0 0 0;
          min-width: 20px;
        }

        &:last-child {
          margin-left: 4px;
          text-align: left;
        }
      }
    }

    .item-name {
      font-size: 24px;
      text-align: center;
    }
  }

  &.relevant {
    // box-shadow: inset 0px 0px 0px 5px red;
    animation: pulse 2s infinite;
  }

  &.trap {
    .content {
      .item-name {
        text-shadow: 0px 0px 10px color.adjust($trap, $lightness: 35%);
      }
    }

    background-color: color.adjust($trap, $lightness: -25%)
  }

  &.progression {
    .content {
      .item-name {
        text-shadow: 0px 0px 10px color.adjust($progression, $lightness: 35%);
      }
    }

    background-color: color.adjust($progression, $lightness: -25%)
  }

  &.useful {
    .content {
      .item-name {
        text-shadow: 0px 0px 10px color.adjust($useful, $lightness: 35%);
      }
    }

    background-color: color.adjust($useful, $lightness: -25%)
  }

  &.filler {
    .content {
      .item-name {
        text-shadow: 0px 0px 10px color.adjust($filler, $lightness: 35%);
      }
    }

    background-color: color.adjust($filler, $lightness: -20%)
  }

  &.init {
    opacity: 0;
  }

  &.shown {
    opacity: 1;
  }
}
</style>
