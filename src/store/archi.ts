import { findKeyByValue } from '@/functions'
import { SignalSystem } from '@/models/SignalSystem'
import type {
  DataPackagePacket,
  GamePackage,
  JSONMessagePart,
  NetworkItem,
  NetworkSlot,
  PrintJSONPacket,
} from 'archipelago.js'
import axios from 'axios'
import { defineStore } from 'pinia'

type SlotName = string
type GameName = string
type TrackerId = string

type RoomStatus = {
  last_port: 49895
  players: [SlotName, GameName][]
  tracker: TrackerId
}

type StaticTrackerResponse = {
  datapackage: Record<GameName, { checksum: string; version: number }>
  groups: []
  player_game: { game: GameName; player: number; team: number }[]
  player_locations_total: { player: number; team: number; total_locations: number }[]
}

type TrackerResponse = {
  hints: { hints: number[]; player: number; team: number }[]
  player_checks_done: { locations: number[]; player: number; team: number }[]
  player_items_received: { items: number[]; player: number; team: number }[]
  total_checks_done: { checks_done: number; team: number }[]
}

export enum AppStatus {
  PENDING,
  READY,
  ERROR,
}

type ArchiStoreSginal = {
  message: JSONMessagePart[]
}

type ArchiStoreState = {
  w: number
  h: number
  status: AppStatus
  exitMessage: string
  port: number
  host: string
  trackerId: string
  slot: string
  slotId: number
  game: string
  slots: Record<number, NetworkSlot>
  signal: SignalSystem<ArchiStoreSginal>
  locationIds: Record<GameName, number[]>
  locationNames: Record<GameName, Record<string, number>>
  itemIds: Record<GameName, number[]>
  itemNames: Record<GameName, Record<string, number>>
  slotProgress: Record<
    number,
    {
      slotName: SlotName
      game: GameName
      totalLocations: number
      checkedLocations: number[]
    }
  >
  games: Record<string, GamePackage>
  printJSON: JSONMessagePart[][]
}

export type Progress = {
  label: string
  slot?: string
  total: number
  unlocked: number
  percentage: number
}

export const useArchiStore = defineStore('archi', {
  state: (): ArchiStoreState => ({
    w: 0,
    h: 0,
    status: AppStatus.PENDING,
    exitMessage: '',
    trackerId: '',
    host: 'archipelago.gg',
    port: 0,
    slot: '',
    slotId: -1,
    game: '',
    slots: [],
    locationIds: {},
    locationNames: {},
    itemIds: {},
    itemNames: {},
    slotProgress: {},
    games: {},
    printJSON: [],
    signal: new SignalSystem<ArchiStoreSginal>(),
  }),
  getters: {
    ownLocationProgress(): Progress | null {
      const progress = Object.values(this.slotProgress).find((s) => s.slotName === this.slot)
      if (!progress) return null
      return {
        label: progress.game,
        total: progress.totalLocations,
        unlocked: progress.checkedLocations.length,
        percentage: progress.checkedLocations.length / progress.totalLocations,
      }
    },
    allOtherLocationProgress(): Progress[] {
      const arr: Progress[] = []

      Object.values(this.slotProgress)
        .filter((p) => p.slotName !== this.slot)
        .forEach((progress) => {
          arr.push({
            label: progress.game,
            slot: progress.slotName,
            total: progress.totalLocations,
            unlocked: progress.checkedLocations.length,
            percentage: progress.checkedLocations.length / progress.totalLocations,
          })
        })

      return arr
    },
    allLocationsProgress(): Progress {
      const total = Object.values(this.slotProgress).reduce(
        (sum, slot) => sum + slot.totalLocations,
        0,
      )
      const unlocked = Object.values(this.slotProgress).reduce(
        (sum, slot) => sum + slot.checkedLocations.length,
        0,
      )
      return {
        label: 'Total',
        total,
        unlocked,
        percentage: unlocked / total,
      }
    },
  },
  actions: {
    initProgress(
      staticTrackerResponse: StaticTrackerResponse,
      trackerResponse: TrackerResponse,
    ): void {
      staticTrackerResponse.player_locations_total.forEach((a) => {
        this.slotProgress[a.player] = {
          checkedLocations:
            trackerResponse.player_checks_done.find((p) => p.player === a.player)?.locations ?? [],
          game: this.slots[a.player].game ?? 'No game found',
          slotName: this.slots[a.player].name ?? 'No name found',
          totalLocations: a.total_locations,
        }
      })
    },
    async fetchRoomStatus(roomId: string): Promise<void> {
      return new Promise((resolve, reject) => {
        axios
          .get<RoomStatus>(`https://${this.host}/api/room_status/${roomId}`)
          .then((r) => {
            console.log(r.data)
            this.port = r.data.last_port
            this.trackerId = r.data.tracker
            resolve()
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    async fetchStaticTracker(): Promise<StaticTrackerResponse> {
      return new Promise((resolve, reject) => {
        if (!this.trackerId) {
          reject(new Error('No tracker id available'))
        }

        axios
          .get<StaticTrackerResponse>(`https://${this.host}/api/static_tracker/${this.trackerId}`)
          .then((r) => {
            resolve(r.data)
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    async fetchTracker(): Promise<TrackerResponse> {
      return new Promise((resolve, reject) => {
        if (!this.trackerId) {
          reject(new Error('No tracker id available'))
        }

        axios
          .get<TrackerResponse>(`https://${this.host}/api/tracker/${this.trackerId}`)
          .then((r) => {
            resolve(r.data)
          })
          .catch((e) => {
            reject(e)
          })
      })
    },
    handleDataPackage(packet: DataPackagePacket): void {
      this.games = { ...this.games, ...packet.data.games }

      for (const [game, data] of Object.entries(packet.data.games)) {
        this.itemIds[game] = Object.values(data.item_name_to_id)
        this.locationIds[game] = Object.values(data.location_name_to_id)
        this.itemNames[game] = data.item_name_to_id
        this.locationNames[game] = data.location_name_to_id
      }
    },
    addFoundItem(item: NetworkItem): void {
      const progress = this.slotProgress[item.player]
      if (!progress) return
      progress.checkedLocations.push(item.location)
    },
    handlePrintJSON(packet: PrintJSONPacket): void {
      switch (packet.type) {
        case 'ItemSend':
          this.addFoundItem(packet.item)
          break
      }

      this.printJSON.push(packet.data)
      this.signal.emit('message', packet.data)
    },
    messagePartsToMessage(parts: JSONMessagePart[]): string {
      const strings: string[] = []

      const names: string[] = []
      let itemName = ''
      // let locationName = ''

      parts.forEach((p) => {
        switch (p.type) {
          case undefined:
            strings.push(p.text)
            break
          case 'player_id':
            names.push(this.slots[parseInt(p.text)]?.name ?? '???')
            break
          case 'item_id':
            itemName =
              findKeyByValue(
                this.games[this.slots[p.player].game].item_name_to_id,
                parseInt(p.text),
              ) ?? '???'
            break
          // case 'location_id':
          //   locationName =
          //     findKeyByValue(
          //       this.games[this.slots[p.player].game].location_name_to_id,
          //       parseInt(p.text),
          //     ) ?? '???'
          //   break
        }
      })

      if (strings.length === 1) {
        return strings.join('')
      }

      return `<div class="names"><span>${names[0]}</span><span class="arrow"></span><span>${names[1]}</span></div><div class="item-name">${itemName}</div>`
    },
  },
})
