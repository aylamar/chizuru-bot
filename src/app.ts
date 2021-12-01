import { Config } from './interfaces/Config'
import * as config from './config.json'
import { Bot } from './client/client'

// noinspection JSIgnoredPromiseFromCall
new Bot().start(config as Config)
