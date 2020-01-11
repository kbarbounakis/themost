import {QueryCollection} from './QueryCollection';

describe('QueryCollection', () => {
    it('should create QueryCollection', () => {
        const collection = new QueryCollection('User');
        expect(collection).toBeTruthy(); 
    });
    it('should get QueryCollection.name', () => {
        const collection = new QueryCollection('User');
        expect(collection.name).toBe('User');
        let match = Object.assign(new QueryCollection(), 
        {
            "User": 1
        });
        expect(collection).toEqual(match);
    });
    it('should throw error for new QueryCollection()', () => {
        expect(() => {
            // noinspection JSCheckFunctionSignatures
            new QueryCollection({name: 'User'});
        }).toThrowError();
    });
    it('should use QueryCollection.as()', () => {
        const collection = new QueryCollection('User').as('Users');
        expect(collection.alias).toBe('Users');
        let match = Object.assign(new QueryCollection(), 
        {
            "Users": "$User"
        });
        expect(collection).toEqual(match);
    });
    it('should change QueryCollection.alias', () => {
        const collection = new QueryCollection('User').as('Users');
        collection.as('LocalUsers');
        expect(collection.alias).toBe('LocalUsers');
        let match = Object.assign(new QueryCollection(), 
        {
            "LocalUsers": "$User"
        });
        expect(collection).toEqual(match);
    });
    it('should parse QueryCollection', () => {
        const collection = Object.assign(new QueryCollection(), {
            'Users': "$User"
        });
        expect(collection).toBeTruthy();
        expect(collection.alias).toBe('Users');
        expect(collection.name).toBe('User');
    });
});
