const {joinVoiceChannel} = require('@discordjs/voice');
module.exports = class BaseController {
    interaction: any;
    serverQueue: any;
    voiceChannel: any;
    connection: any;
    guildId: string = '';
    constructor(interaction:any, queue:any, voiceChannel:any){
        this.interaction = interaction;
        this.voiceChannel = voiceChannel;
        if(queue){
            this.serverQueue = queue;
        } else {
            let construct = {
                textChannel: queue ? queue.textChannel : null,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 4,
                playing: false,
            },
            gId = interaction.guild.id;
            this.serverQueue.set(gId, construct);
        }
    }

    joinChat(){
        this.connection = joinVoiceChannel({
            channelId: this.voiceChannel.id,
            guildId: this.voiceChannel.guild.id,
            adapterCreator: this.voiceChannel.guild.voiceAdapterCreator
        })
        this.serverQueue.connection = this.connection;
    }
}