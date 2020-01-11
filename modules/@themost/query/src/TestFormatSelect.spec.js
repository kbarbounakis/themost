import { QueryCollection } from './QueryCollection';
import { QueryExpression } from './QueryExpression';
// eslint-disable-next-line no-unused-vars
import { MemoryAdapter } from './TestMemoryAdapter.spec';
import {initDatabase} from './TestMemoryDatabase.spec';

describe('Format Select Expressions', () => {
    beforeAll(async () => {
        await initDatabase();
    });

    it('should use QueryExpression.select()', async () => {
        const Products = new QueryCollection('Products');
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Unit,
            x.Price
        })
        .from(Products);
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
    });

    it('should use QueryExpression.take()', async () => {
        const Products = new QueryCollection('Products');
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Unit,
            x.Price
        })
        .from(Products)
        .take(5);
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBe(5);
    });

    it('should use QueryExpression.skip()', async () => {
        const Products = new QueryCollection('Products');
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Unit,
            x.Price
        })
        .from(Products)
        .take(5)
        .skip(5);
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBe(5);
    });

    it('should use QueryExpression.skip()', async () => {
        const Products = new QueryCollection('Products');
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Unit,
            x.Price
        })
        .from(Products)
        .take(5)
        .skip(5);
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBe(5);
    });

    it('should use QueryExpression.count()', async () => {
        const Products = new QueryCollection('Products');
        let a = new QueryExpression().select( x => {
            x.ProductID
        })
        .from(Products)
        .count();
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        expect(result[0].total).toBeTruthy();
    });

    fit('should use QueryExpression.fixed()', async () => {
        let Products = new QueryCollection('Products');
        let a = new QueryExpression().select( () => {
            return {
                ProductID: 4,
                Price: 12,
                ProductName: 'Test Product'
            }
        })
        .from('FixedProduct')
        .join(Products)
        .with(x => x.ProductID, x => x.ProductID)
        .fixed();
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
    });

});