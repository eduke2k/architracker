import type { JSONMessagePart, NetworkItem } from "archipelago.js";

export type SerializedNetworkItem = {
  readonly class: 'NetworkItem';
	/** The item id of the item. Item ids are in the range of -2^53 to +2^53-1. */
	readonly item: number;
	/** The location id of the location inside the world. Location ids are in the range of -2^53 to +2^53 - 1. */
	readonly location: number;
	/**
	 * The slot id for the player whose world the item was located in, except when inside a {@link LocationInfoPacket},
	 * then it will be the slot id of the player the item belongs to.
	 */
	readonly player: number;
	/** The classification bit flags for this item. See {@link itemsHandlingFlags} for known flags. */
	readonly flags: number;
}

export interface LocationInfoPacket {
  readonly cmd: "LocationInfo";
  /** Contains the list of item(s) in the location(s) scouted. */
  readonly locations: NetworkItem[];
}
/**
 * Sent to clients to broadcast a player has received an item.
 * @see {@link PrintJSONPacket} for all possible `PrintJSON` packet subtypes.
 * @category Network Packets
 */
export interface ItemSendJSONPacket {
  readonly cmd: "PrintJSON";
  /** The {@link PrintJSONPacket} subtype. */
  readonly type: "ItemSend";
  /** All the textual metadata for this packet. */
  readonly data?: JSONMessagePart[];
  /** Destination player's identifier. */
  readonly receiving: number;
  /** Source player's identifier, location identifier, item identifier and item flags. */
  readonly item: SerializedNetworkItem;
}
/**
 * Sent to clients to broadcast a player has received a cheated item (via `!getitem`).
 * @see {@link PrintJSONPacket} for all possible `PrintJSON` packet subtypes.
 * @category Network Packets
 */
export interface ItemCheatJSONPacket {
  readonly cmd: "PrintJSON";
  /** The {@link PrintJSONPacket} subtype. */
  readonly type: "ItemCheat";
  /** All the textual metadata for this packet. */
  readonly data: JSONMessagePart[];
  /** Destination player's identifier. */
  readonly receiving: number;
  /** Source player's identifier, location identifier, item identifier and item flags. */
  readonly item: SerializedNetworkItem;
  /** Team of the triggering player. */
  readonly team: number;
}
/**
 * Sent to relevant clients to broadcast item hint information.
 * @see {@link PrintJSONPacket} for all possible `PrintJSON` packet subtypes.
 * @category Network Packets
 */
export interface HintJSONPacket {
  readonly cmd: "PrintJSON";
  /** The {@link PrintJSONPacket} subtype. */
  readonly type: "Hint";
  /** All the textual metadata for this packet. */
  readonly data: JSONMessagePart[];
  /** Destination player's identifier. */
  readonly receiving: number;
  /** Source player's identifier, location identifier, item identifier and item flags. */
  readonly item: SerializedNetworkItem;
  /** Whether the location hinted for was checked. */
  readonly found: boolean;
}
/**
 * Sent to clients to broadcast a client has connected.
 * @see {@link PrintJSONPacket} for all possible `PrintJSON` packet subtypes.
 * @category Network Packets
 */
export interface JoinJSONPacket {
  readonly cmd: "PrintJSON";
  /** The {@link PrintJSONPacket} subtype. */
  readonly type: "Join";
  /** All the textual metadata for this packet. */
  readonly data: JSONMessagePart[];
  /** Team of the triggering player. */
  readonly team: number;
  /** Slot of the triggering player. */
  readonly slot: number;
  /** Tags of the triggering player. */
  readonly tags: string[];
}
/**
 * Sent to clients to broadcast a client has disconnected.
 * @see {@link PrintJSONPacket} for all possible `PrintJSON` packet subtypes.
 * @category Network Packets
 */
export interface PartJSONPacket {
  readonly cmd: "PrintJSON";
  /** The {@link PrintJSONPacket} subtype. */
  readonly type: "Part";
  /** All the textual metadata for this packet. */
  readonly data: JSONMessagePart[];
  /** Team of the triggering player. */
  readonly team: number;
  /** Slot of the triggering player. */
  readonly slot: number;
}
/**
 * Sent to clients to broadcast a normal chat message.
 * @see {@link PrintJSONPacket} for all possible `PrintJSON` packet subtypes.
 * @category Network Packets
 */
export interface ChatJSONPacket {
  readonly cmd: "PrintJSON";
  /** The {@link PrintJSONPacket} subtype. */
  readonly type: "Chat";
  /** All the textual metadata for this packet. */
  readonly data: JSONMessagePart[];
  /** Team of the triggering player. */
  readonly team: number;
  /** Slot of the triggering player. */
  readonly slot: number;
  /** Original chat message without sender prefix. */
  readonly message: string;
}
/**
 * Sent to clients to broadcast a server-side chat message.
 * @see {@link PrintJSONPacket} for all possible `PrintJSON` packet subtypes.
 * @category Network Packets
 */
export interface ServerChatJSONPacket {
  readonly cmd: "PrintJSON";
  /** The {@link PrintJSONPacket} subtype. */
  readonly type: "ServerChat";
  /** All the textual metadata for this packet. */
  readonly data: JSONMessagePart[];
  /** Original chat message without sender prefix. */
  readonly message: string;
}
/**
 * Sent to relevant clients to broadcast tutorial information, usually on first connection.
 * @see {@link PrintJSONPacket} for all possible `PrintJSON` packet subtypes.
 * @category Network Packets
 */
export interface TutorialJSONPacket {
  readonly cmd: "PrintJSON";
  /** The {@link PrintJSONPacket} subtype. */
  readonly type: "Tutorial";
  /** All the textual metadata for this packet. */
  readonly data: JSONMessagePart[];
}
/**
 * Sent to clients to broadcast a client has changed their tags.
 * @see {@link PrintJSONPacket} for all possible `PrintJSON` packet subtypes.
 * @category Network Packets
 */
export interface TagsChangedJSONPacket {
  readonly cmd: "PrintJSON";
  /** The {@link PrintJSONPacket} subtype. */
  readonly type: "TagsChanged";
  /** All the textual metadata for this packet. */
  readonly data: JSONMessagePart[];
  /** Team of the triggering player. */
  readonly team: number;
  /** Slot of the triggering player. */
  readonly slot: number;
  /** Tags of the triggering player. */
  readonly tags: string[];
}
/**
 * Sent to relevant clients to broadcast the result of a chat command.
 * @see {@link PrintJSONPacket} for all possible `PrintJSON` packet subtypes.
 * @category Network Packets
 */
export interface CommandResultJSONPacket {
  readonly cmd: "PrintJSON";
  /** The {@link PrintJSONPacket} subtype. */
  readonly type: "CommandResult";
  /** All the textual metadata for this packet. */
  readonly data: JSONMessagePart[];
}
/**
 * Sent to relevant clients to broadcast the result of an admin command.
 * @see {@link PrintJSONPacket} for all possible `PrintJSON` packet subtypes.
 * @category Network Packets
 */
export interface AdminCommandResultJSONPacket {
  readonly cmd: "PrintJSON";
  /** The {@link PrintJSONPacket} subtype. */
  readonly type: "AdminCommandResult";
  /** All the textual metadata for this packet. */
  readonly data: JSONMessagePart[];
}
/**
 * Sent to clients to broadcast a player has met their goal condition.
 * @see {@link PrintJSONPacket} for all possible `PrintJSON` packet subtypes.
 * @category Network Packets
 */
export interface GoalJSONPacket {
  readonly cmd: "PrintJSON";
  /** The {@link PrintJSONPacket} subtype. */
  readonly type: "Goal";
  /** All the textual metadata for this packet. */
  readonly data: JSONMessagePart[];
  /** Team of the triggering player. */
  readonly team: number;
  /** Slot of the triggering player. */
  readonly slot: number;
}
/**
 * Sent to clients to broadcast a player has released all remaining items in their world.
 * @see {@link PrintJSONPacket} for all possible `PrintJSON` packet subtypes.
 * @category Network Packets
 */
export interface ReleaseJSONPacket {
  readonly cmd: "PrintJSON";
  /** The {@link PrintJSONPacket} subtype. */
  readonly type: "Release";
  /** All the textual metadata for this packet. */
  readonly data: JSONMessagePart[];
  /** Team of the triggering player. */
  readonly team: number;
  /** Slot of the triggering player. */
  readonly slot: number;
}
/**
 * Sent to clients to broadcast a player has collected all their remaining items from the multi-world.
 * @see {@link PrintJSONPacket} for all possible `PrintJSON` packet subtypes.
 * @category Network Packets
 */
export interface CollectJSONPacket {
  readonly cmd: "PrintJSON";
  /** The {@link PrintJSONPacket} subtype. */
  readonly type: "Collect";
  /** All the textual metadata for this packet. */
  readonly data: JSONMessagePart[];
  /** Team of the triggering player. */
  readonly team: number;
  /** Slot of the triggering player. */
  readonly slot: number;
}
/**
 * Sent to clients to broadcast a countdown message, usually for counting down the start of a game.
 * @see {@link PrintJSONPacket} for all possible `PrintJSON` packet subtypes.
 * @category Network Packets
 */
export interface CountdownJSONPacket {
  readonly cmd: "PrintJSON";
  /** The {@link PrintJSONPacket} subtype. */
  readonly type: "Countdown";
  /** All the textual metadata for this packet. */
  readonly data: JSONMessagePart[];
  /** Amount of seconds remaining on the countdown. */
  readonly countdown: number;
}
/**
 * A union of possible `PrintJSON` packets. Sent to clients purely to display a message to the player. While various
 * message types provide additional arguments, clients only need to evaluate the `data` argument to construct the
 * human-readable message text. All other arguments may be ignored safely.
 * @remarks Only some of these attributes are present on each subtype, see each subtype for more information.
 * @category Network Packets
 */
export type PrintJSONPacket = ItemSendJSONPacket | ItemCheatJSONPacket | HintJSONPacket | JoinJSONPacket | PartJSONPacket | ChatJSONPacket | ServerChatJSONPacket | TutorialJSONPacket | TagsChangedJSONPacket | CommandResultJSONPacket | AdminCommandResultJSONPacket | GoalJSONPacket | ReleaseJSONPacket | CollectJSONPacket | CountdownJSONPacket;
/**
 * A union of all known {@link PrintJSONPacket} types.
 */
export type PrintJSONType = "ItemSend" | "ItemCheat" | "Hint" | "Join" | "Part" | "Chat" | "ServerChat" | "Tutorial" | "TagsChanged" | "CommandResult" | "AdminCommandResult" | "Goal" | "Release" | "Collect" | "Countdown";
