const { URL } = require('url');
const Log = require('./Log');

module.exports = class Connection {
    
    /**
     * Constructs connection to a Convertigo server.
     * @param {string} url URL of Convertigo server.
     * @param {string} username Username.
     * @param {string} password Password.
     */
    constructor(url, username, password) {
        this._url = url;
        this._username = username;
        this._password = password;
        this._cookie = null;
    }

    /**
     * Get Convertigo server URL.
     * @return {url} Convertigo server URL.
     */
    get url() {
        return this._url;
    }

    /**
     * Get username.
     * @returns {string} Username.
     */
    get username() {
        return this._username;
    }

    /**
     * Get password.
     * @returns {string} Password.
     */
    get password() {
        return this._password;
    }

    /**
     * Get cookie.
     * @return {string} Cookie.
     */
    get cookie() {
        return this._cookie;
    }

    /**
     * Set cookie.
     * @param {string} cookie New cookie value.
     */
    set cookie(cookie) {
        this._cookie = cookie;
    }

    /**
     * Create a logger dedicated to some action on Convertigo server.
     * @param {string} action Action appended to label.
     */
    logger(action) {
        var label = '';
        if (this._url) {
            var url = new URL(this._url);
            var host = url.hostname;
            var dot = host.indexOf('.');
            if (dot > 0) {
                host = host.substring(0, dot);
            }
            label += host + ':' + url.port;
        } else {
            label += '[no server]';
        }
        if (action && action != '') {
            label += ' ' + action;
        }
        return Log.logger(label.trim());
    }
}
