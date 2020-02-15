import { QueryExpression } from './QueryExpression';
// eslint-disable-next-line no-unused-vars
import {add, subtract, multiply, divide, bitAnd } from 'mathjs';
import { MemoryAdapter } from './TestMemoryAdapter';
import {initDatabase} from './TestMemoryDatabase';

describe('Arithmetic Functions', () => {
    beforeAll(async () => {
        await initDatabase();
    });
    it('should use add operator', async () => {
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( x => {
            return x.Price + 10 > 30;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.Price + 10 ).toBeGreaterThan(30);
        });
    });
    it('should use add method', async () => {
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( x => {
            return add(x.Price, 10) > 30;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.Price + 10 ).toBeGreaterThan(30);
        });
    });
    it('should use subtract operator', async () => {
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( x => {
            return (x.Price - 10 < 30) && (x.Price - 10 > 0);
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.Price - 10).toBeLessThan(30);
            expect(x.Price - 10).toBeGreaterThan(0);
        });
    });

    it('should use subtract method', async () => {
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( x => {
            return (subtract(x.Price, 10) < 30) && (subtract(x.Price, 10) > 0);
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.Price - 10).toBeLessThan(30);
            expect(x.Price - 10).toBeGreaterThan(0);
        });
    });

    it('should use multiply operator', async () => {
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( x => {
            return x.Price * 0.8 < 30;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.Price * 0.8).toBeLessThan(30);
        });
    });

    it('should use multiply method', async () => {
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( x => {
            return multiply(x.Price, 0.8) < 30;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.Price * 0.8).toBeLessThan(30);
        });
    });

    it('should use divide operator', async () => {
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( x => {
            return x.Price / 1.25 < 30;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.Price / 1.25).toBeLessThan(30);
        });
    });

    it('should use divide method', async () => {
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( x => {
            return divide(x.Price, 1.25) < 30;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.Price / 1.25).toBeLessThan(30);
        });
    });

    it('should use bitwise and operator', async () => {

        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( x => {
            return (x.ProductID & 2) === 2;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.ProductID & 2).toBe(2);
        });
    });

    it('should use bitwise and method', async () => {
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( x => {
            return bitAnd(x.ProductID, 2) === 2;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.ProductID & 2).toBe(2);
        });
    });
});