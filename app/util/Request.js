const request = require('request');
const requestPromise = require('request-promise');
const xml2js = require("xml2js");
const fs = require('fs');
const { merge } = require('lodash');
const Connection = require('./Connection');
const { Logger } = require('./Log');

const Request = class Request {

    constructor() { }

    /**
     * Build default options for request.
     * @param {Connection} con Server connection.
     */
    static defaultOptions(con) {
        var options = {
            baseUrl: con.url,
            resolveWithFullResponse: true
        }
        if (con.cookie) {
            options.headers = { 'Cookie': con.cookie };
        }
        return options;
    }

    /**
     * Request Convertigo server with options.
     * @param {Connection} con Server connection.
     * @param {Logger} logger Current logger.
     * @param {*} options Options sent to request-promise.
     */
    static post(con, logger, options) {
        logger.debug('POST to %s', con.url);
        // Set defaults options and merge with user options.
        var allOptions = Request.defaultOptions(con);
        allOptions.method = 'POST';
        allOptions = merge(allOptions, options);
        logger.debug('Request options: %s', JSON.stringify(allOptions));

        // Execute request
        return new Promise((resolve, reject) => {
            requestPromise(allOptions)
            .then((response) => {
                logger.debug('Request success');
                logger.debug('Response body: %s', response.body);
                xml2js.parseString(response.body, (error, result) => {
                    if (error) {
                        logger.error('XML to JSON parsing error!');
                        reject(error);
                    } else {
                        logger.debug('Response JSON: %s', JSON.stringify(result));
                        response.json = result;
                        resolve(response);
                    }
                });
            })
            .catch((error) => {
                logger.error('Request error!');
                reject(error);
            });
        });
    }
    
    /**
     * Post a file to Convertigo server.
     * @param {Connection} con Server to post the file to.
     * @param {Logger} logger Current logger.
     * @param {*} file File path or stream.
     * @param {*} options Options sent to request-promise.
     */
    static postFile(con, logger, file, options) {
        logger.debug('POST file to %s', con.url);

        var fileData = file;
        if (typeof(file) == 'string') {
            logger.debug('File: %s', file);
            fileData = fs.createReadStream(file);
        }
        var allOptions = {
            headers: { 'Content-Type': 'multipart/form-data' },
            formData: { 'userfile': fileData }
        }
        allOptions = merge(allOptions, options);
        return Request.post(con, logger, allOptions);
    }

    /**
     * Get a file from Convertigo server.
     * @param {Connection} con Server to post the file to.
     * @param {Logger} logger Current logger.
     * @param {string} destDir 
     * @param {*} options Options sent to request-promise.
     */
    static getFile(con, logger, destDir, options) {
        logger.debug('GET file from %s', con.url);

        // Set defaults options and merge with user options.
        var allOptions = Request.defaultOptions(con);
        allOptions.method = 'GET';
        allOptions = merge(allOptions, options);
        logger.debug('Request options: %s', JSON.stringify(allOptions));

        // Execute request
        return new Promise((resolve, reject) => {
            request(allOptions)
            .on('response', (response) => {
                logger.debug('Response headers: %s', JSON.stringify(response.headers));
                var contentDisposition = response.headers['content-disposition'];
                // "content-disposition":"attachment; filename=\"TestProject.car\""
                var fileName = contentDisposition.match(/filename="(.*?)"/ )[1];
                var contentLength = response.headers['content-length'];
                var file = fs.createWriteStream(destDir + '/' + fileName);
                response.pipe(file);
                resolve(file);
            });
        });
    }
}

module.exports = Request;