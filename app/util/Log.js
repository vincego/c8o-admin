const util = require('util');
const winston = require('winston');
const bunyan = require('bunyan');
const { URL } = require('url');
const Connection = require('./Connection');

const DEBUG_IN_CONSOLE = false;
const OUTPUT_CONSOLE = 0;
const OUTPUT_WINSTON = 1;
const OUTPUT_BUNYAN = 2;
var outputMode = OUTPUT_CONSOLE;

var consoleMode = true;
var consoleModeDebug = false;
var winstonTransports = [ new winston.transports.Console({ level: 'info' }) ];
var bunyanStreams = [ { level: 'info', stream: process.stdout } ];
var ip4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const Log = class Log {

    constructor() { }

    static init(filename) {
		if (outputMode == OUTPUT_WINSTON) {
			winstonTransports = [
				new winston.transports.Console({ level: 'info' }),
				new winston.transports.File({ filename: filename + '.debug.log', level: 'debug' }),
				new winston.transports.File({ filename: filename + '.error.log', level: 'error' })
			];
		}
		else if (outputMode == OUTPUT_BUNYAN) {
			bunyanStreams = [
				{ level: 'info', stream: process.stdout },
				{ level: 'debug', path: filename + '.debug.log' },
				{ level: 'error', path: filename + '.error.log' }
			];
		}
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
            if ((dot > 0) && !host.match(ip4Regex)) {
                host = host.substring(0, dot);
            }
            infoLabel += '@' + host + ':' + url.port;
        }
		if (outputMode == OUTPUT_CONSOLE) {
			return {
				error: function(m,e) { console.log(new Date().toISOString() + " ERROR [" + infoLabel + "] " + m); console.log(e); },
				warn: function(m) { console.log(new Date().toISOString() + " WARN [" + infoLabel + "] " + m); },
				info: function() { console.log(new Date().toISOString() + " INFO [" + infoLabel + "] " + util.format.apply(null,arguments)); },
				debug: function() { if (DEBUG_IN_CONSOLE) { console.log(new Date().toISOString() + " DEBUG [" + infoLabel + "] " + util.format.apply(null,arguments)); }},
			};
		}
		else if (outputMode == OUTPUT_WINSTON) {
			return winston.createLogger({
				format: winston.format.combine(
					winston.format.label({ label: infoLabel }),
					winston.format.timestamp(),
					winston.format.splat(),
					winston.format.printf(info => { 
						return `${info.timestamp} ${info.level.toUpperCase()} [${info.label}] ${info.message}`;
					})),
				transports: winstonTransports
			});
		}
		else if (outputMode == OUTPUT_BUNYAN) {
			return bunyan.createLogger({
				name: infoLabel,
				streams : bunyanStreams
			});
		}
    }

	static consoleLogger(label) {
	}
}

module.exports = Log;