const NodeCache = require('node-cache');
class Cache {
    static cache;
    constructor() {
    }
    static getInstance() {
        if (!Cache.cache) {
            Cache.cache = new NodeCache();
        }
        return Cache.cache;
    }
}
module.exports = Cache;