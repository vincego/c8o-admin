const Request = require('../util/Request');
const Connection = require('../util/Connection');

const BASE_ENDPOINT = '/admin/services/global_symbols';
const LIST_ENDPOINT = BASE_ENDPOINT + '.List';
const ADD_ENDPOINT = BASE_ENDPOINT + '.Add';
const EDIT_ENDPOINT = BASE_ENDPOINT + '.Edit';
const DELETE_ENDPOINT = BASE_ENDPOINT + '.Delete';
const IMPORT_ENDPOINT = BASE_ENDPOINT + '.Import';
const IMPORT_MODES = [
    { 'name': 'CLEAR_IMPORT', 'qs': { 'action-import': 'clear-import' }},
    { 'name': 'MERGE_PRIORITY_SERVER', 'qs': { 'action-import': '', 'priority': 'priority-server' }},
    { 'name': 'MERGE_PRIORITY_IMPORT', 'qs': { 'action-import': '', 'priority': 'priority-import' }}
];

module.exports = class GlobalSymbolsService {

    constructor() { 
        this.importModes = {
            CLEAR_IMPORT: 0,
            MERGE_PRIORITY_SERVER: 1,
            MERGE_PRIORITY_IMPORT: 2
        }
    }

    /**
     * List global symbols.
     * @param {Connection} con Convertigo server connection.
     * @param {string} names Optional names of the symbols to list.
     */
    list(con, names) {
        var logger = con.logger('global symbols list');
        logger.info('Listing global symbol...');
        logger.debug('Names: ' + names);
        return new Promise((resolve, reject) => {
            Request.post(con, logger, { uri: LIST_ENDPOINT })
            .then((response) => {
                // response body is <admin service="global_symbols.List"><symbols><symbol name="xxx" value="xxx"/></symbols></admin>
                response.symbols = {};
                var symbols = response.json.admin.symbols[0].symbol;
                for (var i=0; i< symbols.length; i++) {
                    var symbol = symbols[i]['$'];
                    if (!names || names.indexOf(symbol.name) >= 0) {
                        response.symbols[symbol.name] = symbol.value;
                    }
                }
                logger.debug('Symbols: ' + JSON.stringify(response.symbols));
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Get a global symbol, rejecting if symbol does not exist.
     * @param {Connection} con Convertigo server connection.
     * @param {string} name Name of the symbol to get.
     */
    get(con, name) {
        return new Promise((resolve, reject) => {
            this.list(con, [ name ])
            .then((response) => {
                if (name in response.symbols) {
                    resolve(response);
                } else {
                    reject('Global symbol does not exists: ' + name);
                }
            })
            .catch((error) => {
                reject(error);
            });
        });
    }
        
    /**
     * Add a global symbol, rejecting if symbol already exists.
     * @param {Connection} con Convertigo server connection.
     * @param {string} name Name of the symbol to add.
     * @param {string} value Value of the symbol to add.
     */
    add(con, name, value) {
        var logger = con.logger('global symbols add');
        logger.info('Adding global symbol...');
        logger.debug('Name: ' + name);
        logger.debug('Value: ' + value);
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: ADD_ENDPOINT,
                form: {
                    symbolName: name,
                    symbolValue: value
                }
            })
            .then((response) => {
                // response body is <admin service="global_symbols.Add"><response message="Global symbol 'xxx' have been successfully declared!" state="success"/></admin>
                var status = response.json.admin.response[0]['$']['state'];
                logger.debug('Status: ' + status);
                response.message = response.json.admin.response[0]['$']['message'];
                logger.debug('Message: ' + response.message);
                if (status == 'success') {
                    resolve(response);
                } else {
                    logger.error(response.message);
                    reject(response.message);
                }
            })
            .catch((error) => {
                reject(error);
            });
        });
    }
        
    /**
     * Delete a global symbol, rejecting if symbol does not exists.
     * @param {Connection} con Convertigo server connection.
     * @param {string} name Name of the symbol to add.
     */
    delete(con, name) {
        var logger = con.logger('global symbols delete');
        logger.info('Deleting global symbol...');
        logger.debug('Name: ' + name);
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: DELETE_ENDPOINT,
                form: { symbolName: name }
            })
            .then((response) => {
                // response body is <admin service="global_symbols.Delete"><response message="Global symbol 'test' have been successfully deleted!" state="success"/></admin>
                var status = response.json.admin.response[0]['$']['state'];
                logger.debug('Status: ' + status);
                response.message = response.json.admin.response[0]['$']['message'];
                logger.debug('Message: ' + response.message);
                if (status == 'success') {
                    resolve(response);
                } else {
                    logger.error(response.message);
                    reject(response.message);
                }
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Edit a global symbol, rejecting if symbol does not exist.
     * @param {Connection} con Convertigo server connection.
     * @param {string} oldName Old name of the symbol to edit.
     * @param {string} name Name of the symbol to edit.
     * @param {string} value Value of the symbol to edit.
     */
    edit(con, oldName, name, value) {
        var logger = con.logger('global symbols edit');
        logger.info('Editing global symbol...');
        logger.debug('Old name: ' + oldName);
        logger.debug('Name: ' + name);
        logger.debug('Value: ' + value);
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: EDIT_ENDPOINT,
                form: {
                    oldSymbolName: oldName,
                    symbolName: name,
                    symbolValue: value
                }
            })
            .then((response) => {
                // response body is <admin service="global_symbols.Edit"><response message="Global symbol 'xxx' have been successfully edited!" state="success"/></admin>
                var status = response.json.admin.response[0]['$']['state'];
                logger.debug('Status: ' + status);
                response.message = response.json.admin.response[0]['$']['message'];
                logger.debug('Message: ' + response.message);
                if (status == 'success') {
                    resolve(response);
                } else {
                    logger.error(response.message);
                    reject(response.message);
                }
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    update(con, name, value) {
        return this.edit(con, name, name, value);
    }

    rename(con, oldName, newName) {
        return new Promise((resolve, reject) => {
            this.get(con, oldName)
            .then((response) => {
                return this.edit(con, oldName, newName, response.symbols[oldName]);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Import global symbols file.
     * @param {Connection} con Convertigo server connection.
     * @param {*} file Global symbols .properties file.
     * @param {number} mode Should be one of CLEAR_IMPORT, MERGE_PRIORITY_SERVER, MERGE_PRIORITY_IMPORT.
     */
    import(con, file, mode) {
        var logger = con.logger('global symbols import');
        logger.info('Importing global symbols...');
        var importMode = IMPORT_MODES[mode];
        logger.debug('Mode: ' + importMode.name);
        return new Promise((resolve, reject) => {
            Request.postFile(con, logger, file, {
                uri: IMPORT_ENDPOINT,
                qs: importMode.qs
            })
            .then((response) => {
                // response body is <admin service="global_symbols.Import"><message>The global symbols file has been successfully imported.</message></admin>
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
