import { ActivityOptions, Client, ClientEvents, Message } from 'discord.js';
import { parseCommand, logError } from "./utils";
import { buildConfig, DEFAULT_INTENTS, DiscordConfig, InputDiscordConfig } from "./config";
import { CommandHandler, EventHandler, executeCommandHandler, executeEventHandler, getEventHandler } from './handlers';

interface Command {
    handler: typeof CommandHandler;
    roles?: string[];
}

type ClientSetup = (client: Client) => any;

export class DiscordBot {
    private config: DiscordConfig;
    private client: Client<boolean>;

    // command sets:
    private commands: Map<string, Command> = new Map();
    private genericHandler?: typeof CommandHandler;
    private messageHandler?: typeof EventHandler;


    constructor(config: InputDiscordConfig = {}) {
        const { appConfig, clientConfig } = buildConfig(config);
        this.config = appConfig;

        this.client = new Client({
            ...clientConfig,
            intents: clientConfig.intents || DEFAULT_INTENTS,
        });

        this.bootstrapBot();
    }

    addEvent(event: keyof ClientEvents, handler: typeof EventHandler) {
        const handleFunc = getEventHandler(handler);
        this.client.on(event, handleFunc as any);
        return this;
    }

    addCommandForRoles(command: string, handler: typeof CommandHandler, roles: string[]) {
        this.commands.set(command, { roles, handler });
        return this;
    }


    addCommand(command: string, handler: typeof CommandHandler) {
        this.commands.set(command, { handler });
        return this;
    }

    addAnyMessageHandler(handler: typeof EventHandler) {
        this.messageHandler = handler;
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

    removeAnyMessageHandler() {
        this.messageHandler = undefined;
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

    setupClient(method: ClientSetup) {
        method(this.client);
        return this;
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

    private onMessageCreate = async (msg: Message) => {
        if (msg.author.bot && this.config.ignoreBots) {
            return;
        }

        const parsedCommand = parseCommand(msg.content, this.config.prefix);
        if(parsedCommand) {
            const { commandName, args } = parsedCommand;
            await this.handleCommand(msg, args, commandName);
            return;
        }

        if (this.messageHandler) {
            await executeEventHandler(this.messageHandler, msg);
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
