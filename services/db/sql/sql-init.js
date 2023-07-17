const { db } = require('./build-connection')
const { getPool } = require('./sql-connection')
const data = require('../../../data/newConfig.json')

function buildColumns(details) {
    let columns = '';
    for (let i = 0; i < details.length; i++) {
        columns += (details[i]['name']) + ' ' + (details[i]['type']) + ', ';
    };
    columns = columns.substring(0, columns.length - 2);
    return columns;
};

async function createTables() {
    for (let index = 0; index < db.length; index++) {
        _ = await getPool(db[index]).request().query(`use master IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = '${db[index]}') begin use master CREATE DATABASE [${db[index]}]; end`);
    }
    data.forEach(dbName => {
        dbName.db.forEach(db => {
            if (db.type === 'sql') {
                db.collections.forEach(async table => {
                    _ = await getPool(dbName.dbName).request().query(`use ${dbName.dbName} IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '${table.MTDTable.collectionName.sqlName}')
                    CREATE TABLE [dbo].[${table.MTDTable.collectionName.sqlName}](${buildColumns(table.columns)})`);
                });
            } 
        });
    });
};

module.exports = { createTables };
