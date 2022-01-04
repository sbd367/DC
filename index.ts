// index.ts creates the discord api client and controles certain actions (recieveing messages, ) 
const { Client, Intents } = require('discord.js'),
    dotenv = require('dotenv'),
    BaseMessageReciever = require('./src/Messages/MessageReciever'),
    BaseController = require('./src/base'),
    prefix = '>>',
    BaseMessageSender = require('./src/Messages/MessageSender');
dotenv.config();
let serverQueue = new Map(),
youtubeKey = process.env.YOUTUBE_API_KEY;
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
            voiceChannel = message.member.voice,
            controller = new BaseController(message, serverQueue, voiceChannel);

        serverQueue = controller.serverQueue;

        if(controller.serverQueue){
            console.log('success')
        }

        if(!voiceChannel) return sender.say('you need to be in a voice channel to use me');
        switch (msg.type) {
            case 'not-valid':
                sender.say('That is not a valid command');
                console.log('not-valid');
                break;
            case 'play-search':
                sender.say('Let me work on that for you...');
                await controller.joinChat();
                await controller.parseArgs(msg.args);
                console.log('play-search');
                break;
            case 'play-link':
                //this works - may want to combine join and pars args into one?
                sender.say('Specific eh... Let me work on that for you.');
                await controller.joinChat();
                await controller.parseArgs(msg.args);
                console.log('play-link');
                break;
            default:
                console.log('default')
                break;
        }
    })

} catch(err){
    if(err) console.warn(err);
}

client.login(process.env.DISCORD_TOKEN)