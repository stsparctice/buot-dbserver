const { buildColumnsValuesPair,
    buildInsertQuery } = require('../../../modules/config/config.sql')
const { getTableColumns } = require('../../../modules/config/config')
const { mockEntity } = require('../../test-utils/entities')

describe('BUILD COLUMNS VALUES PAIR', () => {
    it('should return an object', () => {
        const object = { name: 'x', createData: 'hello world' }
        const types = getTableColumns(mockEntity)
        const { columns, values } = buildColumnsValuesPair(object, types)

        expect(columns.length).toBe(2)
        expect(values.length).toBe(2)
    })
})

describe('BUILD INSERT QUERY', () => {
    it('should return a good sql query', () => {
        const object = { name: 'x', createData: 'hello world' }
        mockEntity.dbName = 'try'
        const query = buildInsertQuery(mockEntity, object)

        expect(query).toMatch(/INSERT INTO/)
    })
})
