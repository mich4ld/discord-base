import chalk from 'chalk';
import { Service } from './index'
import Container from 'typedi';
import { globals } from './globals';

enum Colors {
    Blurple = '#5865F2',
    Green = '#57F287',
    Yellow = '#FEE75C',
    Fuchsia = '#EB459E',
    Red = '#ED4245',
    White = '#FFFFFF',
    Black = '#000000',
    Gray = '#636e72',
}

function getTimestamp() {
    const date = new Date();
    return date.toLocaleTimeString();
}

export function logWithLabel(labelValue: string, message: any, bgHex: string = Colors.Blurple, hex: string = Colors.White) {
    const label = chalk.bold.bgHex(bgHex).hex(hex)(labelValue);
    const timestamp = chalk.bold.hex(Colors.Gray)(getTimestamp());
    console.log(label, timestamp, message, '\n');
}

@Service()
export abstract class BaseLogger {
    error(message: any) {
        logWithLabel(' Error: ', message, Colors.Red);
    }

    log(message: any) {
        logWithLabel(' Log: ', message);
    }

    notice(message: any) {
        logWithLabel(' Notice: ', message, Colors.Fuchsia);
    }

    warn(message: any) {
        logWithLabel(' Warn: ', message, Colors.Yellow, Colors.Black);
    }

    info(message: any) {
        logWithLabel(' Info: ', message, Colors.Green, Colors.Black);
    }
}

@Service()
export class Logger extends BaseLogger {
}

@Service()
export class LoggerService {
    get logger() {
        return getLogger(globals.logger);
    }
}

export function getLogger(logger: typeof BaseLogger) {
    return Container.get<BaseLogger>(logger as typeof Logger);
}