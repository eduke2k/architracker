<template>
  <main :style='mainStyles' class='tracker-view'>
    <div class='loading' v-if='store.status === AppStatus.PENDING'>
      <VueSpinnerGrid size='48' color='#2f6b83' />
    </div>
    <div class='error' v-else-if='store.status === AppStatus.ERROR'>
      {{ store.exitMessage }}
    </div>
    <div class='components' v-else>
      <div class='logger-list' @click="addDebugMessage">
        <MessageList />
        <!-- <TrackerLogItem v-for='(entry, index) in messageQueue' :key='index' :item='entry' /> -->
      </div>
      <div class='progress-bars'>
        <TrackerProgress slotName="AnnoyingEdu" v-if='store.ownLocationProgress' :label='store.game'
          :total='store.ownLocationProgress.total' :current='store.ownLocationProgress.unlocked' />
        <Carousel v-bind="carouselConfig">
          <Slide v-for="(p, i) in store.allOtherLocationProgress" :key="i">
            <TrackerProgress :slotName="p.slot" :label='p.label' :total='p.total' :current='p.unlocked' />
          </Slide>
        </Carousel>
        <TrackerProgress v-if='store.allLocationsProgress' label='Total' :total='store.allLocationsProgress.total'
          :current='store.allLocationsProgress.unlocked' />
      </div>
    </div>
  </main>
</template>

<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Client } from 'archipelago.js';
import { useRoute } from 'vue-router';
import { AppStatus, useArchiStore } from '@/store/archi';
import { VueSpinnerGrid } from 'vue3-spinners';
import TrackerProgress from '@/components/TrackerProgress.vue';
import MessageList from '@/components/MessageList.vue';
import { recordEntries } from '@/functions';
import { Carousel, Slide, type CarouselConfig } from 'vue3-carousel'

const carouselConfig: Partial<CarouselConfig> = {
  itemsToShow: 1,
  wrapAround: true,
  autoplay: 10000,
}

// const log = ref<string[]>([]);
const store = useArchiStore();
const w = ref(1920);
const h = ref(1080);
const host = ref('');
const slotName = ref('');
const room = ref('');
const client = new Client();
const route = useRoute();

const mainStyles = computed(() => ({
  width: `${w.value}px`,
  height: `${h.value}px`,
}));

onUnmounted(() => {
  client.socket.disconnect()
});

const addDebugMessage = () => {
  store.handlePrintJSON({
    'cmd': 'PrintJSON',
    'data': [
      {
        'text': '1',
        'type': 'player_id'
      },
      {
        'text': ' sent '
      },
      {
        'text': '6242624031',
        'player': 6,
        'flags': 1,
        'type': 'item_id'
      },
      {
        'text': ' to '
      },
      {
        'text': '6',
        'type': 'player_id'
      },
      {
        'text': ' ('
      },
      {
        'text': '3166266',
        'player': 1,
        'type': 'location_id'
      },
      {
        'text': ')'
      }
    ],
    'type': 'ItemSend',
    'receiving': 6,
    'item': {
      'item': 6242624031,
      'location': 3166266,
      'player': 1,
      'flags': 1,
    }
  })
}

onMounted(async () => {
  w.value = typeof route.query.w === 'string' ? parseInt(route.query.w) : 1920;
  h.value = typeof route.query.h === 'string' ? parseInt(route.query.h) : 1080;
  host.value = typeof route.query.host === 'string' ? route.query.host : 'archipelago.gg';
  slotName.value = typeof route.query.slot === 'string' ? route.query.slot : '';
  room.value = typeof route.query.room === 'string' ? route.query.room : '';

  if (!slotName.value || !room.value) {
    store.status = AppStatus.ERROR;
    store.exitMessage = `Missing server OR slot name OR room id in URL parameters ${slotName.value} ${room.value}`;
    return;
  }

  await store.fetchRoomStatus(room.value);
  const staticTrackerResponse = await store.fetchStaticTracker();
  const trackerResponse = await store.fetchTracker();

  client.socket.on('dataPackage', store.handleDataPackage);
  client.socket.on('printJSON', store.handlePrintJSON);

  client.login(`${host.value}:${store.port}`, slotName.value)
    .then(() => {
      console.log('Connected to the Archipelago server!')
      store.slot = slotName.value;
      store.game = client.game;

      // store.locationIds = client.room.allLocations;
      // store.checkedLocationIds = client.room.checkedLocations;
      store.slots = client.players.slots
      store.slotId = recordEntries(store.slots).find(x => x[1].name === store.slot)?.[0] ?? -1;

      store.initProgress(staticTrackerResponse, trackerResponse);
      store.status = AppStatus.READY;
    })
    .catch(console.error);
});

</script>

<style lang='scss'>
.tracker-view {
  position: relative;
  overflow: hidden;
  background-size: contain;

  .components {
    .progress-bars {
      position: absolute;
      left: 68px;
      top: 140px;
      width: 384px;

      >* {
        margin-bottom: 12px;
      }
    }
  }

  .loading {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .error {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .debug {
    position: absolute;
    bottom: 0;
    display: flex;

    >* {
      margin-right: 16px;
      background-color: white;
      padding: 16px;
    }
  }

  .logger-list {
    width: 300px;
    height: 100%;
    position: absolute;
    right: 0;
    bottom: 0;
  }
}
</style>
