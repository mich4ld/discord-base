import { globals } from "./globals";
import { getLogger } from "./logger";

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
    const logger = getLogger(globals.logger);

    if (err instanceof Error) {
        logger.error(err.message);
    } else {
        logger.error(`Critical error`);
    }

    logger.error(err);
}