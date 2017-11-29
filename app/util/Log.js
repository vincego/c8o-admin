const { createLogger, format, transports } = require('winston');
const { URL } = require('url');
const Connection = require('./Connection');

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
     * @param {Connection} con 
     */
    static logger(label, con) {
        var infoLabel = label;
        if (con) {
            var url = new URL(con.url);
            var host = url.hostname;
            var dot = host.indexOf('.');
            if (dot > 0) {
                host = host.substring(0, dot);
            }
            infoLabel += '@' + host + ':' + url.port;
        }
        return createLogger({
            format: format.combine(
                format.label({ label: infoLabel }),
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