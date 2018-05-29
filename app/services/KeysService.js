const Request = require('../util/Request');
const Connection = require('../util/Connection');
const Log = require('../util/Log');
const LOGGER = function(con) { return Log.logger('KeysService', con); };

const BASE_ENDPOINT = '/admin/services/keys';
const LIST_ENDPOINT = BASE_ENDPOINT + '.List';
const UPDATE_ENDPOINT = BASE_ENDPOINT + '.Update';
const REMOVE_ENDPOINT = BASE_ENDPOINT + '.Remove';

module.exports = class KeysService {

    constructor() { }
    
    /**
     * List keys
     * @param {Connection} con Convertigo server connection.
     */
    list(con) {
        var logger = LOGGER(con);
        logger.info('Listing keys...');
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: LIST_ENDPOINT,
            })
            .then((response) => {
                response.keys = this.jsonToKeys(response.json);
                logger.debug('Keys: ' + JSON.stringify(response.keys));
                resolve(response);
             })
            .catch((error) => {
                reject(error);
            });
        });
    }
    
    /**
     * Add keys
     * @param {Connection} con Convertigo server connection.
     * @param {*} keys The key(s) to update as a single string or array of string.
     */
    add(con, keys) {
        var logger = LOGGER(con);
        logger.info('Adding keys...');
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: UPDATE_ENDPOINT,
                body: this.keysToXml(keys)
            })
            .then((response) => {
                // response body is <admin service="keys.Update"><keys><key errorMessage="The key has already been added!" text="38CE723612053DF4-8505DDDF26664A50" valid="false"><key text="EA1BD9DDC9CF0954-4DA6398E3CE81833" valid="true"/></keys></admin>
				response.message = this.jsonToMessage(response.json);
                logger.info(response.message);
                resolve(response);
             })
            .catch((error) => {
                reject(error);
            });
        });
    }
    
    /**
     * Remove keys.
     * @param {Connection} con Convertigo server connection.
     * @param {*} keys The keys to add as a single string or array of string.
     */
    remove(con, keys) {
        var logger = LOGGER(con);
        logger.info('Removing keys...');
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: REMOVE_ENDPOINT,
                body: this.keysToXml(keys)
            })
            .then((response) => {
                // response body is <admin service="keys.Remove"><keys><key text="EA1BD9DDC9CF0954-4DA6398E3CE81833" valid="true"/></keys></admin>
				response.message = this.jsonToMessage(response.json);
                logger.info(response.message);
                resolve(response);
             })
            .catch((error) => {
                reject(error);
            });
        });
    }

	/**
	 * Test if a key is valid.
	 */
	isValid(key) {
		return (key.length == 16 + 1 + 16);
	}
	
    /**
     * Transform response result to keys array.
     * @param {*} json Response result as JSON object.
     */
    jsonToKeys(json) {
        // response body is <admin service="keys.List"><category name="" overflow="" remaining="" total=""><keys><key evaluation="" expiration="" expired="" text="" value=""/></keys></category></admin><nb_valid_key></nb_valid_key><firstStartDate></firstStartDate>
        var ret = [];
		var categories = json.admin.category;
        for (var i=0; i<categories.length; i++) {
			var name = categories[i]['$'].name;
			var keys = categories[i]['keys'][0]['key'];
			for (var j=0; j<keys.length; j++) {
				var key = keys[j]['$'];
                ret.push(key.text);
            }
        }
        return ret;
    }
	
    /**
     * Transform response result to message.
     * @param {*} json Response result as JSON object.
     */
    jsonToMessage(json) {
        // response body is <admin service="keys.Update"><keys><key errorMessage="The key has already been added!" text="38CE723612053DF4-8505DDDF26664A50" valid="false"><key text="EA1BD9DDC9CF0954-4DA6398E3CE81833" valid="true"/></keys></admin>
        var message = "";
		var responseKeys = json.admin.keys[0].key;
		if (responseKeys.length > 1) {
			message += "{";
			for (var i=0; i<responseKeys.length; i++) {
				if (i>0) {
					message += ", ";
				}
				var responseKey = responseKeys[i]['$'];
				message += responseKey.text + ':"' + (responseKey.errorMessage ? 'Error: ' + responseKey.errorMessage : 'Success') + '"';
			}
			message += "}";
		} else {
			var responseKey = responseKeys[0]['$'];
			message += (responseKey.errorMessage ? "Error: " + responseKey.errorMessage : "Success");
		}
        return message;
    }

	/**
	 * Transform keys array or single string to XML.
     * @param {*} keys The keys as a single string or array of strings.
	 */
	keysToXml(keys) {
		var xml = "<keys>";
		if (Array.isArray(keys)) {
			for (var i=0; i<keys.length; i++) {
				xml += "<key text=\""+keys[i]+"\"/>";
			}
		} else {
				xml += "<key text=\""+keys+"\"/>";
		}
		xml += "</keys>";
		return xml;
	}
	
}