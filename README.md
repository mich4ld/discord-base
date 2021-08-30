
![Logo](https://user-images.githubusercontent.com/43048524/131166986-97187bd2-57e0-451f-8a1e-b54136a8b42b.png)
# Discord bot TypeScript base
Simple TypeScript abstraction for creating Discord bots (using `discord.js` and `typedi`)

### Installation
`Important`: Node.js 16.6.0 or newer is required.
```sh
npm i @mich4l/discord-base
```

### Concepts
![concepts](https://user-images.githubusercontent.com/43048524/131388363-e953424d-9c01-4088-a6af-0b2c48c44b17.png)
</br>
#### Types of objects:
- Command Handler - it's giving you access to Message object and array of command arguments (strings)
- Event Handler - it's giving you access to object from event listener (for example: Message, GuildEmoji, GuildChannel...)
- Service - you can use it for busisness logic of your bot 

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
import { Handler, CommandHandler } from '@mich4l/discord-base';
import { Message } from 'discord.js';
import { ExampleService } from '../services/exampleService';

@Handler()
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

### Events
You may want react not only to commands - there is also Events concept

`messageDeleted.ts`:
```ts
import { EventHandler, Handler } from '@mich4l/discord-base';
import { ExampleService } from '../services/exampleService';

@Handler()
class MessageDeletedEvent implements EventHandler {
    constructor(
        private readonly exampleService: ExampleService
    ) {}

    handle(msg: Message) {
        const message = this.exampleService.getMessage();
        msg.channel.send(message);
    }
}
```

`index.ts`:
```ts
// some code...
discordBot.addEvent('messageDelete', MessageDeleted)
```

### React to every message that is not command:
```ts
@Handler()
class MessageEvent implements EventHandler {
    constructor(
        private readonly exampleService: ExampleService
    ) {}

    handle(msg: Message) {
        const message = this.exampleService.getMessage();
        msg.channel.send(message);
    }
}

discordBot.addAnyMessageHandler(MessageEvent)
```
or react to literally every message (commands too):
```ts
@Handler()
class MessageEvent implements EventHandler {
    constructor(
        private readonly exampleService: ExampleService
    ) {}

    handle(msg: Message) {
        const message = this.exampleService.getMessage();
        msg.channel.send(message);
    }
}

discordBot.addEvent('messageCreate'. MessageEvent)
```

### Configuration example
`Notice`: option `avatarURL` changes bot's avatar every time when app starts.
```ts
const discordBot = new DiscordBot({
    token,
    activity: 'CS:GO', // default: undefined
    name: 'New bot name', // default: undefined
    avatarURL: '<PHOTO_URL>', // default: undefined
    prefix: '!',
    ignoreBots: true // ignoring commands from other bots
    // ... and more from discord.js ClientOptions
});
```

### DiscordBot instance methods example
```ts
const discordBot = new DiscordBot();

discordBot
.addCommand('help', HelpCommand)
.addCommandForRoles('log', LogCommand, ['Mod', 'Pro'])
.addGenericHandler(HelpCommand) // by default bot is ignoring not registered commands (you can return !help command or just return error message);
.addAnyMessageHandler(AnyMessage) // handling every message (commands are exception)
.removeCommand('help')
.removeAnyMessageHandler()
.clearCommands() // removes all commands
.addEvent('messageDelete', MessageDeleted)
.setupClient(client => {
    console.log(client); // access to client object for more complex operations (read discord.js docs)
});
```

```ts
discordBot.destroy() // logout bot;
```