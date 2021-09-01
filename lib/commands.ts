import { Message } from "discord.js";
import { DiscordConfig } from "./config";
import { globals } from "./globals";
import { CommandHandler, executeCommandHandler } from "./handlers";
import { BaseLogger, getLogger } from "./logger";
import { parseCommand } from "./utils";

interface Command {
    handler: typeof CommandHandler;
    roles?: string[];
}

export class Commands {
    private commands: Map<string, Command> = new Map();
    private genericHandler?: typeof CommandHandler;
    private logger: BaseLogger = getLogger(globals.logger);

    constructor(
        private config: DiscordConfig,
    ) {}

    async parseMessage (msg: Message) {
        if (msg.author.bot && this.config.ignoreBots) {
            return true;
        }

        const parsedCommand = parseCommand(msg.content, this.config.prefix);
        if(parsedCommand) {
            const { commandName, args } = parsedCommand;
            await this.handleCommand(msg, args, commandName);
            return true;
        }

        return false;
    }

    private async handleCommand(msg: Message, args: string[], commandName: string) {
        const command = this.commands.get(commandName);
        if (!command) {
            if (this.genericHandler) {
                await executeCommandHandler(this.genericHandler, msg, args);
            }

            return;
        }

        if (command.roles && msg.member) {
            const hasPermission = msg.member.roles.cache.some(role => command.roles!.includes(role.name));
            if (!hasPermission) {
                return;
            }
        }

        await executeCommandHandler(command.handler, msg, args);
    }

    addCommandForRoles(command: string, handler: typeof CommandHandler, roles: string[]) {
        this.commands.set(command, { roles, handler });
        return this;
    }

    addCommand(command: string, handler: typeof CommandHandler) {
        this.commands.set(command, { handler });
        return this;
    }

    removeCommand(command: string) {
        const isRemoved = this.commands.delete(command);
        if (isRemoved) {
            this.logger.notice(`Command ${this.config.prefix}${command} has been removed`);
        }

        return this;
    }

    clearCommands() {
        this.commands.clear();
        this.logger.notice(`All commands removed`);
        return this;
    }

    addGenericHandler(handler: typeof CommandHandler) {
        this.genericHandler = handler;
        return this;
    }

    removeGenericHandler() {
        this.genericHandler = undefined;
        return this;
    }
}