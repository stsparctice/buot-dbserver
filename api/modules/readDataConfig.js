// const newConfig = require('d:/ruti lev/buot-dbserver/data/newConfig.json')
const newConfig = require('../../data/waiting-list.json')
const exampleConfig = require('../exampleConfig.json')

async function getExampleByEntity(action,name) {
    console.log("start",action);
    // let r ;
    // let a=newConfig.find(e=>
    //     e.dbName=='Bubble'
    // )
    // // לשאול אם אפשר במקום ה0 אם לא לעשות FIND
    // let AllEntity = a.db[0].collections
    // let ad=AllEntity.find(e=>
    //     e.MTDTable.collectionName.name==name
    // )
    // let values = {}
    // ad.columns.forEach(e => {
    //     // e.type.includes("NVARCHAR")?e.type="string":e.type.includes("INT")?e.type="number":''
    //     values[e.name] = e.example
    // });
    // // Object.values(values).forEach(e=>{
    // //     e.indexOf("NVARCHAR")?e = 'string':
    // //     ''
    // // })
    // let example = {
    //     entity:name,
    //     values:values
    // }
    // console.log("fffffffffffffffffffffffffffffffffffffffffffffffffffff",a.db);
    // return example
let example={}
    if(action == "create"){
        let a = exampleConfig.find(e =>
            e.nameEntity == name
        )
        let values = a.data.example1
        example = {
            entity:name,
            values:values
        }
    }
    if(action == "read"){
        console.log("connect",action);
        let a = exampleConfig.find(e =>
            e.nameEntity == name
        )
        // לשאול את המורה אם זה טוב שבכל צהקונדישנים הדוגמא לתנאי יהיה אידי כי תמיד יש את זה
        console.log("kkkkkk",a.data.example1.Id);
    }
    console.log("example");
   return example;
}
module.exports = { getExampleByEntity }