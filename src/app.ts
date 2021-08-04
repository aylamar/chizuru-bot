// Import Discord.js
import { MessageEmbed, Client, Intents, GuildStickerManager, Guild, DiscordAPIError } from 'discord.js'
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Import dependencies
import { guildID, discordToken, mongoURI } from './config.json'
import mongoose from "mongoose";
import StreamMgr from './util/StreamMgr'

// Import commands
import addStream from './commands/addStream'
import listStreams from './commands/listStreams'
import delStream from './commands/delStream'
import help from './commands/help'
import stats from './commands/stats'

console.log('Chizuru bot is starting...')

let commandsRun = 0

// Once started, start doing stuff
client.once('ready', async () => {
    console.log('Chizuru Bot is running!')
    client.user.setActivity('/addstream', { type: 'WATCHING' })

    // List of application command option types can be found here:
    // https://discord.com/developers/docs/interactions/slash-commands#application-command-object-application-command-option-type

    // When slash command is executed, run command
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        commandsRun++
        switch (interaction.commandName) {
            case 'ping':
                await interaction.reply('Pong!');
                break
            case 'addstream':
                let addMsg: MessageEmbed = await addStream(interaction.options.getString('streamer'), interaction.channelId)
                await interaction.reply({embeds: [addMsg]});
                break
            case 'delstream':
                let delMsg: MessageEmbed = await delStream(interaction.options.getString('streamer'), interaction.channelId)
                await interaction.reply({embeds: [delMsg]});
                break
            case 'liststreams':
                let listMsg: MessageEmbed = await listStreams(interaction.channelId)
                await interaction.reply({embeds: [listMsg]})
                break
            case 'help':
                let helpMsg: MessageEmbed = await help()
                await interaction.reply({embeds: [helpMsg]})
                break
            case 'stats':
                let statsMsg: MessageEmbed = await stats(commandsRun)                    
                await interaction.reply({embeds: [statsMsg]})
                break
            default:
                console.error('Somehow the default case was triggered')
                break
        }
    });    
});

client.on('messageCreate', async message => {
	if (!client.application?.owner) await client.application?.fetch();

    // Command data for all commands
    const commandData = [ 
        {
            name: 'ping',
            description: 'Replies with pong',
        },
        {
            name: 'addstream',
            description: 'Start following a stream in this channel',
            options: [{
                name: 'streamer',
                type: 3,
                description: "The username of the streamer you'd like to follow",
                required: true,
            }]
        },
        {
            name: 'delstream',
            description: 'Removes a stream from this channel',
            options: [{
                name: 'streamer',
                type: 3,
                description: "The username of the streamer you'd like to unfollow",
                required: true,
            }]
        },
        {
            name: 'liststreams',
            description: 'Lists all streams followed in this server',
        },
        {
            name: 'stats',
            description: 'Displays information about Chizuru Bot',
        },
        {
            name: 'help',
            description: 'List all avaiable commands',
        },
    ]

    // If message is from bot owner, allow deploy test commands
    if (message.content.toLowerCase() === '!testdeploy' && message.author.id === client.application?.owner.id) {
        //const commands = await client.application?.commands.set([])
        const commandsTest = await client.guilds.cache.get(guildID)?.commands.set(commandData)
        //console.log('Global commands', commands)
        console.log('Test commands', commandsTest)
    }

    // If message is from bot owner, allow deploy global commands
    if (message.content.toLowerCase() === '!deploy' && message.author.id === client.application?.owner.id) {
        const commands = await client.application?.commands.set(commandData)
        const commandsTest = await client.guilds.cache.get(guildID)?.commands.set([])
        console.log('Global commands', commands)
        console.log('Test commands', commandsTest)
    }
});

// Connect to MongoDB with mongoose
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result: any) => {
        console.log('Connected with Mongoose')
        
        // Check initial state, then begin checking state every minute
        StreamMgr.initState().then(console.log('Done setting initial state'))
        setInterval(StreamMgr.updateState, 1000 * 60),

        // Must be the last line, used to log in with Discord.js
        client.login(discordToken)
    })
    .catch((err: any) => console.error(err))

// Export client so messages can be sent without passing around client
export { client }
