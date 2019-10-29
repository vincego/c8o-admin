const queryString = require('query-string');
const Request = require('../util/Request');
const Connection = require('../util/Connection');
const Log = require('../util/Log');
const LOGGER = function(con) { return Log.logger('RolesService', con); };

const BASE_ENDPOINT = '/admin/services/roles';
const LIST_ENDPOINT = BASE_ENDPOINT + '.List';
const ADD_ENDPOINT = BASE_ENDPOINT + '.Add';
const EDIT_ENDPOINT = BASE_ENDPOINT + '.Edit';
const DELETE_ENDPOINT = BASE_ENDPOINT + '.Delete';
const DELETE_ALL_ENDPOINT = BASE_ENDPOINT + '.DeleteAll';
const IMPORT_ENDPOINT = BASE_ENDPOINT + '.Import';
const EXPORT_ENDPOINT = BASE_ENDPOINT + '.Export';

const IMPORT_MODES = [
    { 'name': 'CLEAR_IMPORT', 'qs': { 'action-import': 'clear-import' }},
    { 'name': 'MERGE_PRIORITY_SERVER', 'qs': { 'action-import': 'on', 'priority': 'priority-server' }},
    { 'name': 'MERGE_PRIORITY_IMPORT', 'qs': { 'action-import': 'on', 'priority': 'priority-import' }}
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
     * List users and their roles
     * @param {Connection} con Convertigo server connection.
     */
    list(con) {
        return new Promise((resolve, reject) => {
			var logger = LOGGER(con);
			logger.info('Listing users...');
            Request.post(con, logger, {
                uri: LIST_ENDPOINT,
            })
            .then((response) => {
                response.users = this.jsonToUsers(response.json);
                logger.info('Users: %s', JSON.stringify(response.users));
                resolve(response);
             })
            .catch((error) => {
                reject(error);
            });
        });
    }
    
    /**
     * Add user
     * @param {Connection} con Convertigo server connection.
     * @param {string} username The name of the user to add.
     * @param {string} password The password of the user to add.
     * @param {*} roles Array of roles names.
     */
    add(con, username, password, roles) {
        return new Promise((resolve, reject) => {
			var logger = LOGGER(con);
			logger.info('Adding user "%s"...', username);
			logger.info('Roles: %s', JSON.stringify(roles));
            Request.post(con, logger, {
                uri: ADD_ENDPOINT,
				// Using body + content-type instead of form to handle roles array correctly
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
				body: queryString.stringify( { username: username, password: password, roles: roles } )
            })
            .then((response) => {
                // response body is <admin service="roles.Add"><response message="User 'test' have been successfully declared!" state="success"/></admin>
                var status = response.json.admin.response[0]['$']['state'];
                response.message = response.json.admin.response[0]['$']['message'];
				logger.info('Response: %s - %s', status, response.message);
                if (status == 'success') {
                    resolve(response);
                } else {
                    reject(response.message);
                }
             })
            .catch((error) => {
                reject(error);
            });
        });
    }
	
    /**
     * Add user
     * @param {Connection} con Convertigo server connection.
     * @param {string} oldUsername The name of the user to edit.
     * @param {string} username The new name of the user.
     * @param {string} password The new password of the user.
     * @param {*} roles Array of roles names.
     */
    edit(con, oldUsername, username, password, roles) {
        return new Promise((resolve, reject) => {
			var logger = LOGGER(con);
			logger.info('Editing user "%s"...', oldUsername);
			if (username != oldUsername) {
				logger.debug('New name: ' + username);
			}
			logger.debug('Roles: ' + JSON.stringify(roles));
            Request.post(con, logger, {
                uri: UPDATE_ENDPOINT,
				// Using body + content-type instead of form to handle roles array correctly
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
				body: queryString.stringify( { oldUsername: oldUsername, username: username, password: password, roles: roles } )
            })
            .then((response) => {
                // response body is <admin service="roles.Edit"><response message="User 'test' have been successfully edited!" state="success"/></admin>
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
     * Delete a user.
     * @param {Connection} con Convertigo server connection.
     * @param {string} username Name of the user to delete.
     */
    delete(con, username) {
        var logger = LOGGER(con);
        logger.info('Deleting user...');
        logger.debug('Name: ' + username);
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: DELETE_ENDPOINT,
                form: { username: username }
            })
            .then((response) => {
                // response body is <admin service="roles.Delete"><response message="User 'test' have been successfully deleted!" state="success"/></admin>
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
     * Delete all users.
     * @param {Connection} con Convertigo server connection.
     */
    deleteAll(con) {
        var logger = LOGGER(con);
        logger.info('Deleting all users...');
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: DELETE_ALL_ENDPOINT
            })
            .then((response) => {
                // response body is <admin service="roles.DeleteAll"><response message="All users have been successfully deleted!" state="success"/></admin>
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
     * Import rôles
     * @param {Connection} con Convertigo server connection.
     * @param {*} file Global symbols .properties file
     * @param {number} mode Should be one of CLEAR_IMPORT, MERGE_PRIORITY_SERVER, MERGE_PRIORITY_IMPORT.
     */
    import(con, file, mode) {
        var logger = LOGGER(con);
        logger.info('Importing users...');
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
	
    /**
     * Transform response result to users array: [ { "name":"UserName", "roles":["HOME_VIEW","HOME_CONFIG"] } ].
     * @param {*} json Response result as JSON object.
     */
    jsonToUsers(json) {
        // response body is <admin service="roles.List"><users><user name="UserName"><role name="HOME_VIEW"/><role name="HOME_CONFIG"/></user></users></admin>
        var ret = [];
		var users = json.admin.users[0].user;
		if (typeof (users) != "undefined") {
			for (var i=0; i<users.length; i++) {
				var user = {};
				user.name = users[i]['$'].name;
				user.roles = [];
				ret.push(user);
				var roles = users[i]['role'];
				if (typeof (roles) != "undefined") {
					for (var j=0; j<roles.length; j++) {
						var role = roles[j]['$'].name;
						user.roles.push(role);
					}
				}
			}
		}
        return ret;
    }

}
