import { CommandHandler } from "./commands";
import { ActivityOptions, Client, Message } from 'discord.js';
import { Container } from 'typedi';
import { executeHandler, logError, parseCommand } from "./utils";
import { buildConfig, DEFAULT_INTENTS, DiscordConfig, InputDiscordConfig } from "./config";

interface Command {
    handler: any;
    roles?: string[];
}

export class DiscordBot {
    private config: DiscordConfig;
    private client: Client<boolean>;

    // command sets:
    private commands: Map<string, Command> = new Map();
    private genericHandler: any;


    constructor(config: InputDiscordConfig) {
        const { appConfig, clientConfig } = buildConfig(config);
        this.config = appConfig;

        this.client = new Client({
            ...clientConfig,
            intents: clientConfig.intents || DEFAULT_INTENTS,
        });

        this.bootstrapBot();
    }

    addCommandForRoles(command: string, handler: any, roles: string[]) {
        this.commands.set(command, { roles, handler });
        return this;
    }


    addCommand(command: string, handler: any) {
        this.commands.set(command, { handler });
        return this;
    }

    addGenericHandler(handler: any) {
        this.genericHandler = handler;
        return this;
    }

    removeGenericHandler() {
        this.genericHandler = undefined;
        return this;
    }

    removeCommand(command: string) {
        const isRemoved = this.commands.delete(command);
        if (isRemoved) {
            console.log(`Notice: Command ${this.config.prefix}${command} has been removed`);
        }

        return this;
    }

    clearCommands() {
        this.commands.clear();
        console.log(`Notice: All commands removed`);
        return this;
    }

    addListeners(method: (client: Client) => any) {
        method(this.client);
        return this;
    }

    private configureActivity(activity?: ActivityOptions | string) {
        if (this.client.user && activity) {
            if (typeof activity === 'string') {
                this.client.user.setActivity({ name: activity });
            } else {
                this.client.user.setActivity(activity);
            }
        }
    }

    private async configureName(name?: string) {
        if (this.client.user && name && this.client.user.username !== name) {
            try {
                const oldName = this.client.user.username;
                await this.client.user.setUsername(name);
                console.log(`Notice: Changed bot's name from ${oldName} to ${name}`);
            } catch (err) {
                logError(err);
            }
        }
    }

    private async configureAvatar(url?: string) {
        if (this.client.user && url) {
            try {
                await this.client.user.setAvatar(url);      
                console.log("Notice: Changed bot's avatar");
            } catch (err) {
                logError(err);
            }
        }
    }

    private async handleCommand(msg: Message, args: string[], commandName: string) {
        const command = this.commands.get(commandName);
        if (!command) {
            if (this.genericHandler) {
                await executeHandler(this.genericHandler, msg, args, commandName);
            }

            return;
        }

        if (command.roles && msg.member) {
            const hasPermission = msg.member.roles.cache.some(role => command.roles!.includes(role.name));
            if (!hasPermission) {
                return;
            }
        }

        await executeHandler(command.handler, msg, args, commandName);
    }

    private onMessageCreate = async (msg: Message) => {
        if (msg.author.bot && this.config.ignoreBots) {
            return;
        }

        const parsedCommand = parseCommand(msg.content, this.config.prefix);
        if(parsedCommand) {
            const { commandName, args } = parsedCommand;
            await this.handleCommand(msg, args, commandName);
        }
    }

    private onReady = async () => {
        this.configureActivity(this.config.activity);
        await this.configureName(this.config.name);
        await this.configureAvatar(this.config.avatarURL);
        
        console.log(`Logged in as ${this.client.user?.tag}!`);
    }

    private onError = (err: Error) => {
        console.log(`Error: ${err.message}`)
    }

    private bootstrapBot() {
        this.client
            .on("ready", this.onReady)
            .on("messageCreate", this.onMessageCreate)
            .on('error', this.onError)

        this.client.login(this.config.token);
    }
}
