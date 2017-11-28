const { createLogger, format, transports } = require('winston');

var wlogger = null;

const Logger = class Logger {

    constructor(label) {
        this.label = label;
    }

    debug(message) {
        wlogger.log({
            level: 'debug',
            label: this.label,
            message: message
        });
    }
    
    info(message) {
        wlogger.log({
            level: 'info',
            label: this.label,
            message: message
        });
    }
    
    warn(message, args) {
        wlogger.log({
            level: 'warn',
            label: this.label,
            message: message
        });
    }
    
    error(message, args) {
        wlogger.log({
            level: 'error',
            label: this.label,
            message: message
        });
    }
}

const Log = class Log {

    constructor() { }

    static init(filename) {
        wlogger = createLogger({
            //format: format.simple(),
            format: format.printf(info => { 
                return `[${info.label}] ${info.level}: ${info.message}`;
            }),
            /*(info) => {
                return info.timestamp + ' ' + info.label + ' ' + info.level + ': ' + info.message;
            }*/
            transports: [
                new transports.Console({ level: 'info' }),
                new transports.File({ filename: filename + '.debug.log', level: 'debug' }),
                new transports.File({ filename: filename + '.error.log', level: 'error' })
            ]
        });
    }

    /**
     * 
     * @param {String} label 
     */
    static logger(label) {
        return new Logger(label);
    }
}

Log.Logger = Logger;
Log.init('app');

module.exports = Log;