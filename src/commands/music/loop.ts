import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { Queue, RepeatMode } from 'discord-music-player';
import { Chizuru } from '../../interfaces';
import { Command } from '../../structures/command';
import { generateEmbed, replyEmbed, replyMessage } from '../../utils';
import { musicValidator } from '../../utils/validators';

export default new Command({
    name: 'loop',
    description: 'Modify the loop setting for the queue',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['Speak'],
    module: Chizuru.CommandModule.Music,
    options: [
        {
            name: 'mode',
            description: 'The mode to set the loop to',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: 'loop-song', value: 'loop-song' },
                { name: 'loop-queue', value: 'loop-queue' },
                { name: 'disabled', value: 'disabled' },
            ],
        },
    ],

    execute: async (client, interaction) => {
        if (!interaction.inCachedGuild()) return false;
        if (!await musicValidator(client, interaction)) return;
        let queue: Queue | undefined = client.player.getQueue(interaction.guildId);
        if (!queue || !queue.nowPlaying) return await replyMessage(interaction, 'Nothing is currently queued, why not queue something with /play?', true);

        let mode = interaction.options.getString('mode', true);
        switch (mode) {
            case 'loop-song':
                queue.setRepeatMode(RepeatMode.SONG);
                break;
            case 'loop-queue':
                queue.setRepeatMode(RepeatMode.QUEUE);
                break;
            case 'disabled':
                queue.setRepeatMode(RepeatMode.DISABLED);
                break;
        }

        let embed = generateEmbed({
            author: interaction.user.tag,
            authorIcon: interaction.user.avatarURL() || interaction.user.defaultAvatarURL,
            msg: `Repeat mode has been set to ${ mode.replace('-', ' ') } by ${ interaction.user.tag }.`,
            color: client.colors.success,
        });

        await replyEmbed(interaction, await embed);
    },
});
