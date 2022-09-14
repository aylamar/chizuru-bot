import { Playlist, Queue, Song } from 'discord-music-player';
import { ApplicationCommandOptionType, EmbedBuilder, InteractionResponse } from 'discord.js';
import { Chizuru } from '../../interfaces';
import { Command } from '../../structures/command';
import { deferReply, generateEmbed, replyEmbed, replyMessage } from '../../utils';
import { musicValidator } from '../../utils/validators';

export default new Command({
    name: 'play',
    description: 'Queue a song to be played',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['Speak'],
    module: Chizuru.CommandModule.Music,
    options: [
        {
            name: 'song',
            description: 'The song to be queued',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'song',
                    description: 'The song to be queued',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: 'playlist',
            description: 'The playlist to be queued',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'playlist',
                    description: 'The playlist to be queued',
                    type: ApplicationCommandOptionType.String,
                },
            ],
        },
    ],

    execute: async (client, interaction) => {
        if (!interaction.inCachedGuild()) return;
        if (!await musicValidator(client, interaction)) return;
        let queue: Queue | undefined = client.player.getQueue(interaction.guildId);

        if (!queue) {
            queue = client.player.createQueue(interaction.guildId, { data: { channelId: interaction.channelId } });
            // this is safe to do thanks to musicValidator above
            await queue.join(interaction.member.voice.channelId as string);
            client.logger.info(`No queue found for guild ${ interaction.guild.name } (${ interaction.guildId }), creating new queue.`);
        } else {
            // check to see if the user is in the same voice channel as the bot
            if (queue.connection?.channel.id !== interaction.member.voice.channelId) {
                return await replyMessage(interaction, 'You must be in the same voice channel as the bot to use this command.', true);
            }

            let data = queue.data as any;
            let queueChannelId = data.channelId;
            // check to see if this command is being executed as the queueChannelId
            if (queueChannelId !== interaction.channelId) {
                return await replyMessage(interaction, `You need to use this command in <#${ queueChannelId }>.`, true);
            }
        }

        const subCommand = interaction.options.getSubcommand();
        let embed: Promise<EmbedBuilder>;
        let defer: Promise<InteractionResponse<boolean>> | undefined;

        switch (subCommand) {
            case 'song':
                let songReq = interaction.options.getString('song', true);
                let queuedSong: Song;
                // check to see if songReq includes "playlist", if it does, direct to playlist command
                if (songReq.includes('playlist')) {
                    return await replyMessage(interaction, 'You can\'t use playlists with this command.', true);
                }
                defer = deferReply(interaction);

                try {
                    queuedSong = await queue.play(songReq, { requestedBy: interaction.user });
                } catch (err: any) {
                    client.logger.warn(`Failed to find song ${ songReq } for guild ${ interaction.guild.name } (${ interaction.guildId })`);
                    client.logger.warn(err);
                    embed = generateEmbed({
                        msg: err.message,
                        color: client.colors.error,
                    });
                    break;
                }

                embed = generateEmbed({
                    author: interaction.user.tag,
                    authorIcon: interaction.user.avatarURL() || interaction.user.defaultAvatarURL,
                    msg: `[${ queuedSong.name }](${ queuedSong.url }) has been added to the queue by ${ interaction.user.tag }.`,
                    color: client.colors.success,
                });
                break;
            case 'playlist':
                let playlistReq = interaction.options.getString('playlist', true);
                let queuedPlaylist: Playlist;
                if (!playlistReq.includes('playlist')) {
                    return await replyMessage(interaction, 'Only playlists can be queued with this command.', true);
                }
                defer = deferReply(interaction);

                try {
                    queuedPlaylist = await queue.playlist(playlistReq, { requestedBy: interaction.user });
                } catch (err: any) {
                    client.logger.warn(`Failed to find song ${ playlistReq } for guild ${ interaction.guild.name } (${ interaction.guildId })`);
                    client.logger.warn(err);
                    embed = generateEmbed({
                        msg: err.message,
                        color: client.colors.error,
                    });
                    break;
                }

                let fields: Chizuru.Field[] = [];
                queuedPlaylist.songs.slice(0, 9).map((song, index) => {
                    fields.push({
                        name: `${ index + 1 }. ${ song.name }`,
                        value: `Duration: ${ song.duration }`,
                        inline: false,
                    });
                });

                // if more than 10 songs are in queuedPlaylist, add a field for the remaining songs
                if (queuedPlaylist.songs.length > 9) {
                    fields.push({
                        name: 'Additional songs',
                        value: `${ queuedPlaylist.songs.length - 9 } more songs`,
                        inline: false,
                    });
                }

                embed = generateEmbed({
                    author: interaction.user.tag,
                    authorIcon: interaction.user.avatarURL() || interaction.user.defaultAvatarURL,
                    msg: `${ queuedPlaylist.songs.length } songs from ${ queuedPlaylist.name } has been added to the queue by ${ interaction.user.tag }.`,
                    fields: fields,
                    color: client.colors.success,
                });
                break;
            default:
                embed = generateEmbed({
                    title: 'Error',
                    msg: 'Invalid subcommand.',
                });
                break;
        }

        if (defer) await defer;
        return await replyEmbed(interaction, await embed);
    },
});
