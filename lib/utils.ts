import { Message } from "discord.js";
import Container from "typedi";
import { CommandHandler, EventFromListener, EventHandler } from "./commands";

export function joinArgs(args: string[]) {
    if (!args.length) {
        return;
    }

    return args.join(' ');
}

export function parseCommand(content: string, prefix: string) {
    if (content.startsWith(prefix)) {
        const commandWithPrefix = content.split(prefix);
        const [ commandName, ...args ] = commandWithPrefix[1].split(' ');

        return { commandName, args }
    }

    return;
}

export function logError(err: unknown) {
    if (err instanceof Error) {
        console.log('Error:', err.message);
    } else {
        console.error(err);
    }
}

function handlerError(err: unknown) {
    console.log(`Error: Critical error`);
    console.error(err);
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
