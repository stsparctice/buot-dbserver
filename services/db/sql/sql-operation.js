const { getPool } = require('./sql-connection');
const { getTableFromConfig } = require('../../../modules/config/config')

const create = async function (database, entity, columns, values) {
     try {
          const result = await getPool().request().query(`use ${database} INSERT INTO ${entity} (${columns}) VALUES ( ${values} )`);
          if (result)
               return result;
          return false;
     }
     catch (error) {
          throw error
     }

};

const read = async function (query = "") {
     try {
          const result = await getPool().request().query(query.trim());
          if (result.recordset)
               return result.recordset;
          return false
     }
     catch (error) {
          throw error
     }

};


const update = async function (database, entity, set, condition) {
     try {
          const alias = await getTableFromConfig(entity).MTDTable.collectionName.name
          const entries = Object.entries(set)
          const updateValues = entries.map(value => `${alias}.${value[0]}=${value[1]}`).join(',')
          const result = await getPool().request().query(`use ${database} UPDATE ${alias} SET ${updateValues} FROM ${entity} AS ${alias} WHERE ${condition}`);
          if (result)
               return result;
          return false;
     }
     catch (error) {
          throw error
     }

};

const innerJoin = async function (firstTableName, secondTableName, columns, on, condition, database = 'RapidMed') {
     const result = await getPool().request().query(`use ${database} SELECT ${columns} FROM ${firstTableName} INNER JOIN ${secondTableName} ON ${on} WHERE ${condition}`);
     return result.recordset;
};


module.exports = {
     create,
     read,
     update,
     innerJoin
};
