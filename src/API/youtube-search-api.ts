const axios = require('axios');
const Song = require('../Audio/Song');

interface requestData {
    method: string;
    accept: string;
    url: string;
    reqType: string
    params: {
        key: string,
        part: string,
        playlistId: string,
        maxResults: number,
        snippet: boolean
    };
}

module.exports = class YouTubeRequest {
    method: string = 'GET';
    accept: string = '*/*';
    url: string = 'https://www.googleapis.com/youtube/v3/';
    reqType: string = 'playlistItems';
    isPlaylist: boolean = false;
    private rawRequest: Object = {};
    private params: Object = {};

    constructor(reqData: requestData) {
        this.rawRequest = reqData;
        this.url = reqData.url;
        this.isPlaylist = reqData.url.includes('&list=');
        this.params = reqData.params;
        this.reqType = reqData.reqType;
    }

    convert_id_to_url = (videoID: string) => `https://www.youtube.com/watch?v=${videoID}`;

    listRequest = async () => {
        const data = await axios.request(this.rawRequest).then((res:any) => res.data).catch((err:any) => {
                console.warn('------Error in response to playlist request-------', err);
                return console.warn('there was an issue with your YouTube request...\n I\'d sugest checking your quota')
            });
        
            const details = data.items.map((arrItem:any) => {
                const {snippet} = arrItem;
                let song = new Song(
                        arrItem.snippet.title,
                        arrItem.snippet.thumbnails.default,
                        this.convert_id_to_url(snippet.resourceId.videoId)
                    );   
                return song;
            }); 
        
        return await details;
    }
    videoRequest = async (searchStr:string) => {
        console.log(searchStr)
        let reqParams = {
            method: 'GET',
            accept: '*/*',
            url: `https://www.googleapis.com/youtube/v3/search`,
            params: {
                key: process.env.YOUTUBE_API_KEY,
                part: 'id, snippet',
                maxResults: '1',
                type: 'video',
                q: searchStr
            }
        }
        const videoId = await axios.request(reqParams).then( (resp:any) => {
            let responseData = resp.data.items[0], songData = {
                id: responseData.id.videoId,
                title: responseData.snippet.title,
                url: this.convert_id_to_url(responseData.id.videoId)
            };
            return new Song(songData)
        }).catch((err:any) => {
            console.warn('------Error in response to song request-------', err);
            return console.warn('there was an issue with your YouTube request...\n I\'d sugest checking your quota')
        });
        return videoId;
    }
}