module.exports = class BaseMessageSender {
    interaction: any = {};
    constructor(interaction: any){
        this.interaction = interaction;
    }
    say(msg: string, show_users: boolean = false) {
        this.interaction.reply({content: msg, ephemoral: show_users});
    }
    update(msg: string, show_users: boolean = false){
        this.interaction.followUp({content: msg, ephemoral: show_users});
        this.interaction.deferReply();
    }
}