import { CommandsMap } from "./commands";
import { Client, Message } from 'discord.js';
import { Container } from 'typedi';
import { parseCommand } from "./utils";
import { defaultConfig, DiscordConfig } from "./config";

export class DiscordBot {
    private config: Required<DiscordConfig> = defaultConfig;
    private client: Client<boolean>;

    private commands: CommandsMap = { }

    constructor(config: DiscordConfig) {
        this.config = { ...this.config, ...config };

        if (!process.env.DISCORD_TOKEN && !config.token) {
            throw Error('Error: Token is required!');
        }

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

    private onReady = () => {
        console.log(`Logged in as ${this.client.user?.tag}!`);
        this.client.user?.setActivity(this.config.activity!);
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
