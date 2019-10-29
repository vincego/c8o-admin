const fs = require('fs');
const Connection = require('../app/util/Connection');
const Service = require('../app/services/Service');
const logger = require('../app/util/Log').init('test/log4js.json').logger('Test');

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
        logger.error('Error occured: ', error);
        if (con.cookie) {
            this.service.engine.logout(con)
            .catch((error) => {
                logger.error('Error occured: ', error);
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
        // Error handler
        .catch((error) => {
            this.handleError(con, error);
        });
    }

    testAuth(con) {
        logger.info("Test auth");
        // Login
        return this.service.engine.login(con)
        // Logout
        .then(() => {
            return this.service.engine.logout(con);
        })
        // Error handler
        .catch((error) => {
            this.handleError(con, error);
        });
    }

    testConfig(con) {
        logger.info("Test config");
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
        // Error handler
        .catch((error) => {
            this.handleError(con, error);
        });
    }

    testGlobalSymbols(con) {
        logger.info("Test global symbols");
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
        // Error handler
        .catch((error) => {
            this.handleError(con, error);
        });
    }

    testKeys(con) {
        logger.info("Test keys");
        // Login
        return this.service.engine.login(con)
        // List
        .then(() => {
            return this.service.keys.list(con);
        })
        .then((response) => {
            logger.info('Keys: ' + JSON.stringify(response.keys));
        })
        // Add one
        .then(() => {
            return this.service.keys.add(con, "EA1BD9DDC9CF0954-4DA6398E3CE81833");
        })
         // Add multiple
        .then(() => {
            return this.service.keys.add(con, ["EA1BD9DDC9CF0954-4DA6398E3CE81833","C7082D3DD393C1A6-8CB896ECA04C984D"]);
        })
		// Remove one
        .then(() => {
            return this.service.keys.remove(con, "EA1BD9DDC9CF0954-4DA6398E3CE81833");
        })
         // Remove multiple
        .then(() => {
            return this.service.keys.remove(con, ["EA1BD9DDC9CF0954-4DA6398E3CE81833","C7082D3DD393C1A6-8CB896ECA04C984D"]);
        })
        // Logout
        .then(() => {
            return this.service.engine.logout(con);
        })
        // Error handler
        .catch((error) => {
            this.handleError(con, error);
        });
    }
	
	testCertificates(con) {
        logger.info("Test certificates");
		// Login
        return this.service.engine.login(con)
        // List
        .then(() => {
			return this.service.certificates.list(con);
		})
		.then((response) => {
            logger.info('Certificates: ' + JSON.stringify(response.certificates));
            logger.info('Candidates: ' + JSON.stringify(response.candidates));
            logger.info('Bindings: ' + JSON.stringify(response.bindings));
        })
/*        // Install
        .then(() => {
            var file = 'test/cacerts.store';
            logger.info('Install certificate : ' + file);
            return this.service.certificates.install(con, file);
        })
        // List
        .then(() => {
			return this.service.certificates.list(con);
		})
		.then((response) => {
            logger.info('Certificates: ' + JSON.stringify(response.certificates));
            logger.info('Candidates: ' + JSON.stringify(response.candidates));
            logger.info('Bindings: ' + JSON.stringify(response.bindings));
        })
        // Update
        .then(() => {
            return this.service.certificates.update(con, 'cacerts.store', 'server', 'pwd', '');
        })
        // List
        .then(() => {
			return this.service.certificates.list(con);
		})
		.then((response) => {
            logger.info('Certificates: ' + JSON.stringify(response.certificates));
            logger.info('Candidates: ' + JSON.stringify(response.candidates));
            logger.info('Bindings: ' + JSON.stringify(response.bindings));
        })*/
        // Logout
        .then(() => {
            return this.service.engine.logout(con);
        })
        // Error handler
        .catch((error) => {
            this.handleError(con, error);
        });
	}
}

var test = new Test();
var con = test.initConnection();
test.testAuth(con);
//test.testServer(con);
//test.testListConfig(con);
//test.testGlobalSymbols(con);
//test.testKeys(con);
//test.testCertificates(con);
        