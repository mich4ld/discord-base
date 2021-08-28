import { CommandsMap } from "./commands";
import { ActivityOptions, Client, Message } from 'discord.js';
import { Container } from 'typedi';
import { parseCommand } from "./utils";
import { buildConfig, DiscordConfig } from "./config";

export class DiscordBot {
    private config: DiscordConfig;
    private client: Client<boolean>;
    private commands: CommandsMap = { }

    constructor(config: Partial<DiscordConfig>) {
        this.config = buildConfig(config);
        this.client = new Client({
            intents: this.config.intents,
        });

        this.bootstrapBot();
    }

    addCommand(command: string, handler: any) {
        this.commands[command] = handler;
        return this;
    }

    removeCommand(command: string) {
        delete this.commands[command];
        return this;
    }

    addListeners(method: (client: Client) => any) {
        method(this.client);
        return this;
    }

    private async handleCommand(msg: Message, args: string[], command: string) {
        const handler = this.commands[command];
        if (!handler) {
            console.log('Notice: Command not exists');
            return;
        }

        try {
            const handlerInstance = Container.get(handler);
            await handlerInstance.handle(msg, args, command);
        } catch (error) {
            console.log(`Error: Critial error`);
            console.error(error);
        }
    }

    private onMessageCreate = async (msg: Message) => {
        const parsedCommand = parseCommand(msg.content, this.config.prefix);
        if(parsedCommand) {
            const { commandName, args } = parsedCommand;
            await this.handleCommand(msg, args, commandName);
        }
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

    private configureName(name?: string) {
        if (this.client.user && name) {
            this.client.user.setUsername(name);
        }
    }

    private configureAvatar(url?: string) {
        if (this.client.user && url) {
            this.client.user.setAvatar(url);
        }
    }

    private onReady = () => {
        console.log(`Logged in as ${this.client.user?.tag}!`);
        this.configureActivity(this.config.activity);
        this.configureName(this.config.name);
        this.configureAvatar(this.config.avatarURL);
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
