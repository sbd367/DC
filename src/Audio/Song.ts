const ytdl = require('discord-ytdl-core');
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
                opusEncoded: true
            });
        } catch (e) {
            if(e) console.warn(e);
        }
    }
}