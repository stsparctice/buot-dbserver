const { splitComplicatedObject, compareObject } = require('../../../modules/config/config.objects')
const {mockEntity} = require('../../test-utils/entities')

jest.mock('../../../modules/config/config.js', () => {
    const originalModule = jest.requireActual('../../../modules/config/config.js');
    return {
        ...originalModule,
        getPrimaryKeyField: jest.fn(() => ({ name: 'id', sqlName: 'ID' }))
    }
})

jest.mock('../../../services/db/sql/sql-operation', () => {
    const originalModule = jest.requireActual('../../../services/db/sql/sql-operation');
    return {
        ...originalModule,
        read: jest.fn().mockReturnValueOnce([{ Id: 5, Name: 'sara' }])
        .mockReturnValueOnce([{ Id: 5, Name: 'sara', CreateData:'xxx' }])
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

    it('should return \'true\' when object is the same as in the database', async () => {
        const object = { id: 5, name: 'sara' }

        const database = 'try'
        const result = await compareObject(database, mockEntity, object)
        expect(result).toBeTruthy()
    })

    it('should return an  object whith data to update', async () => {
        const object = { id: 5, name: 'lea',createData:'true'  }
       
        const database = 'try'
        const result = await compareObject(database, mockEntity, object)
        
        expect(typeof(result)).toEqual('object')
        expect(Object.keys(result)).toContain('entity', 'updates', 'condition')
       
    })
})