
const config = require('../../data/waiting-list.json')
const projectConfig = require('../../data/projectConfig.json')
let end = {}
// let d = {}
let arr = []
let x = 0
let g = projectConfig.find(e =>
    e.url == 'wl'
)
function getAllObjectByEntitys(entity) {
    let fff = getObject(entity)
    console.log({ fff })
    let obj = {}
    obj[entity] = fff
    return obj
}
function getObject(entity) {
    arr.push(entity)

    d = {}
    let a = config[0].db[0].collections
    let ans = a.find(e =>
        e.MTDTable.entityName.name == entity
    )
    let b = ans.columns
    b.forEach(e =>
        d[e.name] = e.name
    )
    let r = g.connected_entities.find(e =>
        e.entity == entity)
    console.log({ entity, d })
    console.log(r.subEntities)

    for (let i = 0; i < r.subEntities.length; i++) {
        // if (arr.length < 5) {
            const newObject = getObject(r.subEntities[i])
            d[r.subEntities[i]] = newObject

        }
        // else{
        //     return d
        //  }
        // console.log({ newObject })

    // }
    console.log("arr", arr);
    return d
}
let tryfromNode = getAllObjectByEntitys('swimmingPools')
console.log({ tryfromNode })
module.exports = { getAllObjectByEntitys }