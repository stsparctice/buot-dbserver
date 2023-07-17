const { innerJoin } = require('../services/db/sql/sql-operation')

async function findDiagnosis() {
    let ans = await innerJoin('Patients','פגישות as app',`Patients.id, app.date`,`app.patid = patients.patid`,`symbol = 4 and arrived =1`)
    return ans.recordset
}

module.exports = { findDiagnosis }