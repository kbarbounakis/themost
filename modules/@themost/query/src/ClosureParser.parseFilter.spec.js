import {ClosureParser} from './ClosureParser';
import { QueryCollection } from './QueryCollection';
import { QueryExpression } from './QueryExpression';
import { SqlFormatter } from './SqlFormatter';
// eslint-disable-next-line no-unused-vars
import {round, ceil, floor, mod, multiply, subtract, divide, add, bitAnd} from 'mathjs';
import { MemoryAdapter } from './TestMemoryAdapter.spec';
import {initDatabase} from './TestMemoryDatabase.spec';

describe('ClosureParser.parseFilter()', () => {
    beforeAll(async () => {
        await initDatabase();
    });
    it('should use object property to an equal expression', async () => {
        let a = new QueryExpression().select( x => {
            x.CustomerID,
            x.CustomerName
        })
        .from('Customers').where( x => {
            return x.CustomerID === 78;
        });
        expect(a.$match).toEqual({
                "CustomerID": { "$eq": 78 }
            });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result).toBeTruthy();
        expect(result.length).toBe(1);
        expect(result[0].CustomerID).toBe(78);
        
    });

    it('should use object property to an equal expression', async () => {
        let a = new QueryExpression().select( x => {
            return {
                CustomerID: x.CustomerID,
                Name: x.CustomerName
            };
        })
        .from('Customers').where( x => {
            return x.CustomerID === 78;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result).toBeTruthy();
        expect(result.length).toBe(1);
        expect(result[0].CustomerID).toBe(78);
        expect(result[0].Name).toBeTruthy();
    });

    it('should use greater than expression', async () => {
        let a = new QueryExpression().select( x => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( x => {
            return x.CustomerID > 78;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.CustomerID).toBeGreaterThan(78);
        });
    });
    it('should use lower than expression', async () => {
        let a = new QueryExpression().select( x => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( x => {
            return x.CustomerID < 78;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.CustomerID).toBeLessThan(78);
        });
    });

    it('should use between expression', async () => {
        let a = new QueryExpression().select( x => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( x => {
            return x.CustomerID > 78 && x.CustomerID < 81;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.CustomerID).toBeGreaterThan(78);
            expect(x.CustomerID).toBeLessThan(81);
        });
    });

    it('should use greater than or equal expression', async () => {
        let a = new QueryExpression().select( x => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( x => {
            return x.CustomerID >= 78;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.CustomerID).toBeGreaterThanOrEqual(78);
        });
    });

    it('should use lower than or equal expression', async () => {
        let a = new QueryExpression().select( x => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( x => {
            return x.CustomerID <= 78;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.CustomerID).toBeLessThanOrEqual(78);
        });
    });
    
});