const { createLogger, format, transports } = require('winston');

var _transports = [ new transports.Console({ level: 'info' }) ];

const Log = class Log {

    constructor() { }

    static init(filename) {
        _transports = [
            new transports.Console({ level: 'info' }),
            new transports.File({ filename: filename + '.debug.log', level: 'debug' }),
            new transports.File({ filename: filename + '.error.log', level: 'error' })
        ];

        return Log;
    }

    /**
     * 
     * @param {String} label 
     */
    static logger(label) {
        //return new Logger(label);
        return createLogger({
            format: format.combine(
                format.label({ label: label }),
                format.timestamp(),
                format.splat(),
                format.printf(info => { 
                    return `${info.timestamp} ${info.level.toUpperCase()} [${info.label}] ${info.message}`;
                })),
            transports: _transports
        })
    }
}

module.exports = Log;