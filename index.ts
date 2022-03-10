// index.ts creates the discord api client and controles certain actions (recieveing messages, ) 
const { Client, Intents } = require('discord.js'),
    dotenv = require('dotenv'),
    BaseMessageReciever = require('./src/Messages/MessageReciever'),
    BaseController = require('./src/base'),
    prefix = '>>',
    BaseMessageSender = require('./src/Messages/MessageSender');
    dotenv.config();

let serverQueue = new Map(),
    youtubeKey = process.env.YOUTUBE_API_KEY
    // controller = new BaseController(serverQueue);

//create new client
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

//ready up and monitor discord API
try {
    client.once('ready', () => {
        console.log('connected')
    });

    client.on('messageCreate', async (message: any) => {
        if(message.author.bot) return;
        if(!message.content.includes(prefix)) return;

        const msg = new BaseMessageReciever(message),
            sender = new BaseMessageSender(message),
            voiceChannel = message.member.voice;

        if(!message.member.voice.channel) return sender.say('you need to be in a voice channel to use me');
        const controller = new BaseController(message, serverQueue, voiceChannel);

        if(!serverQueue.size){
            serverQueue = controller.serverQueue;
        }
        
        if(serverQueue){
            console.log('Server Queue is live');
        }

        switch (msg.type) {
            case 'help': 
                console.log('help');
                break;
            case 'not-valid':
                sender.say('That is not a valid command');
                console.log('not-valid');
                break;
            case 'play-search' || 'play-link':
                //TODO: if there is already a server queue
                //TODO: split out parse args to return audio stream - create seprate method for player interaction
                sender.say(`${msg.type}`);
                await controller.joinChat();
                console.log('play-search');
                break;
            case 'play-link':
                sender.say('Specific eh... Let me work on that for you.');
                await controller.joinChat();
                //TODO: split out parse args to return audio stream - create seprate method for player interaction
                const song = await controller.parseArgs(msg.args),
                    songQueue = serverQueue.get(msg.message.guildId).songs;
            
                if(!songQueue.length){
                    songQueue.push(song);
                    await controller.playStream(song);
                } else {
                    songQueue.push(song);
                    sender.say('adding')
                }
                
                console.log('play-link');
                break;
            default:
                console.log('default');
                break;
        }
    })

    client.login(process.env.DISCORD_TOKEN)

} catch(err){
    if(err) {
        console.warn(err);
    } else {
        console.warn('caught error but no context was found...');
    }
}