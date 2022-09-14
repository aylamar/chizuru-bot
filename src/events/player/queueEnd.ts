import { Queue } from 'discord-music-player';
import { GuildTextBasedChannel } from 'discord.js';
import { PlayerEvent } from '../../structures/event';
import { generateEmbed } from '../../utils';

export default new PlayerEvent({
    name: 'queueEnd',
    execute: async (client, queue: Queue) => {
        if (!client.isReady()) return;
        let data = queue.data as any;
        let queueChannelId = data.channelId;
        let queueChannel = client.channels.cache.get(queueChannelId) as GuildTextBasedChannel;

        let embed = generateEmbed({
            author: client.user.tag,
            authorIcon: client.user.displayAvatarURL(),
            msg: 'The queue is empty, leaving the channel',
            color: client.colors.warn,
        });

        await queueChannel.send({ embeds: [await embed] });
    },
});
