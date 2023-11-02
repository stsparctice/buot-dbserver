const { getEntityFromConfig } = require('./config/config')
const { getDBConfig } = require('./config/project.config')



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




module.exports = { createArrColumns, createArrValues}
