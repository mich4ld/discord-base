import { Message } from "discord.js";
import Container from "typedi";
import { CommandHandler } from "./commands";

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

export async function executeHandler(handler: any, msg: Message, args: string[], commandName: string) {
    try {
        const handlerInstance = Container.get<CommandHandler>(handler);
        await handlerInstance.handle(msg, args, commandName);
    } catch (error) {
        console.log(`Error: Critial error`);
        console.error(error);
    }
}