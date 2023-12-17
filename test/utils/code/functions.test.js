const {convertToOneLevelArray} = require('../../../utils/code/functions')

describe('CONVERT_TO_ONE_LEVEL_ARRAY', ()=>{
    it('should retirn a one level array', ()=>{
        const array = [1,[1,2], [1,[2],3]]

        const result = convertToOneLevelArray(array)
        expect(result.length).toBe(6)
    })

    it('should return an empty array when no arguments were  sent', ()=>{
        const result = convertToOneLevelArray()
        expect(result.length).toBe(0)
    })
})