import chalk from 'chalk';
import { Service } from './index'
import Container from 'typedi';

function getTimestamp() {
    const date = new Date();
    //const stringDate = date.toLocaleDateString();
    const stringTime = date.toLocaleTimeString();

    return stringTime;
}

export function logWithLabel(labelValue: string, message: any, bgHex: string = '#5865F2', hex: string = '#FFFFFF') {
    const label = chalk.bgHex(bgHex).hex(hex)(labelValue);
    const timestamp = chalk.bold.hex('#636e72')(getTimestamp());
    console.log(label, timestamp, message, '\n');
}

@Service()
export abstract class BaseLogger {
    error(message: any) {
        logWithLabel(' Error: ', message, '#ED4245');
    }

    log(message: any) {
        logWithLabel(' Log: ', message);
    }

    notice(message: any) {
        logWithLabel(' Notice: ', message, '#EB459E');
    }

    warn(message: any) {
        logWithLabel(' Warn: ', message, '#FEE75C', '#000000');
    }

    info(message: any) {
        logWithLabel(' Info: ', message, '#57F287', '#000000');
    }
}

@Service()
export class Logger extends BaseLogger {
}

export function getLogger(logger?: typeof BaseLogger) {
    if (!logger) {
        return Container.get<BaseLogger>(Logger);
    }

    return Container.get<BaseLogger>(logger as typeof Logger);
}