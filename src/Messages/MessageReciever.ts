module.exports = class BaseMessageReciever {
    message: any;
    messageText: string = '';
    type: string = '';
    user: string = '';
    args: Array<any> = [];
    constructor(
        message: any
    ){
        this.setupMessage(message)
    }
    private setupMessage(message:Object) {
        this.message = message;

        let msgArr = this.message.content.split(' '),
            msgType = msgArr[0].replace('>>', ''),
            isStringSearch = msgArr.length > 1 ? !msgArr[1].includes('youtube.com') || msgArr.length > 2 : msgArr.join('');

        if(!msgArr[0].includes('>>')) this.type = 'not-valid';
        else {
            this.messageText = this.message.content;
            this.type = `${msgType}-${isStringSearch ? 'search' : 'link'}`;
            this.args = msgArr.slice(1);
            this.user = this.message.author.username;
        }
    } 
}