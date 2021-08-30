import { Guild, GuildBan, GuildChannel, GuildEmoji, GuildMember, Interaction, Invite, Message, PartialUser, RateLimitData, Role, Sticker, ThreadChannel, Typing, User } from "discord.js";

export class CommandHandler {
    handle(msg: Message, args: string[]): any {
        console.log('Handling command')
    }
}

export type EventFromListener = Message | GuildEmoji | GuildChannel | GuildBan | Guild | GuildMember | Invite | Role | Interaction | ThreadChannel | Typing | Sticker | RateLimitData | (User | PartialUser)

export class EventHandler {
    handle(e: EventFromListener): any {
        console.log('Handling events')
    }
}
