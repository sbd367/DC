// index.ts creates the discord api client and controles certain actions (recieveing/responding to messages and interactions) 
const { Client, Intents } = require('discord.js'),
    dotenv = require('dotenv'),
    BaseMessageReciever = require('./src/Messages/MessageReciever'),
    BaseController = require('./src/base'),
    prefix = '>>',
    BaseMessageSender = require('./src/Messages/MessageSender');
    //dotenv for env var
    dotenv.config();

// init a new map for tracking Guild (server) state.
let serverQueue = new Map(),
    youtubeKey = process.env.YOUTUBE_API_KEY;

//create new client. Contains intent flags for permissions.
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
        //TODO: add initial server message.
        console.log('connected')
    });

    client.on('messageCreate', async (message: any) => {
        //only do stuff if there's a prefix
        if(message.author.bot) return;
        if(!message.content.includes(prefix)) return;

        // setup reciever, sender, and controller classes.
        const msg = new BaseMessageReciever(message),
            sender = new BaseMessageSender(message),
            voiceChannel = message.member.voice,
            controller = new BaseController(message, serverQueue, voiceChannel);

        if(!message.member.voice.channel) return sender.say('you need to be in a voice channel to use me');

        // if there's no global queue set it to the one created by the controller.
        if(!serverQueue.size){
            serverQueue = controller.serverQueue;
        }
        //get current serverQueue object.
        const currentQueue = serverQueue.get(msg.message.guildId);
        console.log(`EXE: ${msg.type}`);

        switch (msg.type) {
            case 'help-search':
                let bstr = 'use ">>" as prefix (ex \`>>play https://www.youtube.com/watch?v=dQw4w9WgXcQ\`)\n\`play "youtube search or link"\`\n\`skip\`\n\`list\`';
                sender.say(bstr);
                break;
            case 'not-valid':
                sender.say('That is not a valid command use `>>help` for commands.');
                break;
            case 'skip-search':
                if(currentQueue.songs.length){
                    sender.say('Skipping');
                    let song = currentQueue.songs.pop();
                    controller.playStream(song);
                } else {
                    sender.say('no songs in the queue');
                };
                break;
            case 'play-search':
                //create song via controller, join chat, then update queue/play song. (same thing for play-link)
                let sng = await controller.parseArgs(msg.args);
                await controller.joinChat();
                if(!currentQueue.songs.length){
                    currentQueue.songs.push(sng);
                    await controller.playStream(sng);
                } else {
                    currentQueue.songs.push(sng);
                    let bStr = `Adding: ${sng.title} \nQueue:\n`;
                    currentQueue.songs.forEach((el:any, ind:any) => {
                        bStr+=`${ind+1}. ${el.title}\n`;
                    });
                    sender.say(bStr);
                }
                sender.say(`Playing: ${sng.title}`);
                break;
            case 'play-link':
                const song = await controller.parseArgs(msg.args),
                    songQueue = currentQueue.songs;
                await controller.joinChat();
                
                sender.say(`Playing: ${song.title}`);
                if(!songQueue.length){
                    songQueue.push(song);
                    await controller.playStream(song);
                } else {
                    songQueue.push(song);
                    let bStr = `Adding: ${song.title} \nQueue:\n`;
                    songQueue.forEach((el:any, ind:any) => {
                        bStr+=`${ind+1}. ${el.title}\n`;
                    });
                    sender.say(bStr);
                }
                break;
            default:
                console.log('default');
                break;
        }
    })

    client.login(process.env.DISCORD_TOKEN);

} catch(err){
    if(err) {
        console.warn(err);
    } else {
        console.warn('caught error but no context was found...');
    }
}