const log4js = require('log4js');
const { URL } = require('url');
const Connection = require('./Connection');

const defaultConfig = {
    appenders: {
        console: {
            type: "stdout",
            layout: {
                type: "pattern",
                pattern: "%d{hh:mm:ss,SSS} %[%p%] [%c] - %m"
            }
        }
    },
    categories: {
        default: { appenders: [ "console" ], "level": "INFO" }
    }
}
let initialized = false;


const ip4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const Log = class Log {

	constructor() {}

	/**
	 * Initializes log4js configuration
	 * @param {*} log4jsConfig File name or config object
	 */
    static init(log4jsConfig) {
		log4js.configure(log4jsConfig);
		initialized = true;
        return Log;
    }

    /**
     * Creates a new logger instance with connections appended to category
     * @param {String} label 
     * @param {Connection} con 
     */
    static logger(label, con) {
		if (!initialized) {
			Log.init(defaultConfig);
		}
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
		return log4js.getLogger(infoLabel);
    }
}

module.exports = Log;