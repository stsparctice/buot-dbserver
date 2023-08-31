const deleteKeysFromObject= (origin, keys)=>{
    const  newObject= Object.keys(origin).filter(key =>
       !keys.includes(key)).reduce((obj, key) =>
        {
            obj[key] = origin[key];
            return obj;
        }, {}
    );

    return newObject

}

module.exports = {deleteKeysFromObject}