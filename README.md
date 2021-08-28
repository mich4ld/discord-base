
![Logo](https://user-images.githubusercontent.com/43048524/131166986-97187bd2-57e0-451f-8a1e-b54136a8b42b.png)
# Discord bot TypeScript base
Simple TypeScript abstraction for creating Discord bots (using `discord.js` and `typedi`)

### Installation
```sh
npm i @mich4l/discord-base
```

### Code example
`index.ts`
```ts
import { DiscordBot } from '@mich4l/discord-base';
import { ExampleCommand } from './commands/exampleCommand';
import { token } from './config.json'

const bot = new DiscordBot({
    token,
    activity: 'CS:GO',
});

bot.addCommand('example', ExampleCommand);
```

`exampleCommand.ts`
```ts
import { Command, CommandHandler } from '@mich4l/discord-base';
import { Message } from 'discord.js';
import { ExampleService } from '../services/exampleService';

@Command()
export class ExampleCommand implements CommandHandler {
    constructor(
        private readonly exampleService: ExampleService
    ) {}

    handle(msg: Message, args: string[]) {
        const message = this.exampleService.getMessage();

        msg.reply(message);
    }
}
```

`exampleService.ts`
```ts
import { Service } from '@mich4l/discord-base';

@Service()
export class ExampleService {
    getMessage() {
        return 'Hello world';
    }
}
```

### Configuration example
`Notice`: option `avatarURL` changes bot's avatar every time when app starts.
```ts
const discordBot = new DiscordBot({
    token, // process.env.DISCORD_TOKEN by default, throw error if not specified
    activity: 'CS:GO', // default: undefined
    name: 'New bot name', // default: undefined
    avatarURL: '<PHOTO_URL>', // default: undefined
    prefix: '!',
    ignoreBots: true // ignoring commands from other bots
});
```

### DiscordBot instance methods example
```ts
const discordBot = new DiscordBot();

discordBot
.addCommand('help', HelpCommand)
.addCommandForRoles('log', LogCommand, ['Mod', 'Pro'])
.addListeners(client => {
    // access to client variable (read discord.js docs)
})
.removeCommand('help')
.clearCommands() // removes all commands
```
