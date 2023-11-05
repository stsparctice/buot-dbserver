const { compareObject } = require('../../../../services/db/sql/sql-operation')

jest.mock('../../../../modules/config/config.sql.js', () => {
    const originalModule = jest.requireActual('../../../../modules/config/config.sql.js');
    return {
        ...originalModule,
        getPrimaryKeyField: jest.fn(() => ({ name: 'id', sqlName: 'ID' }))
    }
})

describe('COMPARE_OBJECT', () => {
    it('should return an empty array when object is the same as in the database', () => {
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

        const result = compareObject(entity, object)
        expect(result.length).toBe(0)
    })
})