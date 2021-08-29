import { Message } from "discord.js";

export class CommandHandler {
    handle(msg: Message, args: string[], commandName?: string): any {
        console.log('Handling command')
    }
}
