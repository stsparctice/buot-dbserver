const convertToSQLString = (value) => {
    let special = ["'", "&", "%", "#", "$"]
    const sqlStrings = []
    const split = value.split('')
    if (split.some(ch => special.includes(ch))) {
        for (let i = 0; i < split.length; i++) {
            let word = ''
            while (i < split.length && special.indexOf(split[i]) == -1) {
                word += split[i]
                i++
            }
            sqlStrings.push(`N'${word}'`)
            if (i < split.length && special.indexOf(split[i]) != -1) {
                sqlStrings.push(`char(${split[i].charCodeAt()})`)
            }
        }
        const concat = `concat(${sqlStrings.join(',')})`
        return concat
    }

    return `N'${value}'`
}


const types = {

    NVARCHAR: {

        typeNodeName: 'string',
        parseNodeTypeToSqlType: (value) => {
            return convertToSQLString(value)
        }
    },

    BIT: {
        typeNodeName: 'boolean',
        parseNodeTypeToSqlType: (boolean) => {
            return `'${boolean}'`
        }
    },

    DATETIME: {
        typeNodeName: 'Date',
        parseNodeTypeToSqlType: (Date) => {

            return `'${Date}'`
        }
    },

    INT: {
        typeNodeName: 'number',
        parseNodeTypeToSqlType: (number) => {
           
            if (isNaN(number)|| number=='')
                return 0
            else
                return number
        }
    },
    REAL: {
        typeNodeName: 'number',
        parseNodeTypeToSqlType: (number) => {
            if (isNaN(number)|| number=='')
                return 0
            else
                return number
        }
    },
    FLOAT: {
        typeNodeName: 'number',
        parseNodeTypeToSqlType: (number) => {
            if (isNaN(number)|| number=='')
                return 0
            else
                return number
        }
    }
}


module.exports = {types,convertToSQLString}

