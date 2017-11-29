const Request = require('../util/Request');
const Connection = require('../util/Connection');

const BASE_ENDPOINT = '/admin/services/engine';
const AUTH_ENDPOINT = BASE_ENDPOINT + '.Authenticate';
const STATUS_ENDPOINT = BASE_ENDPOINT + '.GetStatus';
const MONITOR_ENDPOINT = BASE_ENDPOINT + '.Monitor';
const START_ENDPOINT = BASE_ENDPOINT + '.Start';
const STOP_ENDPOINT = BASE_ENDPOINT + '.Stop';

module.exports = class EngineService {

    constructor() { }

    /**
     * Login user.
     * @param {Connection} con Convertigo server connection.
     */
    login(con) {
        var logger = con.logger('Engine.login');
        logger.info('Login user "%s"...', con.username);
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: AUTH_ENDPOINT,
                form: {
                    authType: 'login',
                    authUserName: con.username,
                    authPassword: con.password
                },
            })
            .then((response) => {
                // Login error
                var error = response.json.admin.error;
                if (error) {
                    logger.error('Login failed: ' + error);
                    reject('Login failed: ' + error);
                } else {
                    logger.info('Login successful');
                    con.cookie = response.headers['set-cookie'];
                    logger.debug('Cookie: %s', con.cookie);
                    resolve(response);
                }
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Logout user.
     * @param {Connection} con Convertigo server connection.
     */
    logout(con) {
        var logger = con.logger('Engine.logout');
        logger.info('Logout user "%s"...', con.username);
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: AUTH_ENDPOINT,
                form: { authType: 'logout' },
            })
            .then((response) => {
                logger.info('Logout successful');
                con.cookie = null;
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Get engine status.
     * @param {Connection} con Convertigo server connection.
     */
    status(con) {
        var logger = con.logger('Engine.status');
        logger.info('Getting engine status...');
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: STATUS_ENDPOINT
            })
            .then((response) => {
                response.engine = {
                    version: response.json.admin.version[0]['$'].engine,
                    status: response.json.admin.engineState[0],
                    uptime: response.json.admin.runningElapse[0]['$'],
                }
                response.engine.uptime.total = response.json.admin.runningElapse[0]['_'];
                logger.debug('Engine info: ' + JSON.stringify(response.engine));
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Start engine.
     * @param {Connection} con Convertigo server connection.
     */
    start(con) {
        var logger = con.logger('Engine.start');
        logger.info('Starting engine...');
        return Request.post(con, logger, { uri: START_ENDPOINT });
    }

    /**
     * Stop engine.
     * @param {Connection} con Convertigo server connection.
     */
    stop(con) {
        var logger = con.logger('Engine.stop');
        logger.info('Stopping engine...');
        return Request.post(con, logger, { uri: STOP_ENDPOINT });
    }

    /**
     * Start engine.
     * @param {Connection} con Convertigo server connection.
     */
    restart(con) {
        var logger = con.logger('Engine.restart');
        logger.info('Restarting engine...');
        return this.stop(con)
        .then(() => { 
            return this.start(con);
        });
    }
    
}