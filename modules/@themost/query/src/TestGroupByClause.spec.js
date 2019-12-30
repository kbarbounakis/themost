import { QueryCollection } from './QueryCollection';
import { QueryExpression } from './QueryExpression';
// eslint-disable-next-line no-unused-vars
import { MemoryAdapter } from './TestMemoryAdapter.spec';
import {initDatabase} from './TestMemoryDatabase.spec';

describe('Aggregate Functions', () => {
    beforeAll(async () => {
        await initDatabase();
    });
    it('should use groupBy()', async () => {
        let a = new QueryExpression().select( x => {
            return {
                TotalCustomers: count(x.CustomerID),
                Country: x.Country
            }
        })
        .from('Customers')
        .groupBy ( x => {
            x.Country
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
    });
    it('should use groupBy() with join()', async () => {
        const Shippers = new QueryCollection('Shippers');
        const Orders = new QueryCollection('Orders');
        let a = new QueryExpression().select( x => {
            return {
                TotalOrders: count(x.OrderID),
                ShipperName: Shippers.ShipperName
            }
        }, {
            Shippers
        })
        .from(Orders)
        .join(Shippers)
        .with( x => x.Shipper, y => y.ShipperID)
        .groupBy ( x => {
            Shippers.ShipperName
        }, {
            Shippers
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
    });
});