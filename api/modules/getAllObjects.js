
const config = require('../../data/waiting-list.json')
const projectConfig = require('../../data/projectConfig.json')
let end = {}
// let d = {}
let x = 0
let g = projectConfig.find(e =>
    e.url == 'wl'
)
function getAllObjectByEntitys(entity) {
    let fff = getObject(entity)
    console.log({ fff })
    const obj = {}
    obj[entity] = fff
    return obj
}
function getObject(entity) {
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
        const newObject = getObject(r.subEntities[i])
        x++
        console.log("x", x);
        console.log({ newObject })
        d[r.subEntities[i]] = newObject

    }
    return d
}
let tryfromNode = getAllObjectByEntitys('swimmingPools')
console.log({ tryfromNode })
module.exports = { getAllObjectByEntitys }