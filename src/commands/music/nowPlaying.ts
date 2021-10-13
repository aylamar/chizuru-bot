import { MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'

export const run: RunFunction = async (client, interaction) => {
    const musicChannel = client.cache[interaction.guildId].musicChannel
    if (musicChannel === interaction.channelId || musicChannel == undefined) {
        let queue = client.music.getQueue(interaction.guild)

        if (queue) {
            const song = queue.songs[0]

            let curTime = await beautifySeconds(queue.currentTime)
            let dur = await beautifySeconds(song.duration)

            let embed = new MessageEmbed()
                .setDescription(`**[${song.name}](${song.url})** (${curTime}/${dur}) requested by ${song.user}.`)
                .setColor(client.colors.purple)
            interaction.reply({ embeds: [embed] })
        } else {
            let embed = new MessageEmbed()
                .setDescription('Nothing is currently playing in this server.')
                .setColor(client.colors.error)
            await interaction.reply({ embeds: [embed] })
        }
    } else {
        interaction.reply({
            content: `This command can only be run in <#${musicChannel}>.`,
            ephemeral: true,
        })
    }
}

async function beautifySeconds(sec: number ) {
    let minutes: number = 0
    let seconds: number | string = 0

    minutes = Math.floor(sec/60)
    seconds = Math.floor(sec % 60)

    if (seconds < 10) {
        seconds = `0${seconds}`
    }

    return `${minutes}:${seconds}`
}

export const name: string = 'nowplaying'
export const description: string = 'Show what song is currently playing'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
