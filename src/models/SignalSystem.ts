type EventCallback<T> = (args: T) => void
type EventCallbackHandler<T> = {
  id: string
  callback: EventCallback<T>
}

function randomstring(length: number) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}

function generateId(): string {
  return randomstring(10)
}

function createCallbackHandler<T>(callback: EventCallback<T>): EventCallbackHandler<T> {
  return {
    id: generateId(),
    callback,
  }
}
export class SignalSystem<T> {
  private handlers: { [K in keyof T]?: EventCallbackHandler<T[K]>[] } = {}

  // Subscribe function
  public on<K extends keyof T>(event: K, callback: EventCallback<T[K]>): string {
    if (!this.handlers[event]) {
      this.handlers[event] = []
    }
    const callbackHandler = createCallbackHandler(callback)
    this.handlers[event]?.push(callbackHandler)
    return callbackHandler.id
  }

  // Emit function
  public emit<K extends keyof T>(event: K, args: T[K]): void {
    this.handlers[event]?.forEach((handler) => handler.callback(args))
  }

  // Unsubscribe function
  public off<K extends keyof T>(
    event: K,
    identifier: { callback?: EventCallback<T[K]>; id?: string },
  ): void {
    const handler = this.handlers[event]
    if (!handler) return

    // Remove the callback from the list of handlers
    const index = identifier.callback
      ? handler.findIndex((e) => e.callback === identifier.callback)
      : handler.findIndex((e) => e.id === identifier.id)
    if (index !== undefined && index > -1) handler.splice(index, 1)

    // If no more handlers, optionally clean up the entry
    if (handler.length === 0) {
      delete this.handlers[event]
    }
  }

  public offByKeys<K extends keyof T>(keys: K[]) {
    keys.forEach((key) => {
      const handler = this.handlers[key]
      if (handler) {
        handler.forEach((_h, i) => {
          handler.splice(i, 1)
        })
        delete this.handlers[key]
      }
    })
  }
}
