const fs = require('fs');
const Connection = require('../app/util/Connection');
const Service = require('../app/services/service');
const logger = require('../app/util/Log').logger('Test');

class Test {

    constructor() {
        this.service = new Service();
    }

	/**
	 * @return {Connection}
	 */
    initConnection() {
        return new Connection('http://localhost:18080/convertigo', 'admin', 'admin');
    }

    handleError(con, error) {
        logger.error('Error occured: ' + error);
        if (con.cookie) {
            this.service.engine.logout(con)
            .catch((error) => {
                logger.error('Error occured: ' + error);
            });
        }
    }

    /**
     * 
     * @param {ServerConnection} con 
     */
    testServer(con) {
        // Login
        return this.service.engine.login(con)
        // Import global symbols
        .then(() => {
            var file = 'test/global_symbols.properties';
            logger.info('Import symbols : ' + file);
            return this.service.globalSymbols.clearImport(con, file);
        })
        // Import roles
        .then(() => {
            var file = 'test/user_roles.json';
            logger.info('Import roles : ' + file);
            return this.service.roles.clearImport(con, file);
        })
        // Deploy project
        .then(() => {
            var file = 'test/TestProject.car';
            logger.info('Deploy project : ' + file);
            return this.service.projects.deploy(con, file);
        })
        // List projects
        .then(() => {
            logger.info('List projects');
            return this.service.projects.list(con);
        })
        .then((response) => {
            logger.info('Projects: ' + JSON.stringify(response.projects));
        })
        // Export project
        .then(() => {
            logger.info('Export project');
            return this.service.projects.export(con, 'TestProject', 'test');
        })
        // Engine status
        .then(() => {
            logger.info('Engine status');
            return this.service.engine.status(con);
        })
        .then((response) => {
            logger.info('Status: ' + JSON.stringify(response.engine));
        })
        // Engine restart
        .then(() => {
            logger.info('Engine restart');
            return this.service.engine.restart(con);
        })
        // Logout
        .then(() => {
            logger.info('Logout');
            return this.service.engine.logout(con);
        })
        // End
        .then(() => {
            logger.info('Test succesfull for server ' + con.Server.uri);
        })
        .catch((error) => {
            this.handleError(con, error);
        });
    }

    testAuth(con) {
        // Login
        return this.service.engine.login(con)
        // Logout
        .then(() => {
            return this.service.engine.logout(con);
        })
        .catch((error) => {
            this.handleError(con, error);
        });
    }

    testConfig(con) {
        // Login
        return this.service.engine.login(con)
        // Update config
        .then(() => {
            var config = {
                APPLICATION_SERVER_CONVERTIGO_URL: 'http://localhost:28080/convertigo/',
                FULLSYNC_COUCH_URL: 'http://localhost:5984/',
                FULLSYNC_COUCH_USERNAME: 'admin',
                FULLSYNC_COUCH_PASSWORD: 'admin'
            }
            logger.info('Config : ' + JSON.stringify(config, null, 2));
            return this.service.config.update(con, config);
        })
        // List config
        .then(() => {
            var names = ['APPLICATION_SERVER_CONVERTIGO_URL','FULLSYNC_COUCH_URL','FULLSYNC_COUCH_USERNAME','LOG4J_LOGGER_CEMS'];
            return this.service.config.list(con, names);
        })
        .then((config) => {
            logger.info('Config: ' + JSON.stringify(config));
        })
        // Logout
        .then(() => {
            return this.service.engine.logout(con);
        })
        .catch((error) => {
            this.handleError(con, error);
        });
    }

    testGlobalSymbols(con) {
        // Login
        return this.service.engine.login(con)
        // List
        .then(() => {
            return this.service.globalSymbols.list(con);
        })
        .then((response) => {
            logger.info('Symbols: ' + JSON.stringify(response.symbols));
        })
        // Add
        .then(() => {
            return this.service.globalSymbols.add(con, 'test', 'test');
        })
        // Add again
        .then(() => {
            return this.service.globalSymbols.add(con, 'test', 'test');
        })
        // Logout
        .then(() => {
            return this.service.engine.logout(con);
        })
        .catch((error) => {
            this.handleError(con, error);
        });
    }
}

var test = new Test();
var con = test.initConnection();
//test.testServer(con);
//test.testListConfig(con);
test.testGlobalSymbols(con);
        