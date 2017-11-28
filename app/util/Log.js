const winston = require('winston');

var wlogger = null;

const Logger = class Logger {

    constructor(tag) {
        this.tag = tag;
    }
    
    tagMessage(message) {
        return '[' + this.tag + '] ' + message;
    }

    debug(message, args) {
        wlogger.log('debug', this.tagMessage(message));
    }
    
    info(message, args) {
        wlogger.log('info', this.tagMessage(message));
    }
    
    warn(message, args) {
        wlogger.log('warn', this.tagMessage(message));
    }
    
    error(message, args) {
        wlogger.log('error', this.tagMessage(message));
    }
}

const Log = class Log {

    constructor() { }

    static init(filename) {
        wlogger = winston.createLogger({
            format: winston.format.simple(),
            /*(info) => {
                return info.timestamp + ' ' + info.label + ' ' + info.level + ': ' + info.message;
            }*/
            transports: [
                new winston.transports.Console({ level: 'info' }),
                new winston.transports.File({ filename: filename + '.debug.log', level: 'debug' }),
                new winston.transports.File({ filename: filename + '.error.log', level: 'error' })
            ]
        });
    }

    /**
     * 
     * @param {String} tag 
     */
    static logger(tag) {
        return new Logger(tag);
    }
}

Log.Logger = Logger;
Log.init('app');

module.exports = Log;