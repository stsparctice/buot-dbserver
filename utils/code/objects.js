const deleteKeysFromObject = (origin, keys) => {
    console.log({ origin, keys })
    const newObject = Object.keys(origin).filter(k => keys.includes(k) === false)
        .reduce((obj, key) => {
            obj[key] = origin[key]
            return obj
        }, {})
    return newObject
}


module.exports = { deleteKeysFromObject }