const { db } = require('./build-connection')
const { getPool } = require('./sql-connection')
const {getEntityFromConfig} = require('../../../modules/config/config')
const { getAllDBConfig } = require('../../../modules/config/project.config')
const { DBTypes } = require('../../../utils/types')

function buildColumns(details) {
    let columns = '';
    for (let i = 0; i < details.length; i++) {
        columns += (details[i]['sqlName']) + ' ' + (details[i]['type']) + ', ';
    };
    columns = columns.substring(0, columns.length - 2);
    return columns;
};

async function createTables() {
    const list = getAllDBConfig()
    console.log({list})
    for (let index = 0; index < db.length; index++) {
        _ = await getPool(db[index]).request().query(`use master IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = '${db[index]}') begin use master CREATE DATABASE [${db[index]}]; end`);
    }

    for (const dbConfig of list) {
        const config = getEntityFromConfig(dbConfig)
        config.forEach(dbName => {
            dbName.db.forEach(db => {
                if (db.type === DBTypes.SQL) {
                    db.collections.forEach(async table => {
                        _ = await getPool(dbName.dbName).request().query(`use ${dbName.dbName} IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '${table.MTDTable.collectionName.sqlName}')
                    CREATE TABLE [dbo].[${table.MTDTable.collectionName.sqlName}](${buildColumns(table.columns)})`);
                    });
                }
            });
        });
    }
};

module.exports = { createTables };
