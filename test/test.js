const fs = require('fs');
const C8oConnection = require('../app/util/Connection');
const C8oService = require('../app/services/Service');
const logger = require('../app/util/Log').logger('Test');

class Test {

    constructor() {
        this.c8oService = new C8oService();
    }

	/**
	 * @return {C8oConnection}
	 */
    initConnection() {
        return new C8oConnection('http://localhost:28080/convertigo', 'admin', 'admin');
    }

    handleError(con, error) {
        logger.error('Error occured: ' + error);
        if (con.cookie) {
            this.c8oService.engine.logout(con)
            .catch((error) => {
                logger.error('Error occured: ' + error);
            });
        }
    }

    /**
     * 
     * @param {C8oServerConnection} con 
     */
    testServer(con) {
        // Login
        return this.c8oService.engine.login(con)
        // Import global symbols
        .then(() => {
            var file = 'test/global_symbols.properties';
            logger.info('Import symbols : ' + file);
            return this.c8oService.globalSymbols.clearImport(con, file);
        })
        // Import roles
        .then(() => {
            var file = 'test/user_roles.json';
            logger.info('Import roles : ' + file);
            return this.c8oService.roles.clearImport(con, file);
        })
        // Deploy project
        .then(() => {
            var file = 'test/TestProject.car';
            logger.info('Deploy project : ' + file);
            return this.c8oService.projects.deploy(con, file);
        })
        // List projects
        .then(() => {
            logger.info('List projects');
            return this.c8oService.projects.list(con);
        })
        .then((response) => {
            logger.info('Projects: ' + JSON.stringify(response.projects));
        })
        // Export project
        .then(() => {
            logger.info('Export project');
            return this.c8oService.projects.export(con, 'TestProject', 'test');
        })
        // Engine status
        .then(() => {
            logger.info('Engine status');
            return this.c8oService.engine.status(con);
        })
        .then((response) => {
            logger.info('Status: ' + JSON.stringify(response.engine));
        })
        // Engine restart
        .then(() => {
            logger.info('Engine restart');
            return this.c8oService.engine.restart(con);
        })
        // Logout
        .then(() => {
            logger.info('Logout');
            return this.c8oService.engine.logout(con);
        })
        // End
        .then(() => {
            logger.info('Test succesfull for server ' + con.c8oServer.uri);
        })
        .catch((error) => {
            this.handleError(con, error);
        });
    }

    testAuth(con) {
        // Login
        return this.c8oService.engine.login(con)
        // Logout
        .then(() => {
            return this.c8oService.engine.logout(con);
        })
        .catch((error) => {
            this.handleError(con, error);
        });
    }

    testConfig(con) {
        // Login
        return this.c8oService.engine.login(con)
        // Update config
        .then(() => {
            var config = {
                APPLICATION_SERVER_CONVERTIGO_URL: 'http://localhost:28080/convertigo/',
                FULLSYNC_COUCH_URL: 'http://localhost:5984/',
                FULLSYNC_COUCH_USERNAME: 'admin',
                FULLSYNC_COUCH_PASSWORD: 'admin'
            }
            logger.info('Config : ' + JSON.stringify(config, null, 2));
            return this.c8oService.config.update(con, config);
        })
        // List config
        .then(() => {
            var names = ['APPLICATION_SERVER_CONVERTIGO_URL','FULLSYNC_COUCH_URL','FULLSYNC_COUCH_USERNAME','LOG4J_LOGGER_CEMS'];
            return this.c8oService.config.list(con, names);
        })
        .then((config) => {
            logger.info('Config: ' + JSON.stringify(config));
        })
        // Logout
        .then(() => {
            return this.c8oService.engine.logout(con);
        })
        .catch((error) => {
            this.handleError(con, error);
        });
    }

    testGlobalSymbols(con) {
        // Login
        return this.c8oService.engine.login(con)
        // List
        .then(() => {
            return this.c8oService.globalSymbols.list(con);
        })
        .then((response) => {
            logger.info('Symbols: ' + JSON.stringify(response.symbols));
        })
        // Add
        .then(() => {
            return this.c8oService.globalSymbols.add(con, 'test', 'test');
        })
        // Add again
        .then(() => {
            return this.c8oService.globalSymbols.add(con, 'test', 'test');
        })
        // Logout
        .then(() => {
            return this.c8oService.engine.logout(con);
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
        