const { db } = require('./build-connection')
const { getPool } = require('./sql-connection')
const { buildColumns } = require('./sql-crud-db')
const { getEntitiesFromConfig } = require('../../../modules/config/config')
const { getAllDBConfig } = require('../../../modules/config/project.config')
const { DBTypes } = require('../../../utils/types')



async function createTables() {
    const list = getAllDBConfig()
    for (const dbConfig of list) {
        const sqlConfig = getEntitiesFromConfig(dbConfig).sql
        if (sqlConfig.length > 0) {
            for (const item of sqlConfig) {
                try {
                    _ = await getPool().request().query(`use master IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = '${item.dbName}') begin use master CREATE DATABASE [${item.dbName}]; end`);
                    for (let table of item.tables) {
                        const response = await getPool().request().query(`use ${item.dbName} IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '${table.MTDTable.entityName.sqlName}')
                    CREATE TABLE [dbo].[${table.MTDTable.entityName.sqlName}](${buildColumns(table.columns)})`);

                    }
                }
                catch (error) {
                    throw (error)
                }

            }
        }
    }
};

module.exports = { createTables };
