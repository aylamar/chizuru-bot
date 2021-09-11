import { Client, MessageEmbed } from 'discord.js'
import { embedSuccess } from './Colors'
import { DisTube } from 'distube'

class Music extends DisTube {
    public constructor(client: Client) {
        super(client, { youtubeDL: false, leaveOnEmpty: true })
        this.start()
    }

    public async start(): Promise<void> {
        this.on('playSong', (queue, song) => {
            /*
            let embed = new MessageEmbed()
                .setDescription(`Now playing **${song.name}** requested by **${song.user}**`)
                .setColor(embedSuccess)
            queue.textChannel.send({embeds: [embed]})
            */
        })

        this.on('addSong', (queue, song) => {
            let embed = new MessageEmbed()
                .setDescription(`Adding **${song.name}** requested by **${song.user}**`)
                .setColor(embedSuccess)
            queue.textChannel.send({ embeds: [embed] })
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
