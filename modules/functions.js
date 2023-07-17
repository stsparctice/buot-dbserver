const data = require('../data/newConfig.json')

function createArrColumns(arr) {
    let arrColumns = []
    let s
    for (let i = 0; i < arr.length; i++) {
        s = `[${arr[i]}]`
        arrColumns.push(s)
    }
    return arrColumns
}

function createArrValues(arr) {
    let arrColumns = []
    let s
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].includes('/'))
            arrColumns.push(arr[i])
        else {
            s = `'${arr[i]}'`
            arrColumns.push(s)
        }
    }
    return arrColumns
}

function findCollection(collectionName) {
    let type
    for (let i = 0; i < data.length; i++) {
        
        for (let j = 0; j < data[i].db.length; j++) {
     
            type = data[i].db[j].type
            let find = data[i].db[j].collections.find(col =>
                (col.MTDTable.collectionName.name == collectionName)
            )
          
            if (find != undefined) {
                find = find.MTDTable
                find.dbName = data[i].dbName
                find.type = type
                return find
            }
        }
    }
}

module.exports = { createArrColumns, createArrValues, findCollection }
