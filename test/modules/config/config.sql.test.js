const { getPrimaryKeyField } = require('../../../modules/config/config.sql')


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