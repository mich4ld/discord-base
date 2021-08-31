import { Guild, GuildBan, GuildChannel, GuildEmoji, GuildMember, Interaction, Invite, Message, PartialUser, RateLimitData, Role, Sticker, ThreadChannel, Typing, User } from "discord.js";
import Container from "typedi";
import { logError } from "./utils";

export class CommandHandler {
    constructor(...services: any[]) {

    }

    handle(msg: Message, args: string[]): any {
        console.log('Handling command')
    }
}

export type EventFromListener = (
    Message | 
    GuildEmoji | 
    GuildChannel | 
    GuildBan | 
    Guild | 
    GuildMember | 
    Invite | 
    Role | 
    Interaction | 
    ThreadChannel | 
    Typing | 
    Sticker | 
    RateLimitData | 
    (User | PartialUser)
)

export class EventHandler {
    constructor(...services: any[]) {

    }

    handle(e: EventFromListener): any {
        console.log('Handling events')
    }
}

function handlerError(err: unknown) {
    logError(err);
}

export async function executeCommandHandler(handler: typeof CommandHandler, msg: Message, args: string[]) {
    const handlerInstance = Container.get<CommandHandler>(handler);
    try {
        await handlerInstance.handle(msg, args);
    } catch (err) {
        handlerError(err);
    }
}

export async function executeEventHandler(handler: typeof EventHandler, e: EventFromListener) {
    const handlerInstance = Container.get<EventHandler>(handler);
    try {
        await handlerInstance.handle(e);
    } catch (err) {
        handlerError(err);
    }
}

export function getEventHandler(handler: typeof EventHandler) {
    return async function (e: EventFromListener) {
        await executeEventHandler(handler, e);
    }
}   
