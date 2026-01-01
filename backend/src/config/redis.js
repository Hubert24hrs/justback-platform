const redis = require('redis');
const { logger } = require('../utils/logger');

let client;

async function connectRedis() {
    try {
        client = redis.createClient({
            socket: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT
            },
            password: process.env.REDIS_PASSWORD || undefined
        });

        client.on('error', (err) => logger.error('Redis Client Error', err));
        client.on('connect', () => logger.info('✅ Redis connected'));

        await client.connect();
        return client;
    } catch (error) {
        logger.error('Failed to connect to Redis:', error);
        throw error;
    }
}

async function get(key) {
    return await client.get(key);
}

async function set(key, value, expirationInSeconds = 3600) {
    return await client.setEx(key, expirationInSeconds, JSON.stringify(value));
}

async function del(key) {
    return await client.del(key);
}

module.exports = {
    connectRedis,
    get,
    set,
    del,
    client
};
