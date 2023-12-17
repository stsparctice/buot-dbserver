let { isSimpleEntity,
    simplifiedObject,
    getPrimaryKeyField,
    getTableColumns,
    getSqlColumnsUpdateCopy,
    disableItem,
} = require('../../../modules/config/config')
const { mockEntity } = require('../../test-utils/entities')

describe('IS_SIMPLE_ENTITY', () => {
    it('should return true when entity is a simple one', () => {
        const result = isSimpleEntity('wl', 'patientUrgency')

        expect(result).toBe(true)
    })
})

describe('SIMPLEFIED_OBJECT', () => {

    it('should return an object that the vakues are onlu primitive values', () => {
        const object = { id: 5, name: 'moshe', createData: 'hello wolrd', itemId: { id: 4, name: 'try', entity: 'items' } }
        const func1 = jest.fn(() => ({
            entity: {
                MTDTable: {
                    entityName: {
                        name: "items",
                        sqlName: "tbl_Items"
                    },
                    description: "Table to mock a regualr entity",
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
                    }]
            }
        }))

        const result = simplifiedObject({ entity: mockEntity, object }, func1)
        expect(result.itemId).toBe(4)
    })
})



describe('GET_PRIMARY KEY FIELD', () => {
    it('should return the primary key field with name attr and sqlName attr', () => {
        const entity = {
            "MTDTable": {
                "entityName": {
                    "name": "levels",
                    "sqlName": "tbl_Levels"
                },
                "description": "Table for the details of levels",
                "defaultColumn": "Name"
            },
            "columns": [
                {
                    "name": "id",
                    "sqlName": "Id",
                    "type": {
                        "type": "INT",
                        "isnull": false
                    },
                    "primarykey": true,
                    "isIdentity": true
                }]
        }

        const primaryKey = getPrimaryKeyField(entity)

        expect(primaryKey.name).toEqual("id")
        expect(primaryKey.sqlName).toEqual('Id')
    })
})

describe('GET TABLE COLUMNS', () => {
    it('should return a  list of all columns objects', () => {
        const result = getTableColumns(mockEntity)
        const length = mockEntity.columns.length
        expect(result.length).toBe(length)
    })
})

describe('GET SQL COLUMNS UPDATE COPY', () => {
    it('should return an array with keys names', () => {
        const result = getSqlColumnsUpdateCopy(mockEntity)
        expect(Array.isArray(result)).toBe(true)
    })
})

describe('DISABLE_ITEM', ()=>{
    it('should build a condition with the primary key field', ()=>{
        const item = { id: 5, name: 'moshe', createData: 'hello wolrd'}
        const func = jest.fn(()=>{
            return {name:'id', sqlName:'Id'}
        })

        const result = disableItem({item, reason:'test', user:'test'}, func)
        
        expect(result.condition).toEqual({id:5})
    })
})

// describe('GET_ENTITY_FROM_CONFIG', ()=>{
//     it('should retutn a full entity', ()=>{

//     })
// })