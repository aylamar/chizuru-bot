import { ClientEvents } from 'discord.js';
import { Bot } from './bot';

export class Event implements EventArgs {
    name: keyof ClientEvents;
    execute: RunEvent;

    constructor(args: EventArgs) {
        this.name = args.name;
        this.execute = args.execute;
    }

    public startListener(client: Bot): void {
        client.on(this.name, (...args: any[]) => this.run(client, ...args));
    }

    private async run(client: Bot, ...args: any[]): Promise<any> {
        const start = process.hrtime.bigint();
        try {
            await this.execute(client, ...args);
        } catch (err) {
            client.logger.error(err);
        }
        const result = process.hrtime.bigint();
        return client.logger.debug(`Spent ${(result - start) / BigInt(1000000)}ms processing event ${this.name}`, {
            label: 'event',
        });
    }
}

export interface RunEvent {
    (client: Bot, ...args: any[]): Promise<any>;
}

export interface EventArgs {
    name: keyof ClientEvents;
    execute: RunEvent;
}
