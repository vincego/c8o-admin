const CertificatesService = require('./CertificatesService');
const ConfigService = require('./ConfigService');
const EngineService = require('./EngineService');
const GlobalSymbolsService = require('./GlobalSymbolsService');
const ProjectsService = require('./ProjectsService');
const RolesService = require('./RolesService');
const KeysService = require('./KeysService');

module.exports = class Service {

    constructor() {
        this._certificates = new CertificatesService();
        this._config = new ConfigService();
        this._engine = new EngineService();
        this._globalSymbols = new GlobalSymbolsService();
        this._projects = new ProjectsService();
        this._roles = new RolesService();
        this._keys = new KeysService();
    }

    /**
     * Get certificates service.
     * @return {CertificatesService}
     */
    get certificates() {
        return this._certificates;
    }

    /**
     * Get configuration service.
     * @return {ConfigService}
     */
    get config() {
        return this._config;
    }

    /**
     * Get engine service.
     * @return {EngineService}
     */
    get engine() {
        return this._engine;
    }
    /**
     * Get global symbols service.
     * @return {GlobalSymbolsService}
     */
    get globalSymbols() {
        return this._globalSymbols;
    }
    /**
     * Get projects service.
     * @return {ProjectsService}
     */
    get projects() {
        return this._projects;
    }
    /**
     * Get roles service.
     * @return {RolesService}
     */
    get roles() {
        return this._roles;
    }
    /**
     * Get keys service.
     * @return {KeysService}
     */
    get keys() {
        return this._keys;
    }
}
