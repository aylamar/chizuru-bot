import { MessageEmbed } from 'discord.js'
import { DisTube } from 'distube'
import { Bot } from '../client/client'
import { EmbedColors } from '../interfaces/EmbedColors'

/*
    Contains all the music related commands and event listener
    This mainly exits to change the music reply messages that Distube provides
 */

class Music extends DisTube {
    public colors: EmbedColors

    public constructor(client: Bot) {
        super(client, { youtubeDL: false, leaveOnEmpty: true })
        this.colors = client.colors
        // noinspection JSIgnoredPromiseFromCall
        this.start()
    }

    public async start(): Promise<void> {
        this.on('addSong', (queue, song) => {
            let embed = new MessageEmbed()
                .setDescription(`Adding **${song.name}** to the queue, requested by **${song.user}**`)
                .setColor(this.colors.success)
            queue.textChannel.send({ embeds: [embed] })
        })

        this.on('addList', (queue, playlist) => {
            let embed = new MessageEmbed()
                .setDescription(`Adding **${playlist.songs.length}** songs from the playlist **${playlist.name}**, requested by ${playlist.user}`)
                .setColor(this.colors.success)
            queue.textChannel.send({ embeds: [embed] })
        })

        this.on('error', (channel, error) => {
            let embed = new MessageEmbed()
                .setDescription(`Error:\n\`\`\`${error.message}\`\`\``)
                .setColor(this.colors.error)
            channel.send({ embeds: [embed] })
        })

        this.on('empty', (queue) => {
            let embed = new MessageEmbed()
                .setDescription(`${queue.voiceChannel.name} is empty, leaving the channel.`)
                .setColor(this.colors.warn)
            queue.textChannel.send({ embeds: [embed] })
            queue.voice.leave()
        })

        this.on('finish', (queue) => {
            let embed = new MessageEmbed()
                .setDescription(`The queue is empty, leaving the channel.`)
                .setColor(this.colors.warn)
            queue.textChannel.send({ embeds: [embed] })
            queue.voice.leave()
        })
    }
}

export { Music }
