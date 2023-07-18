const { getPool } = require('./sql-connection');
const { getTableFromConfig } = require('../../../modules/config/config')

const create = async function (database, entity, columns, values) {

     const result = await getPool().request().query(`use ${database} INSERT INTO ${entity} (${columns}) VALUES ( ${values} )`);
     return result;
};

const read = async function (query = "") {
     try {
          const result = await getPool().request().query(query.trim());
          if (result.recordset)
               return result.recordset;
          return false
     }
     catch (error) {
          return error
     }
};


const update = async function (database, entity, set, condition) {
     const result = await getPool().request().query(`use ${database} UPDATE ${entity} SET ${set} WHERE ${condition}`);
     return result;
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
