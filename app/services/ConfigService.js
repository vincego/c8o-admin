const jsontoxml = require('jsontoxml');
const Request = require('../util/Request');
const Connection = require('../util/Connection');
const Log = require('../util/Log');
const LOGGER = function(con) { return Log.logger('ConfigService', con); };

const BASE_ENDPOINT = '/admin/services/configuration';
const UPDATE_ENDPOINT = BASE_ENDPOINT + '.Update';
const LIST_ENDPOINT = BASE_ENDPOINT + '.List';

module.exports = class ConfigService {

    constructor() { }
    
    /**
     * Update configuration
     * @param {Connection} con Convertigo server connection.
     * @param {*} config Config is a map of key / value
     */
    update(con, config) {
        var logger = LOGGER(con);
        logger.info('Updating config...');
        logger.debug('Config: ' + JSON.stringify(config));
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: UPDATE_ENDPOINT,
                body: this.configToXml(config)
            })
            .then((response) => {
                // response body is <admin service="configuration.Update"><update status="ok"/></admin>
                var status = response.json.admin.update[0]['$']['status'];
                logger.debug('Response status: ' + status);
                if (status == 'ok') {
                    resolve(response);
                } else {
                    logger.error('Bad response status: ' + status);
                    reject('Bad response status: ' + status);
                }
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * List configuration
     * @param {Connection} con Convertigo server connection.
     * @param {*} names 
     */
    list(con, names){
        var logger = LOGGER(con);
        logger.info('Listing config...');
        logger.debug('Names: ' + names);
        return new Promise((resolve, reject) => {
            Request.post(con, logger, { uri: LIST_ENDPOINT })
            .then((response) => {
                response.config = this.jsonToConfig(response.json, names);
                logger.debug('Config: ' + JSON.stringify(response.config));
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Transform config object to XML.
     * @param {*} config Config object (map of key / value)
     */
    configToXml(config) {
        var configArray = [];
        for (var prop in config) {
            configArray.push({name: 'property', attrs:{key:prop, value:config[prop]}});
        }
        return jsontoxml({ configuration: configArray });
    }

    /**
     * Transform response JSON to config object.
     * @param {*} json Response result as JSON object.
     * @param {*} names Array of names of the config properties to return.
     */
    jsonToConfig(json, names) {
        var config = {};
        var categories = json.admin.category;
        for (var i=0; i< categories.length; i++) {
            var properties = categories[i].property;
            for (var j=0; j< properties.length; j++) {
                var property = properties[j]['$'];
                if (!names || names.indexOf(property.name) >= 0) {
                    config[property.name] = property.value;
                }
            }
        }
        return config;
    }

}