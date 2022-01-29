import { StreamType } from "@discordjs/voice";

const { joinVoiceChannel, 
    getVoiceConnection, 
    createAudioPlayer, 
    createAudioResource } = require('@discordjs/voice'),
    Song = require('./Audio/Song'),
    YouTubeRequest = require('./API/youtube-search-api'),
    ytdl = require('discord-ytdl-core');

module.exports = class BaseController {
    interaction: any;
    serverQueue: any = new Map();
    isLink: boolean = false;
    voiceChannel: any;
    connection: any;
    inChannel: any;
    searchString: string;
    guildId: string = '';
    player: any = createAudioPlayer();

    private setupState = () => {
        let construct = {
            textChannel: null,
            voiceChannel: this.voiceChannel,
            connection: null,
            songs: [],
            volume: 3,
            playing: false,
        };
        this.serverQueue.set(this.guildId, construct);
    }

    constructor(interaction:any, serverQueue:any, voiceChannel:any){
        this.interaction = interaction;
        this.voiceChannel = voiceChannel;
        this.guildId = interaction.guild.id;
        this.searchString = interaction.content;
        if(!serverQueue.length){
            console.log('fail');
            this.setupState();
            serverQueue.set(this.guildId, this.serverQueue);
        } else {
            this.serverQueue = serverQueue.get(interaction.guild.id);
        }
    }

    playStream = async (song:any) => {
        let player = createAudioPlayer();
        await song.getAudioStream();

        let resource = await createAudioResource(song.streamFile, {
            inputType: StreamType.Opus
        });
        this.serverQueue.get(this.guildId).connection.subscribe(player);
        player.play(resource);
    }

    parseArgs = async (args:Array<any>) => {
        const isLink = args[0].includes('youtube.com'),
            searchString = isLink ? null : args.join(' ');
        if(isLink){
            let results = await ytdl.getInfo(args[0]),
                player = createAudioPlayer(),
                songData = {
                    title: results.videoDetails.title,
                    url: results.videoDetails.video_url
                };
            let song = new Song(songData);
            await song.getAudioStream();
            let resource = await createAudioResource(song.streamFile, {
                inputType: StreamType.Opus
            });
            this.serverQueue.get(this.guildId).connection.subscribe(player);
            player.play(resource);
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
                    q: searchString
                }  
            }
            let YTRequest = new YouTubeRequest(params);
            const songData = await YTRequest.videoRequest(searchString),
                player = createAudioPlayer();
            await songData.getAudioStream();
            const resource = await createAudioResource(songData.streamFile, {
                inputType: StreamType.Opus
            });
            this.serverQueue.get(this.guildId).connection.subscribe(player);
            player.play(resource);
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