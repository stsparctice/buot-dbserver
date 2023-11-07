const { splitComplicatedObject, compareObject } = require('../../../modules/config/config.objects')

jest.mock('../../../modules/config/config.sql.js', () => {
    const originalModule = jest.requireActual('../../../modules/config/config.sql.js');
    return {
        ...originalModule,
        getPrimaryKeyField: jest.fn(() => ({ name: 'id', sqlName: 'ID' }))
    }
})

jest.mock('../../../services/db/sql/sql-operation', () => {
    const originalModule = jest.requireActual('../../../services/db/sql/sql-operation');
    return {
        ...originalModule,
        read: jest.fn(() => { return [{ Id: 5, Name: 'sara' }] })
    }
})

describe('SPLIT_COMPLICATED_OBJECT', () => {
    it('should return an object', () => {
        const object = { id: '123', name: 'aaa', list: [{ start: 1, end: 2 }] }

        const result = splitComplicatedObject(object, 'person')

        expect(result.length).toBe(2)
    })
})



describe('COMPARE_OBJECT', () => {

    it('should return an empty array when object is the same as in the database', async () => {
        const object = { id: 5, name: 'sara' }
        const entity = {
            MTDTable: {
                entityName: {
                    name: "levels",
                    sqlName: "tbl_Levels"
                },
                description: "Table for the details of levels",
                defaultColumn: "Name"
            },
            columns: [
                {
                    name: "id",
                    sqlName: "Id",
                    type: {
                        type: "INT",
                        isnull: false
                    },
                    primarykey: true,
                    isIdentity: true
                },
                {
                    name: "name",
                    sqlName: "Name",
                    type: {
                        type: "NVARCHAR",
                        max: 50,
                        isnull: false
                    },
                    uniquekey: true
                }]
        }

        const database = 'try'
        const result = await compareObject(database, entity, object)
        expect(result.length).toBe(0)
    })

    it('should return an  array whith updated  data', async () => {
        const object = { id: 5, name: 'lea' }
        const entity = {
            MTDTable: {
                entityName: {
                    name: "levels",
                    sqlName: "tbl_Levels"
                },
                description: "Table for the details of levels",
                defaultColumn: "Name"
            },
            columns: [
                {
                    name: "id",
                    sqlName: "Id",
                    type: {
                        type: "INT",
                        isnull: false
                    },
                    primarykey: true,
                    isIdentity: true
                },
                {
                    name: "name",
                    sqlName: "Name",
                    type: {
                        type: "NVARCHAR",
                        max: 50,
                        isnull: false
                    },
                    uniquekey: true
                }]
        }

        const database = 'try'
        const result = await compareObject(database, entity, object)
        const resultKeys = Object.keys(result[0])
        expect(result.length).toBe(1)
        expect(Object.keys(result[0])).toContain(...resultKeys)
       
    })
})