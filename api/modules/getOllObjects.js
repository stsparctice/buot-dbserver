
const config = require('../../data/waiting-list.json')
const projectConfig = require('../../data/projectConfig.json')
let end = {}
let d = {}
let g = projectConfig.find(e =>
    e.url == 'wl'
)
async function getOllObjectByEntitys(entity) {
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
    if (r.subEntities.length > 0) {
        r.subEntities.forEach(e => {
        d[e]=getOllObjectByEntitys(e)
        })
        end[entity] = d    

    }
    
    
    
    return end
}
module.exports = { getOllObjectByEntitys }


