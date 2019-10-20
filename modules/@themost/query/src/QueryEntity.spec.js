import {QueryEntity} from './QueryEntity';

describe('QueryEntity', () => {
    it('should create QueryEntity', () => {
        const entity = new QueryEntity('User');
        expect(entity).toBeTruthy(); 
    });
    it('should get QueryEntity.name', () => {
        const entity = new QueryEntity('User');
        expect(entity.name).toBe('User');
        expect(JSON.stringify(entity)).toBe('{"$User":{}}');
    });
    it('should throw error for new QueryEntity()', () => {
        expect(() => {
            // noinspection JSCheckFunctionSignatures
            new QueryEntity({name: 'User'});
        }).toThrowError();
    });
    it('should use QueryEntity.as()', () => {
        const entity = new QueryEntity('User').as('Users');
        expect(entity.alias).toBe('Users');
        expect(JSON.stringify(entity)).toBe('{"Users":{"$User":{}}}');
    });
    it('should change QueryEntity.alias', () => {
        const entity = new QueryEntity('User').as('Users');
        entity.as('LocalUsers');
        expect(entity.alias).toBe('LocalUsers');
        expect(JSON.stringify(entity)).toBe('{"LocalUsers":{"$User":{}}}');
    });
    it('should parse QueryEntity', () => {
        const entity = Object.assign(new QueryEntity(), {
            'Users': {
                '$User': {
                    "id": 1,
                    "name": 1
                 }
            }
        });
        expect(entity).toBeTruthy();
        expect(entity.alias).toBe('Users');
        expect(entity.name).toBe('User');
        expect(JSON.stringify(entity)).toBe('{"Users":{"$User":{"id":1,"name":1}}}');
    });
});
