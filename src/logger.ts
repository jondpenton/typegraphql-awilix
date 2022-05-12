import { Cradle } from './types'

export class Logger {
  constructor(private readonly cradle: Cradle) {
    console.log('Logger created!')
  }

  log(...messages: any[]) {
    console.log(`(ID ${this.cradle.requestId}):`, ...messages)
  }
}
