import { RunEvent } from '../../interfaces';

export const run: RunEvent = async (client) => {
    if (!client.user) return;
    client.logger.info(`${ client.user.tag } is now online!`);
};

export const name: string = 'ready';
