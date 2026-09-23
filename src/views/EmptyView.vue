<template>
  <main class="pa-4">
    <v-container>
      <v-row>
        <v-col cols="6">
          <h2 class="mt-0 mb-2">Archipelago Widgets</h2>
          <p class="mb-2">Fill out the fields and copy/paste the overlays you want to use into your streaming setup.
            The widgets are initially sized via the browser souce size.
          </p>
          <v-text-field label="Room Id" v-model="roomId" />
          <v-text-field label="Slot Name" @update:model-value="handleSlotChange" />
        </v-col>
        <v-col cols="6"></v-col>
      </v-row>
    </v-container>
    <v-divider></v-divider>
    <v-container v-if="valid">
      <v-row>
        <v-col cols="6">
          <v-card class="card pa-0" :disabled="!valid">
            <div class="pa-4">
              <h2 class="mt-0 mb-2">Progress Widget</h2>
              <p>Shows your own progress, everyone elses progress (as a carousel) and total progress. The recommended
                width is 300px.</p>
            </div>
            <div class="pa-4 iframe-container">
              <iframe :src="progressWidgetUrl" width="100%" height="200px" />
            </div>
            <v-divider />
            <div class="pa-4">
              <v-text-field hide-details label="Browser Source URL" readonly v-model="progressWidgetUrl"
                append-inner-icon="mdi-content-copy" @click:append-inner="() => copy(progressWidgetUrl)" />
            </div>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card class="card" :disabled="!valid">
            <div class="pa-4">
              <h2 class="mt-0 mb-2">Log Widget</h2>
              <p>Shows the archipelago log with fancy visuals. Recommended width is 300px. Use whatever height fits your
                overlay.</p>
              <v-select label="Log filter" item-title="text" item-value="value" v-model="logFilter"
                :items="logFilterItems" />
            </div>
            <div class="pa-4 iframe-container">
              <iframe :src="logWidgetUrl" width="100%" height="250px" />
            </div>
            <v-divider />
            <div class="pa-4">
              <v-text-field hide-details label="Browser Source URL" readonly v-model="logWidgetUrl"
                append-inner-icon="mdi-content-copy" @click:append-inner="() => copy(logWidgetUrl)" />
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { toast } from 'vue3-toastify';
import debounce from 'lodash/debounce';

const route = useRoute();
const roomId = ref('');
const slot = ref('');
const logFilter = ref('checks');
const logFilterItems = [
  { text: 'All logs (checks and chat)', value: 'all' },
  { text: 'Checks only', value: 'checks' },
  { text: 'Only affected checks', value: 'affected' }
];

const copy = async (value: string) => {
  toast('Copied!');
  await navigator.clipboard.writeText(value)
}

const handleSlotChange = debounce((e: string) => {
  console.log('User stopped typing:', e)
  slot.value = e ?? '';
}, 1000)

const valid = computed(() => {
  return roomId.value !== '' && slot.value !== '';
});

const progressWidgetUrl = computed(() => {
  if (!valid.value) return 'Please fill out room id and slot name';
  return `${window.location.origin}${window.location.pathname}tracker/?type=progress&room=${roomId.value}&slot=${slot.value}`;
});

const logWidgetUrl = computed(() => {
  if (!valid.value) return 'Please fill out room id and slot name';
  return `${window.location.origin}${window.location.pathname}tracker/?type=log&room=${roomId.value}&slot=${slot.value}&messageType=${logFilter.value}`;
});

onMounted(() => {
  roomId.value = typeof route.query.roomId === 'string' ? route.query.roomId : '';
})

</script>
<style lang='scss'>
.card {
  p {
    color: #7c7c7c;
  }

  .iframe-container {
    background-color: rgba(black, .2);

    iframe {
      border: 0;
    }
  }
}
</style>
