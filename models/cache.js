'use strict';

const NodeCache = require('node-cache');

class Cache {
    constructor() {
        this.cache = new NodeCache();
    }

    set(key, value) {
        this.cache.set(key, value);
    }

    get(key) {
        return this.cache.get(key);
    }

    delete(key) {
        this.cache.del(key);
    }
}

const cache = new Cache();
Object.freeze(cache);

module.exports = cache;