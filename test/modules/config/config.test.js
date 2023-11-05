const {isSimpleEntity} = require('../../../modules/config/config')

describe('IS_SIMPLE_ENTITY', ()=>{
    it('should return true when entity is a simple one', ()=>{
        const result = isSimpleEntity('wl', 'levels')

        expect(result).toBe(true)
    })
})