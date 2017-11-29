const Request = require('../util/Request');
const Connection = require('../util/Connection');
const Log = require('../util/Log');
const LOGGER = function(con) { return Log.logger('RolesService', con); };

const BASE_ENDPOINT = '/admin/services/roles';
const IMPORT_ENDPOINT = BASE_ENDPOINT + '.Import';

const IMPORT_MODES = [
    { 'name': 'CLEAR_IMPORT', 'qs': { 'action-import': 'clear-import' }},
    { 'name': 'MERGE_PRIORITY_SERVER', 'qs': { 'action-import': '', 'priority': 'priority-server' }},
    { 'name': 'MERGE_PRIORITY_IMPORT', 'qs': { 'action-import': '', 'priority': 'priority-import' }}
];

module.exports = class RolesService {

    constructor() { 
        this.importModes = {
            CLEAR_IMPORT: 0,
            MERGE_PRIORITY_SERVER: 1,
            MERGE_PRIORITY_IMPORT: 2
        }
    }
    
    /**
     * Import rôles
     * @param {Connection} con Convertigo server connection.
     * @param {*} file Global symbols .properties file
     * @param {number} mode Should be one of CLEAR_IMPORT, MERGE_PRIORITY_SERVER, MERGE_PRIORITY_IMPORT.
     */
    import(con, file, mode) {
        var logger = LOGGER(con);
        logger.info('Importing roles...');
        var importMode = IMPORT_MODES[mode];
        logger.debug('Mode: ' + importMode.name);
        return new Promise((resolve, reject) => {
            Request.postFile(con, logger, file, {
                uri: IMPORT_ENDPOINT,
                qs: importMode.qs
            })
            .then((response) => {
                // response body is <admin service="roles.Import"><message>The users file has been successfully imported.</message></admin>
                response.message = response.json.admin.message[0];
                logger.info(response.message);
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Clear server properties and import file.
     * @param {Connection} con Convertigo server connection.
     * @param {*} file Global symbols .properties file.
     */
    clearImport(con, file) {
        return this.import(con, file, this.importModes.CLEAR_IMPORT);
    }

    /**
     * Merge symbols with priority to server properties.
     * @param {Connection} con Convertigo server connection.
     * @param {*} file Global symbols .properties file.
     */
    mergePriorityServer(con, file) {
        return this.import(con, file, this.importModes.MERGE_PRIORITY_SERVER);
    }

    /**
     * Merge symbols with priority to import file properties.
     * @param {Connection} con Convertigo server connection.
     * @param {*} file Global symbols .properties file.
     */
    mergePriorityImport(con, file) {
        return this.import(con, file, this.importModes.MERGE_PRIORITY_IMPORT);
    }

}
