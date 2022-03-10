import { VoiceState } from "discord.js";

export interface Message {
        
}
export interface PlaylistUrl {
    url: String;
}
export interface ServerQueue {
    textChannel: any;
    voiceChannel: VoiceState;
    connection: any;
    songs: Array<string>;
    volume: Number;
    playing: Boolean;
}
export interface GlobalQueue {
    [key: string]: ServerQueue;
}