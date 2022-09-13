import { Queue } from 'discord-music-player';
import { Command, CommandModule } from '../../structures/command';
import { generateEmbed, replyEmbed, replyMessage } from '../../utils';
import { musicValidator } from '../../utils/validators';

export default new Command({
    name: 'stop',
    description: 'Stops the queue',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['Speak'],
    module: CommandModule.Music,
    options: [],

    execute: async (client, interaction) => {
        if (!interaction.inCachedGuild()) return false;
        if (!await musicValidator(client, interaction)) return;

        let queue: Queue | undefined = client.player.getQueue(interaction.guildId);
        if (!queue || !queue.nowPlaying) return await replyMessage(interaction, 'Nothing is currently queued, why not queue something with /play?', true);

        queue.stop();
        let embed = generateEmbed({
            author: interaction.user.tag,
            authorIcon: interaction.user.avatarURL() || interaction.user.defaultAvatarURL,
            msg: `Music has been stopped by ${ interaction.user.tag }.`,
            color: client.colors.success,
        });

        await replyEmbed(interaction, await embed);
    },
});
