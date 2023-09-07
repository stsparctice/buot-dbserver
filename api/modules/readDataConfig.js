const newConfig = require('d:/ruti lev/buot-dbserver/data/newConfig.json')

async function getExampleByEntity(name){
    let r ;
    let a=newConfig.find(e=>

        e.dbName=='Bubble'

    )
    // לשאול אם אפשר במקום ה0 אם לא לעשות FIND
    let AllEntity = a.db[0].collections
    let ad=AllEntity.find(e=>
        e.MTDTable.entityName.name==name
    )
    let values = {}
    ad.columns.forEach(e => {
        // e.type.includes("NVARCHAR")?e.type="string":e.type.includes("INT")?e.type="number":''
        values[e.name] = e.example
    });
    // Object.values(values).forEach(e=>{
    //     e.indexOf("NVARCHAR")?e = 'string':
    //     ''
    // })
    let example = {
        entity:name,
        values:values
    }
    return example
}

module.exports = {getExampleByEntity}