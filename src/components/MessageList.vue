<template>
  <div class="message-list" ref="messageList">
    <!-- <TrackerLogItem v-for="entry in queue" :key="entry.id" :item="entry" @read="handleReadyHTML(id)" @removed="handleRemoved" /> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import type { JSONMessagePart } from 'archipelago.js';
import { useArchiStore } from '@/store/archi';
import md5 from 'md5';

const store = useArchiStore();
// const queue = ref<TrackerLogItemPayload[]>([]);
const messageList = ref<HTMLElement>();
const logItems = ref<LogItem[]>([]);

type LogItemState = 'init' | 'revealing' | 'done' | 'hiding';
const PADDING = 16;

class LogItem {
  public id: string;
  public x = 0;
  public y = 0;
  public targetY = 0;
  public width = 0;
  public height = 0;
  public node: HTMLElement;
  public above?: LogItem;
  public messageParts: JSONMessagePart[] = [];
  public state: LogItemState = 'init';
  public interval = 0;
  public timeout = 0;
  public handleRemove: (logItem: LogItem) => void

  public constructor(messageParts: JSONMessagePart[], handleRemove: (logItem: LogItem) => void, above?: LogItem) {
    this.id = `logItem-${md5(messageParts.join('') + Date.now())}`;
    this.above = above;
    this.messageParts = messageParts;
    this.node = this.generateElement();
    this.handleRemove = handleRemove;
    this.interval = setInterval(() => {
      if (this.node.offsetHeight) {
        this.height = this.node.offsetHeight;
        this.width = this.node.offsetWidth;
        this.node.style.opacity = '1';
        this.node.style.position = 'absolute';
        this.y = -this.height;
        this.targetY = 0;
        this.node.style.bottom = `${(this.y).toString()}px`;
        clearInterval(this.interval);
        this.startSimulation()
      }
    }, 100);
  }

  public startSimulation(): void {
    this.interval = setInterval(() => {
      if (this.above) {
        this.above.targetY = this.y + this.height + PADDING;
      }
      const delta = (this.targetY - this.y) / 1.5;
      this.y = this.y + delta;
      this.node.style.transform = `translateY(${(-this.height - this.y).toString()}px)`;

      if ((this.y) > window.outerHeight) {
        this.kill();
      }
    }, 60)
  }

  public kill(): void {
    clearInterval(this.interval);

    this.handleRemove(this);
  }

  public isRelevant() {
    return this.messageParts.some(a => a.type === 'player_id' && a.text === store.slotId.toString());
  };

  public getItemStyles() {
    switch (this.state) {
      case 'init':
        return '';
      default:
        return `height: ${this.state}px;`;
    }
  };

  public generateElement() {
    const element = document.createElement('div');
    element.id = this.id;
    element.classList.add('tracker-log-item');
    element.classList.add(this.isRelevant() ? 'relevant' : 'irrelevant');
    element.style.opacity = '0';

    const childElement = document.createElement('div');
    childElement.innerHTML = store.messagePartsToMessage(this.messageParts);
    element.append(childElement);

    return element;
  }
}

onMounted(() => {
  console.log('mounted');
  store.signal.on('message', handleNewMessage);
});

onUnmounted(() => {
  console.log('unmounted');
})

function handleNewMessage(message: JSONMessagePart[]) {
  const newItem = new LogItem(message, handleRemoved, logItems.value[logItems.value.length - 1]);
  messageList.value?.append(newItem.node);
  logItems.value.push(newItem);
  // queue.value.push({ data: message, id: md5(message.join('') + Date.now()) });
}

function handleRemoved(logItem: LogItem): void {
  const index = logItems.value.findIndex(q => q.id === logItem.id);
  if (index > -1) {
    const below = logItems.value[index + 1];
    if (below) below.above = undefined;
    logItems.value.splice(index, 1);
    logItem.node.remove();
  }
}

</script>

<style lang="scss">
.message-list {
  position: relative;
  width: 100%;
  height: 100%;

  .tracker-log-item {
    width: 100%;
    transition: all 0.3s ease-out;
    overflow: hidden;
    box-sizing: border-box;

    >div {
      border-radius: 5px;
      color: white;
      font-size: 18px;
      line-height: 130%;
      padding: 12px;

      .names {
        font-size: 14px;
        display: flex;
        margin-bottom: 4px;

        >span {
          flex: 1 1 0px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

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

}
</style>
