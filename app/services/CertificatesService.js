const Request = require('../util/Request');
const Connection = require('../util/Connection');
const Log = require('../util/Log');
const LOGGER = function(con) { return Log.logger('GlobalSymbolsService', con); };

const BASE_ENDPOINT = '/admin/services/certificates';
const LIST_ENDPOINT = BASE_ENDPOINT + '.List';
const ADD_ENDPOINT = BASE_ENDPOINT + '.Add';
const EDIT_ENDPOINT = BASE_ENDPOINT + '.Edit';
const DELETE_ENDPOINT = BASE_ENDPOINT + '.Delete';
const REMOVE_ENDPOINT = BASE_ENDPOINT + '.Remove';
const INSTALL_ENDPOINT = BASE_ENDPOINT + '.Install';
const CONFIGURE_ENDPOINT = BASE_ENDPOINT + '.Configure';
const BASE_MAPPINGS_ENDPOINT = BASE_ENDPOINT + '.mappings';
const CONFIGURE_MAPPING_ENDPOINT = BASE_MAPPINGS_ENDPOINT + '.Configure';

module.exports = class CertificatesService {

    constructor() { 
        this.importModes = {
            CLEAR_IMPORT: 0,
            MERGE_PRIORITY_SERVER: 1,
            MERGE_PRIORITY_IMPORT: 2
        }
    }

    /**
     * List certificates and bindings.
     * @param {Connection} con Convertigo server connection.
     * @param {string} names Optional names of the symbols to list.
     */
    list(con, names) {
        var logger = LOGGER(con);
        logger.info('Listing certificates...');
        logger.debug('Names: ' + names);
        return new Promise((resolve, reject) => {
            Request.post(con, logger, { uri: LIST_ENDPOINT })
            .then((response) => {
                // response body is <admin service="certificates.List"><certificates><certificate group="" name="test.store" password="" type="server" validPass="true"/></certificates><candidates><candidate name="cacerts.store"/></candidates><bindings><anonymous/><carioca/></bindings></admin>
                response.certificates = {};
                response.candidates = [];
                response.bindings = [];
                var certificates = response.json.admin.certificates[0];
				if (typeof(certificates) == "object") {
					certificates = certificates.certificate;
					for (var i=0; i< certificates.length; i++) {
						var certificate = certificates[i]['$'];
						if (!names || names.indexOf(certificate.name) >= 0) {
							response.certificates[certificate.name] = certificate;
						}
					}
				}
                logger.debug('Certificates: ' + JSON.stringify(response.certificates));
                var candidates = response.json.admin.candidates[0];
				if (typeof(candidates) == "object") {
					candidates = candidates.candidate;
					for (var i=0; i< candidates.length; i++) {
						var candidate = candidates[i]['$'];
						if (!names || names.indexOf(candidate.name) >= 0) {
							response.candidates.push(candidate.name);
						}
					}
				}
                logger.debug('Candidates: ' + JSON.stringify(response.candidates));
                var bindings = response.json.admin.bindings[0].anonymous[0];
				if (typeof(bindings) == "object") {
					bindings = bindings.binding;
					for (var i=0; i< bindings.length; i++) {
						var binding = bindings[i]['$'];
						if (!names || names.indexOf(binding.certificateName) >= 0) {
							response.bindings.push(binding);
						}
					}
				}
                logger.debug('Candidates: ' + JSON.stringify(response.candidates));
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Get a certificate, rejecting if does not exist.
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
                    reject('Certificate does not exists: ' + name);
                }
            })
            .catch((error) => {
                reject(error);
            });
        });
    }
        
    /**
     * Install a certificate file.
     * @param {Connection} con Convertigo server connection.
     * @param {*} file Certificate .store file.
     */
    install(con, file) {
        var logger = LOGGER(con);
        logger.info('Installing certificate...');
        return new Promise((resolve, reject) => {
            Request.postFile(con, logger, file, {
                uri: INSTALL_ENDPOINT
            })
            .then((response) => {
                // success response body is <admin service="certificates.Install"><message>The certificate "test.store" has been successfully uploaded</message></admin>
                // error response body is <admin service="certificates.Install"><error>The extension \""+certifNameExtension+"\" isn't valid</error></admin>
				if (response.json.admin.error) {
					response.message = response.json.admin.error;
                    logger.error(response.message);
                    reject(response.message);
				} else {
					response.message = response.json.admin.message;
					logger.debug('Message: ' + response.message);
					resolve(response);
				}
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Update a certificate.
     * @param {Connection} con Convertigo server connection.
     * @param {string} name Name of the certificate to update.
     * @param {string} type Type of certificate (server | client).
     * @param {string} password Password of certificate file.
     * @param {string} group Group to put certificate in.
     */
	update(con, name, type, password, group) {
        var logger = LOGGER(con);
        logger.info('Configuring certificate...');
        logger.debug('Name: ' + name);
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: CONFIGURE_ENDPOINT,
                form: {
					name_0: name,
					type_0: type,
					pwd_0: password,
					group_0: group
				}
            })
            .then((response) => {
                // success response body is <admin service="certificate.Configure"><message><![CDATA[The certificates have successfully been updated.]]></message></admin>
                // error response body is <error><message>You tried to configure an uninstalled certificate!</message><exception>...</exception><stacktrace>...</stacktrace></error>
				if (response.json.error) {
					response.message = response.json.error.message;
                    logger.error(response.message);
                    reject(response.message);
				} else {
					response.message = response.json.admin.message;
					logger.debug('Message: ' + response.message);
					resolve(response);
				}
            })
            .catch((error) => {
                reject(error);
            });
        });
	}
    
    /**
     * Delete a certificate config, rejecting if does not exists.
     * @param {Connection} con Convertigo server connection.
     * @param {string} name Name of the certificate to delete.
     */
    delete(con, name) {
        var logger = LOGGER(con);
        logger.info('Deleting certificate...');
        logger.debug('Name: ' + name);
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: DELETE_ENDPOINT,
                form: { certificateName_1: name }
            })
            .then((response) => {
                // success response body is <admin service="certificate.Delete"><message><![CDATA[Certificate test.store has successfully been deleted.]]></message></admin>
                // error response body is <error><message>Certificate test.store didn't exist</message><exception>...</exception><stacktrace>...</stacktrace></error>
				if (response.json.error) {
					response.message = response.json.error.message;
                    logger.error(response.message);
                    reject(response.message);
				} else {
					response.message = response.json.admin.message;
					logger.debug('Message: ' + response.message);
					resolve(response);
				}
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Removes a certificate file, rejecting if does not exists.
     * @param {Connection} con Convertigo server connection.
     * @param {string} name Name of the certificate to delete.
     */
    remove(con, name) {
        var logger = LOGGER(con);
        logger.info('Deleting certificate...');
        logger.debug('Name: ' + name);
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: REMOVE_ENDPOINT,
                form: { certificateName: name }
            })
            .then((response) => {
                // success response body is <admin service="certificate.Delete"><message><![CDATA[Certificate test.store has successfully been deleted.]]></message></admin>
                // error response body is <error><message>Certificate test.store didn't exist</message><exception>...</exception><stacktrace>...</stacktrace></error>
				if (response.json.error) {
					response.message = response.json.error.message;
                    logger.error(response.message);
                    reject(response.message);
				} else {
					response.message = response.json.admin.message;
					logger.debug('Message: ' + response.message);
					resolve(response);
				}
            })
            .catch((error) => {
                reject(error);
            });
        });
    }
	
	
    /**
     * Update a mapping.
     * @param {Connection} con Convertigo server connection.
     * @param {string} name Name of the certificate.
     * @param {string} project Name of the project.
     */
	updateMapping(con, name, project) {
        var logger = LOGGER(con);
        logger.info('Configuring mapping...');
        logger.debug('Name: ' + name);
        logger.debug('Project: ' + project);
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: CONFIGURE_MAPPING_ENDPOINT,
                form: {
					targettedObject_0: 'projects',
					cert_0: name,
					convProject_0: project
				}
            })
            .then((response) => {
                // success response body is <admin service="certificates.mappings.Configure"><message><![CDATA[The mappings have successfully been updated.]]></message></admin>
                // error response body is <error><message>You tried to configure an uninstalled certificate!</message><exception>...</exception><stacktrace>...</stacktrace></error>
				if (response.json.error) {
					response.message = response.json.error.message;
                    logger.error(response.message);
                    reject(response.message);
				} else {
					response.message = response.json.admin.message;
					logger.debug('Message: ' + response.message);
					resolve(response);
				}
            })
            .catch((error) => {
                reject(error);
            });
        });
	}

}
