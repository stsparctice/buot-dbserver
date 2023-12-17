const mockEntity = {
    MTDTable: {
        entityName: {
            name: "mockEntity",
            sqlName: "tbl_MockEntity"
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
            uniquekey: true
        },

        {
            name: "createData",
            sqlName: "CreateData",
            type: {
                type: "NVARCHAR",
                max: 50,
                isnull: false
            },
            update: 'create'
        },
        {
            name: "itemId",
            sqlName: "ItemId",
            type: {
                type: "INT",
                isnull: false
            },
            foreignkey: {
                ref_table: "tbl_Items",
                ref_column: "Id"
            }
        },
        {
            name: "disabled",
            sqlName: "Disabled",
            type: {
                type: "BIT",
                isnull: false
            },
            update_copy: false
        },
        {
            name: "disabledDate",
            sqlName: "DisabledDate",
            type: {
                type: "DATETIME",
                isnull: true
            },
            update_copy: false
        },
        {
            name: "disableUser",
            sqlName: "DisableUser",
            type: {
                type: "NVARCHAR",
                max: 50,
                isnull: true
            },
            update_copy: false
        },
        {
            name: "disableReason",
            sqlName: "DisableReason",
            type: {
                type: "NVARCHAR",
                max: 20,
                isnull: true
            },
            update_copy: false
        }
    ]
}

module.exports = { mockEntity }