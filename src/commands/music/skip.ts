import { Queue } from 'discord-music-player';
import { Chizuru } from '../../interfaces';
import { Command } from '../../structures/command';
import { generateEmbed, replyEmbed, replyMessage } from '../../utils';
import { musicValidator } from '../../utils/validators';

export default new Command({
    name: 'skip',
    description: 'Skip the current song',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['Speak'],
    module: Chizuru.CommandModule.Music,
    options: [],

    execute: async (client, interaction) => {
        if (!interaction.inCachedGuild()) return;
        if (!(await musicValidator(client, interaction))) return;
        let queue: Queue | undefined = client.player.getQueue(interaction.guildId);
        if (!queue || !queue.nowPlaying)
            return await replyMessage(
                interaction,
                'Nothing is currently queued, why not queue something with /play?',
                true
            );

        let currentSong = queue.nowPlaying;
        let skip = queue.skip();
        let embed = generateEmbed({
            author: interaction.user.tag,
            authorIcon: interaction.user.avatarURL() || interaction.user.defaultAvatarURL,
            msg: `${currentSong.name} has been skipped by ${interaction.user.tag}.`,
            color: client.colors.success,
        });

        await skip;
        await replyEmbed(interaction, await embed);
    },
});
