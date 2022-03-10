import { AudioPlayerStatus, StreamType } from "@discordjs/voice";
import { GlobalQueue, ServerQueue } from "../types";

const { joinVoiceChannel, 
    getVoiceConnection, 
    createAudioPlayer, 
    createAudioResource } = require('@discordjs/voice'),
    Song = require('./Audio/Song'),
    YouTubeRequest = require('./API/youtube-search-api'),
    ytdl = require('discord-ytdl-core');

//class to control the microservice 
module.exports = class BaseController {
    //initialize values
    interaction: any;
    serverQueue: Map<string, any> = new Map;
    isLink: boolean = false;
    voiceChannel: any;
    connection: any;
    inChannel: any;
    searchString: string;
    guildId: string = '';
    player: any = createAudioPlayer();

    //method to init queue construct
    private setupState = () => {
        let construct = {
            textChannel: null,
            voiceChannel: this.voiceChannel,
            connection: null,
            songs: [],
            volume: 1,
            playing: false,
        };
        this.serverQueue.set(this.guildId, construct);
    }

    constructor(interaction:any, serverQueue: any, voiceChannel:any){
        this.interaction = interaction;
        this.voiceChannel = voiceChannel;
        this.guildId = interaction.guild.id;
        this.searchString = interaction.content;
        if(!serverQueue.length){
            console.log('----Initial queue setup----');
            this.setupState();
        } else {
            console.log('----Set active queue----');
            this.serverQueue = serverQueue.get(interaction.guild.id);
        }
        
    }

    //Discord player controller - plays audio stream and handles player events
    playStream = async (song:any) => {
        await song.getAudioStream();

        let resource = await createAudioResource(song.streamFile, {
            inputType: StreamType.Opus
        });
        
        this.serverQueue.get(this.guildId).connection.subscribe(this.player);
        this.player.play(resource, {
            type: 'opus'
        });

        this.player.on(AudioPlayerStatus.Buffering, () => {
            console.log('buffering...');
        });
        this.player.on(AudioPlayerStatus.Playing, () => {
            console.log('playing song')
        });
    };

    //Takes arguments given from BaseMessageReciever and makes youtube requests as it should.
    parseArgs = async (args:Array<any>) => {
        this.isLink = args[0].includes('youtube.com');
        this.searchString = this.isLink ? '' : args.join(' ');

        if(this.isLink){
            let results = await ytdl.getInfo(args[0]),
                player = createAudioPlayer(),
                songData = {
                    title: results.videoDetails.title,
                    url: results.videoDetails.video_url
                };
            const song = new Song(songData);
            return song;
        } else {
            const params =  {
                method: 'GET',
                accept: '*/*',
                url: `https://www.googleapis.com/youtube/v3/search`,
                params: {
                    key: process.env.YOUTUBE_API_KEY,
                    part: 'id, snippet',
                    maxResults: '1',
                    type: 'video',
                    q: this.searchString
                }  
            }
            let YTRequest = new YouTubeRequest(params);
            const songData = await YTRequest.videoRequest(this.searchString);
            return songData;
        };
    };

    joinChat(){
        this.serverQueue.get(this.guildId).connection = joinVoiceChannel({
            channelId: this.voiceChannel.channelId,
            guildId: this.voiceChannel.guild.id,
            adapterCreator: this.voiceChannel.guild.voiceAdapterCreator
        });
    }
};