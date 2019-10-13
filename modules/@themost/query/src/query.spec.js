import {QueryEntity} from './query';
describe('QueryEntity', ()=> {
   it('should create instance', ()=> {
       const entity = new QueryEntity('User');
       expect(entity).toBeTruthy();
   });
    it('should get entity name', ()=> {
        const entity = new QueryEntity('User');
        expect(entity.$name).toBe('User');
    });
    it('should use entity alias', ()=> {
        const entity = new QueryEntity('User').as('Users');
        expect(entity.$as).toBe('Users');
    });
    it('should parse entity', ()=> {
        const entity = {
            $name: 'User'
        };
        expect(entity).toBeTruthy();
    });
});
