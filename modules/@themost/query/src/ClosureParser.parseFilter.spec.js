import {ClosureParser} from './ClosureParser';
import { QueryCollection } from './QueryCollection';
import { QueryExpression } from './QueryExpression';
import { SqlFormatter } from './SqlFormatter';
// eslint-disable-next-line no-unused-vars
import {round, ceil, floor, mod, multiply, subtract, divide, add, bitAnd, min, max} from 'mathjs';
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

    it('should use String.prototype.toLowerCase()', async () => {
        let a = new QueryExpression().select( x => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( x => {
            return x.CustomerName.toLowerCase() === 'around the horn';
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
    });

    it('should use String.prototype.toUpperCase()', async () => {
        let a = new QueryExpression().select( x => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( x => {
            return x.CustomerName.toUpperCase() === 'AROUND THE HORN';
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
    });

    it('should use String.prototype.substr()', async () => {
        let a = new QueryExpression().select( x => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( x => {
            return x.CustomerName.substr(0,6) === 'Cactus';
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.CustomerName.substr(0,6)).toBe('Cactus');
        });
    });

    it('should use String.prototype.startsWith()', async () => {
        let a = new QueryExpression().select( x => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( x => {
            return x.CustomerName.startsWith('Cactus') === true;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.CustomerName.startsWith('Cactus')).toBe(true);
        });
    });

    it('should use String.prototype.endsWith()', async () => {
        let a = new QueryExpression().select( x => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( x => {
            return x.CustomerName.endsWith('Holdings') === true;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.CustomerName.endsWith('Holdings')).toBe(true);
        });
    });

    it('should use String.prototype.indexOf()', async () => {
        let a = new QueryExpression().select( x => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( x => {
            return x.CustomerName.indexOf('Holdings') > 0;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.CustomerName.indexOf('Holdings')).toBeGreaterThan(0);
        });
    });

    it('should use String.prototype.length', async () => {
        let a = new QueryExpression().select( x => {
            x.CustomerID,
            x.CustomerName,
            x.ContactName
        })
        .from('Customers').where( x => {
            return x.CustomerName.length >= 18;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.CustomerName.length).toBeGreaterThanOrEqual(18);
        });
    });

    

    

    it('should use parameters', async () => {
        let maximumPrice = 30;
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( x => {
            return x.Price < maximumPrice;
        }, {
             maximumPrice
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.Price / 1.25).toBeLessThan(30);
        });
    });

    it('should use Date.prototype.getFullYear()', async () => {
        let a = new QueryExpression().select( x => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( x => {
            return x.OrderDate.getFullYear() === 1996;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.OrderDate.getFullYear()).toBe(1996);
        });
    });

    it('should use Date.prototype.getMonth()', async () => {
        let a = new QueryExpression().select( x => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( x => {
            return x.OrderDate.getMonth() === 2;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.OrderDate.getMonth()).toBe(1);
        });
    });

    it('should use Date.prototype.getDate()', async () => {
        let a = new QueryExpression().select( x => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( x => {
            return x.OrderDate.getDate() === 22;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.OrderDate.getDate()).toBe(22);
        });
    });

    it('should use Date.prototype.getHours()', async () => {
        let a = new QueryExpression().select( x => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( x => {
            return x.OrderDate.getHours() === 14;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.OrderDate.getHours()).toBe(14);
        });
    });

    it('should use Date.prototype.getMinutes()', async () => {
        let a = new QueryExpression().select( x => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( x => {
            return x.OrderDate.getMinutes() === 50;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( x => {
            expect(x.OrderDate.getMinutes()).toBe(50);
        });
    });

    it('should use Date.prototype.getSeconds()', async () => {
        let a = new QueryExpression().select( x => {
            x.OrderID,
            x.Customer,
            x.Employee,
            x.OrderDate,
            x.Shipper
        })
        .from('Orders').where( x => {
            return x.OrderDate.getSeconds() > 0;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeFalsy();
    });

    it('should use QueryExpression.orderBy()', async () => {
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( x => {
            return x.Price < 10;
        }).orderBy( x => { 
             x.Price
            });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x, index) => {
            if (index>0) {
                expect(x.Price).toBeGreaterThanOrEqual(result[index-1].Price);
            }
            
        });
    });

    it('should use QueryExpression.orderByDescending()', async () => {
        let a = new QueryExpression().select( x => {
            x.ProductID,
            x.ProductName,
            x.Price
        })
        .from('Products').where( x => {
            return x.Price < 10;
        }).orderByDescending( x => { 
             x.Price
            });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
        result.forEach( (x, index) => {
            if (index>0) {
                expect(x.Price).toBeLessThanOrEqual(result[index-1].Price);
            }
            
        });
    });

    it('should use QueryExpression.join()', async () => {
        let a = new QueryExpression().select( x => {
            x.OrderID,
            x.OrderDate,
            x.Customer
        })
        .from('Orders')
        .join('Customers')
        .with('Customer', 'CustomerID')
        .where( x => {
            return x.Customer === 14;
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
    });
    
});