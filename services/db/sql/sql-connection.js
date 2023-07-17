require('dotenv').config();
const { SQL_SERVER, SQL_USERNAME, SQL_PASSWORD, SQL_PORT } = process.env;
const sql = require('mssql');

const poolConfig = () => ({
    driver: SQL_PORT,
    server: SQL_SERVER,
    database: 'master',
    user: SQL_USERNAME,
    password: SQL_PASSWORD,
    options: {
        encrypt: false,
        enableArithAbort: false
    }
});

let pool;
const connectSQL = async () => {
    if (!poolConfig().server || !poolConfig().user || !poolConfig().password) {
        throw new Error('.env file is not valid or is not exsist.')
    }
    if (!pool) {
        pool = new sql.ConnectionPool(poolConfig());
    }
    if (!pool.connected) {
        _ = await pool.connect();
    }
}

const getPool = () => {
    return pool
}

module.exports = {
    getPool,
    connectSQL
};

