// const express = require('express');
// const router = require('express').Router()
// const data = require('../data/data.json')
// const { readMongo, insertMongo, updateMongo, deleteMongo } = require('../module/mongo_db');
// const { readSQL, updateSQL, createSQL, deleteSQL } = require('../module/sql');
// const { findDiagnosis } = require('../module/diagnosis');

// let result
// router.post('/insert', express.json(), async (req, res) => {
//     let details = req.body
//     let obj = findCollection(details.entity)
//     if (obj.type == 'sql')
//         result = await createSQL(obj.dbName, details)
//     else {
//         let sendObj = {}
//         obj.fields.forEach(element => {
//             let s = Object.keys(element)[0]
//             if (details[s] !== undefined) {
//                 sendObj[Object.values(element)[0].name] = details[s]
//             }
//             console.log('sendObj', sendObj);
//         });
//         sendObj['entity'] = obj.collectionName[details.entity]
//         result = await insertMongo(sendObj)
//     }
//     res.send(result)
// })

// router.post('/update', express.json(), async (req, res) => {
//     let details = req.body
//     let obj = findCollection(details.entity)
//     if (obj.type == 'sql')
//         result = await updateSQL(obj.dbName, details)
//     else
//         result = await updateMongo(obj.collectionName[details.entity], details.filter, details.update, details.options)
//     res.send(result)
// })

// router.post('/delete', express.json(), async (req, res) => {
//     let details = req.body
//     let obj = findCollection(details.entity)
//     if (obj.type == 'sql')
//         result = await deleteSQL(obj.dbName, details)
//     else
//         result = await deleteMongo(obj.collectionName[details.entity], details.filter)
//     res.send(result)
// })

// router.post('/read', express.json(), async (req, res) => {
//     let details = req.body
//     let obj = findCollection(details.entity)
//     if (obj) {
//         if (obj.type == 'sql')
//             result = await readSQL(obj.dbName, details)
//         else
//             result = await readMongo(obj.collectionName[details.entity], details.filter, details.project)
//     }
//     else {
//         if (details.secondTableName) {
//             let database = details.database
//             delete details.database
//             result = await readSQL(database, details)
//         }
//     }
//     console.log('result', result);
//     res.send(result)
// })

// router.get('/', async (req, res) => {
//     let ans = await findDiagnosis()
//     res.send(ans)
// })

// function findCollection(collectionName) {
//     let type
//     for (let i = 0; i < data.length; i++) {
//         for (let j = 0; j < data[i].db.length; j++) {
//             type = data[i].db[j].type
//             let find = data[i].db[j].collections.find(col => Object.keys(Object.values(col)[0])[0] == collectionName)
//             if (find != undefined) {
//                 find.dbName = data[i].dbName
//                 find.type = type
//                 return find
//             }
//         }
//     }
// }

// module.exports = router
