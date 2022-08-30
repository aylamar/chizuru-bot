import { PlayerEvents } from 'discord-music-player';
import { Bot } from '../classes/bot';

export interface RunEvent {
    (client: Bot, ...args: any[]): Promise<any>;
}

export interface Event {
    name: string;
    run: RunEvent;
}

export interface PlayerEvent {
    name: keyof PlayerEvents;
    run: RunPlayerEvent;
}

export interface RunPlayerEvent {
    (client: Bot, ...args: any[]): Promise<any>;
}
