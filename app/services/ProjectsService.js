const Request = require('../util/Request');
const Connection = require('../util/Connection');

const DEPLOY_ENDPOINT = '/admin/services/projects.Deploy';
const LIST_ENDPOINT = '/admin/services/projects.List';
const EXPORT_ENDPOINT = '/admin/services/projects.Export';

module.exports = class ProjectsService {

    constructor() { }
    
    /**
     * Deploy project
     * @param {Connection} con Convertigo server connection.
     * @param {*} file Handle to .car file
     */
    deploy(con, file) {
        var logger = con.logger('projects deploy');
        logger.info('Deploying project...');
        return new Promise((resolve, reject) => {
            Request.postFile(con, logger, file, {
                uri: DEPLOY_ENDPOINT,
                qs: { 'bAssembleXsl': 'false' }
            })
            .then((response) => {
                // response body is <admin service="projects.Deploy"><message>The project 'TestProject' has been successfully deployed.</message></admin>
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
     * List projects
     * @param {Connection} con Convertigo server connection.
     * @param {*} names Optional array of names of the projects to return.
     */
    list(con, names) {
        var logger = con.logger('projects list');
        logger.info('Listing projects...');
        return new Promise((resolve, reject) => {
            Request.post(con, logger, {
                uri: LIST_ENDPOINT,
            })
            .then((response) => {
                response.projects = this.jsonToProjects(response.json, names);
                logger.debug('Projects: ' + JSON.stringify(response.projects));
                resolve(response);
             })
            .catch((error) => {
                reject(error);
            });
        });
    }
    
    /**
     * Export project
     * @param {Connection} con Convertigo server connection.
     * @param {string} name Name of the projects to export.
     * @param {string} destDir Path to destination directory for .car file.
     */
    export(con, name, destDir) {
        var logger = con.logger('project export');
        logger.info('Exporting project "' + name + '"...');
        return new Promise((resolve, reject) => {
            Request.getFile(con, logger, destDir, {
                uri: EXPORT_ENDPOINT,
                qs: { 'projectName': name }
            })
            .then((file) => {
                resolve(file);
             })
            .catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Transform response result to config object.
     * @param {*} json Response result as JSON object.
     * @param {*} names Optional array of names of the projects to return.
     */
    jsonToProjects(json, names) {
        // response body is <admin service="projects.List"><projects><project comment="" deployDate="" exported="" name="" version=""/></projects></admin>
        var ret = [];
        var projects = json.admin.projects;
        for (var i=0; i< projects.length; i++) {
            var project = projects[i].project[0]['$'];
            if (!names || names.indexOf(project.name) >= 0) {
                ret.push(project);
            }
        }
        return ret;
    }

}