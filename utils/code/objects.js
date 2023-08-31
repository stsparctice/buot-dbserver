const deleteKeysFromObject = (origin, keys) => {
    console.log({origin, keys})
    const newObject = Object.keys(origin).filter(k => keys.includes(k) === false)
        .reduce((obj, key) => obj[key] = origin[k], {})
    return newObject
}


module.exports = {deleteKeysFromObject}