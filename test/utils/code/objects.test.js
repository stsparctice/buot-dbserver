const { removeKeysFromObject } = require('../../../utils/code/objects')

describe('REMOVE KEYS FROM OBJECT', () => {
    it('should remove keys from an object', () => {
        const origin = { x: 45, y: 67, z: 87 }
        const keys = ['x']

        const result = removeKeysFromObject(origin, keys)

        expect(Object.keys(result)).toEqual(['y', 'z'])
    })

    
})