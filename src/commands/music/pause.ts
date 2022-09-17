import { Queue } from 'discord-music-player';
import { Chizuru } from '../../interfaces';
import { Command } from '../../structures/command';
import { generateEmbed, replyEmbed, replyMessage } from '../../utils';
import { musicValidator } from '../../utils/validators';

export default new Command({
    name: 'pause',
    description: 'Pause the queue',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['Speak'],
    module: Chizuru.CommandModule.Music,
    options: [],

    execute: async (client, interaction) => {
        if (!interaction.inCachedGuild()) return false;
        if (!(await musicValidator(client, interaction))) return;
        let queue: Queue | undefined = client.player.getQueue(interaction.guildId);
        if (!queue || !queue.nowPlaying)
            return await replyMessage(
                interaction,
                'Nothing is currently queued, why not queue something with /play?',
                true
            );

        queue.setPaused(true);
        let embed = generateEmbed({
            author: interaction.user.tag,
            authorIcon: interaction.user.avatarURL() || interaction.user.defaultAvatarURL,
            msg: `Music has been paused by ${interaction.user.tag}.`,
            color: client.colors.warn,
        });

        await replyEmbed(interaction, await embed);
    },
});
