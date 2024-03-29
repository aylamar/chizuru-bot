import { Queue, Song } from 'discord-music-player';
import { Chizuru } from '../../interfaces';
import { Command } from '../../structures/command';
import { replyMessage, replyPages } from '../../utils';
import { musicValidator } from '../../utils/validators';

export default new Command({
    name: 'queue',
    description: 'List songs currently in the queue',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['Speak'],
    module: Chizuru.CommandModule.Music,
    options: [],

    execute: async (client, interaction) => {
        if (!interaction.inCachedGuild()) return;
        if (!(await musicValidator(client, interaction))) return;
        let queue: Queue | undefined = client.player.getQueue(interaction.guildId);
        if (!queue)
            return await replyMessage(
                interaction,
                'Nothing is currently queued, why not queue something with /play?',
                true
            );

        let pageCount = Math.floor(queue.songs.length / 10) + 1;
        let pages = generatePages(pageCount, queue.songs);

        return await replyPages(client, interaction, pages);
    },
});

function generatePages(pageCount: number, array: Array<Song>) {
    let count = 0;
    let pageArr = [];

    for (let i = 0; i < pageCount; i++) {
        let songList = array
            .slice(count, count + 10)
            .map((song, index) => {
                let item = `${count + index + 1}) ${song.name}`.split('');
                let duration = song.duration;

                if (item.length <= 49) {
                    while (item.length < 50) {
                        item.push(' ');
                    }
                    return `${item.join('')} ${duration} (${song.requestedBy?.tag || 'Unknown'})`;
                } else {
                    return `${item.slice(0, 49).join('')}… ${duration} (${song.requestedBy?.tag || 'Unknown'})`;
                }
            })
            .join('\n');
        count += 10;
        songList = songList.concat(`\n\nPage ${i + 1}/${pageCount}`);
        pageArr.push(`\`\`\`JS\n${songList}\`\`\``);
    }
    return pageArr;
}
