const { Client, Intents } = require('discord.js'),
    songQueue = new Map(),
    dotenv = require('dotenv'),
    BaseMessageReciever = require('./src/Messages/MessageReciever'),
    BaseController = require('./src/base'),
    BaseMessageSender = require('./src/Messages/MessageSender');

dotenv.config();

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
        const msg = new BaseMessageReciever(message),
            sender = new BaseMessageSender(message),
            voiceChannel = message.member.voice,
            controller = new BaseController(message, songQueue, voiceChannel);

        if(!voiceChannel) return sender.say('you need to be in a voice channel to use me');
        switch (msg.type) {
            case 'not-valid':
                sender.say('That is not a valid command');
                console.log('not-valid');
                break;
            case 'play-search':
                sender.say('Let me work on that for you...');
                controller.joinChat();
                console.log('play-search');
                break;
            case 'play-link':
                sender.say('Specific eh... Let me work on that for you.');
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