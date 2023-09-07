
const config = require('../../data/waiting-list.json')
const projectConfig = require('../../data/projectConfig.json')
let pro = projectConfig.find(e =>
    e.url == 'wl'
)
function getAllObjectByEntitys(project, entity, obj) {
    let collections = config[0].db[0].collections
    let entityData = collections.find(e =>
        e.MTDTable.entityName.name == entity
    )
    let columns = entityData.columns
    columns.forEach(col =>
        obj[col.name] = col.name
    )
    let connectedEntities = project.connected_entities.find(ce =>
        ce.entity == entity)
    console.log({ entity })
    const { subEntities } = connectedEntities

    for (let i = 0; i < subEntities.length; i++) {
        obj[subEntities[i]] = []
        const newObject = getAllObjectByEntitys(project, subEntities[i], {})
        obj[subEntities[i]].push(newObject)

    }
    return obj
}
let tryfromNode = getAllObjectByEntitys(pro,'patient', {})
console.log({ tryfromNode })
module.exports = { getAllObjectByEntitys }