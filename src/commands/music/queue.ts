import { MessageActionRow, MessageButton, MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { Song } from 'distube'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return

    const musicChannel = client.cache[interaction.guildId].musicChannel
    if (musicChannel === interaction.channelId || musicChannel == undefined) {
        let queue = client.music.getQueue(interaction.guild)

        if (queue) {
            let pageCount = Math.floor(queue.songs.length / 10) + 1
            let pages = generatePages(pageCount, queue.songs)

            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('previous')
                    .setLabel('Previous')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle('PRIMARY')
            )

            let page = 0
            interaction.reply({ content: pages[0], components: [row] })

            const filter = (i: any) => i.customId === 'previous' || i.customId === 'next'
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 })

            collector.on('collect', async (i) => {
                if (i.customId === 'previous') {
                    if (page > 0) {
                        page--
                    } else {
                        page = pages.length - 1
                    }
                } else if (i.customId === 'next') {
                    if (page + 1 < pages.length) {
                        page++
                    } else {
                        page = 0
                    }
                }
                await i.deferUpdate()
                await i.editReply({ content: pages[page], components: [row] })
                collector.resetTimer()
            })
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

export const name: string = 'queue'
export const description: string = 'See the music queue'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']

function generatePages(pageCount: number, array: Array<Song>) {
    let count = 0
    let pageArr = []

    for (let i = 0; i < pageCount; i++) {
        let songList = array
            .slice(count, count + 10)
            .map((song, index) => {
                let item = `${count + index + 1}) ${song.name}`.split('')
                let duration = calcDuration(song.duration)

                if (item.length <= 49) {
                    while (item.length < 50) {
                        item.push(' ')
                    }
                    return `${item.join('')} ${duration} (${song.user.tag})`
                } else {
                    return `${item.slice(0, 49).join('')}… ${duration} (${song.user.tag})`
                }
            })
            .join('\n')
        count += 10
        songList = songList.concat(`\n\nPage ${i + 1}/${pageCount}`)
        pageArr.push(`\`\`\`JS\n${songList}\`\`\``)
    }
    return pageArr
}

function calcDuration(dur: number) {
    let minutes: number | string = Math.floor(dur / 60)
    let seconds: number | string = Math.floor(
        dur - minutes * 60
    )
    if (minutes.toString().length === 1) {
        minutes = `0${minutes}`
    }
    if (seconds.toString().length === 1) {
        seconds = `0${seconds}`
    }
    return `${minutes}:${seconds}`
}
