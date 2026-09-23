<template>
  <!-- <pre>{{ yList }}</pre> -->
  <div class="message-list" ref="messageList">
    <TrackerLogItem v-for="(entry, index) in queue" :key="entry.id" :item="entry" :index="index"
      :minY="yList[index + 1]" @yChanged="(y: number) => handleYChanged(y, index)"
      @removed="() => handleRemoved(index)" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import type { JSONMessagePart } from 'archipelago.js';
import { useArchiStore } from '@/store/archi';
import md5 from 'md5';
import TrackerLogItem, { type TrackerLogItemPayload } from './TrackerLogItem.vue';

const store = useArchiStore();
const queue = ref<TrackerLogItemPayload[]>([]);
const messageList = ref<HTMLElement>();
const yList = ref<number[]>([]);

onMounted(() => {
  store.signal.on('message', handleNewMessage);
});

onUnmounted(() => {
  console.log('unmounted');
})

const handleYChanged = (y: number, index: number): void => {
  yList.value[index] = y;
}

function handleNewMessage(message: JSONMessagePart[]) {
  const messageData = store.parseMessageParts(message);

  if (store.messageType === 'checks' && !messageData.itemName) return;
  if (store.messageType === 'affected' && !messageData.names?.some(n => n === store.slot)) return;

  const id = `logItem-${md5(message.join('') + Date.now())}`;
  queue.value.push({ id, data: messageData });
}

function handleRemoved(index: number): void {
  queue.value.splice(index, 1);
  yList.value.splice(index, 1);
}

</script>

<style lang="scss">
.message-list {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
