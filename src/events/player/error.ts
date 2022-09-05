import { DMPError, Queue } from 'discord-music-player';
import { EmbedBuilder, GuildTextBasedChannel } from 'discord.js';
import { Bot } from '../../classes/bot';
import { RunPlayerEvent } from '../../interfaces';
import { generateEmbed } from '../../utils';

export const run: RunPlayerEvent = async (client: Bot, error: DMPError, queue: Queue) => {

    let embed: Promise<EmbedBuilder>;
    switch (String(error)) {
        case 'Status code: 410':
            if (!queue.nowPlaying) return;
            let currentSong = queue.nowPlaying;
            queue.skip();

            embed = generateEmbed({
                msg: `${ currentSong.name } has been skipped due to YouTube's adult content filter.`,
                color: client.colors.warn,
            });
            break;
        default:
            client.logger.error('Encountered error in player event');
            client.logger.error(error);
            embed = generateEmbed({
                msg: `An unknown error has occurred while attempting to run a music command ${ String(error) }`,
                color: client.colors.error,
            });
    }

    let data = queue.data as any;
    let queueChannelId = data.channelId;
    let queueChannel = client.channels.cache.get(queueChannelId) as GuildTextBasedChannel;

    await queueChannel.send({ embeds: [await embed] });
};

export const name = 'error';
