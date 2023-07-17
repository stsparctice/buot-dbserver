const { getPool } = require('./sql-connection');
const { getTableFromConfig } = require('../../../modules/config/config')

const create = async function (database, entity, columns, values) {
     // console.log("database:", database, "entity:", entity, "columns:", columns, "values:", values);
     const result = await getPool().request().query(`use ${database} INSERT INTO ${entity} (${columns}) VALUES ( ${values} )`);
     return result;
};


// const read = async function (database, entity, columns, condition, top = '100') {
//      console.log(database, entity, columns, condition);
//      const result = await getPool().request().query(`use ${database} SELECT TOP ${top} ${columns} FROM ${entity} WHERE ${condition}`);
//      return result.recordset;
// };

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

// const deleted = async function (database, entity, condition) {
//      const result = await getPool(database).request().query(`DELETE FROM ${entity} WHERE ${condition}`);
//      return result;
// };

const update = async function (database, entity, set, condition) {
     console.log("database:", database, "entity:", entity, "set:", set, "condition:", condition);
     const result = await getPool().request().query(`use ${database} UPDATE ${entity} SET ${set} WHERE ${condition}`);
     return result;
};

const innerJoin = async function (firstTableName, secondTableName, columns, on, condition, database = 'RapidMed') {
     const result = await getPool().request().query(`use ${database} SELECT ${columns} FROM ${firstTableName} INNER JOIN ${secondTableName} ON ${on} WHERE ${condition}`);
     return result.recordset;
};


//from buyton db server
const readOne = async function (db, obj) {
     try {
          if (!Object.keys(obj).includes("condition")) {
               obj.condition = '1=1';
          };
          if (!Object.keys(obj).includes("n")) {
               obj.n = 100;
          }
          const { tableName, columns, condition, n } = obj;
          const result = await getPool().request().query(`use ${db} select top ${n} ${columns} from ${tableName} as ${getTableFromConfig(tableName).MTDTable.name.name} where ${condition}`);
          return result.recordset;
     }
     catch (error) {
          throw error
     }
};

//from buton db server
const readAll = async function (db, obj) {
     try {
          const { entity, condition } = obj;
          const result = await getPool().request().query(`use ${db} select * from ${entity} as ${getTableFromConfig(entity).MTDTable.collectionName.name} where ${condition}`)
          return result.recordset;
     }
     catch (error) {
          throw error
     }
};

const readMany = async function (db, obj) {
     try {
          const { entity, columns } = obj;
          console.log(entity, columns ,'entity, columns ')
          const result = await getPool().request().query(`use ${db} select ${columns} from ${entity} `)
          return result.recordset;
     }
     catch (error) {
          throw error
     }
}


module.exports = {
     create,
     read,
     update,
     innerJoin,
     readOne,
     readAll,
     readMany
};
