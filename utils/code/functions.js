function convertToOneLevelArray(dataList=[]){
    while (dataList.some(item => Array.isArray(item))) {
        dataList = dataList.reduce((arr, item) => {
            if (Array.isArray(item))
                arr = [...arr, ...item]
            else
                arr = [...arr, item]
            return arr
        }, [])
        console.log({dataList})
    }
    return dataList
}

module.exports = {convertToOneLevelArray}