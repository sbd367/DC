const ytdl = require('discord-ytdl-core');
const fs = require('fs');
module.exports = class Song {
    title: string;
    url: string;
    thumbnail: string;
    streamFile: any;

    constructor(songData:any){
        this.title = songData.title;
        this.url = songData.url;
        this.thumbnail = songData.thumbnail;
    }

    getAudioStream = async() => {
        try{
            this.streamFile = await ytdl(this.url, {
                filter: 'audioonly',
                opusEncoded: true,
                encoderArgs: ['-af', 'bass=g=10,dynaudnorm=f=200']
            });
        } catch (e) {
            if(e) console.warn(e);
        }
    }
}