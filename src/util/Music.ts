import { MessageEmbed } from 'discord.js'
import { DisTube } from 'distube'
import { Bot } from '../client/client'
import { EmbedColors } from '../interfaces/EmbedColors'

class Music extends DisTube {
    public colors: EmbedColors

    public constructor(client: Bot) {
        super(client, { youtubeDL: false, leaveOnEmpty: true })
        this.colors = client.colors
        this.start()
    }

    public async start(): Promise<void> {
        this.on('playSong', (queue, song) => {})

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

        this.on('deleteQueue', (queue) => {})

        this.on('disconnect', (queue) => {})

        this.on('empty', (queue) => {})

        this.on('finish', (queue) => {})

        this.on('finishSong', (queue, song) => {})

        this.on('initQueue', (queue) => {})

        this.on('noRelated', (queue) => {})
    }
}

export { Music }
