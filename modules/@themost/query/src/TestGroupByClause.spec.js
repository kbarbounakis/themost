import { QueryCollection } from './QueryCollection';
import { QueryExpression } from './QueryExpression';
// eslint-disable-next-line no-unused-vars
import { MemoryAdapter } from './TestMemoryAdapter';
import {initDatabase} from './TestMemoryDatabase';

fdescribe('Aggregate Functions', () => {
    beforeAll(async () => {
        await initDatabase();
    });
    it('should use groupBy()', async () => {
        let a = new QueryExpression().select( x => {
            return {
                // eslint-disable-next-line no-undef
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
                // eslint-disable-next-line no-undef
                TotalOrders: count(x.OrderID),
                ShipperName: Shippers.ShipperName
            }
        }, {
            Shippers
        })
        .from(Orders)
        .join(Shippers)
        .with( x => x.Shipper, y => y.ShipperID)
        // eslint-disable-next-line no-unused-vars
        .groupBy ( x => {
            Shippers.ShipperName
        }, {
            Shippers
        });
        let result = await new MemoryAdapter().executeAsync(a);
        expect(result.length).toBeTruthy();
    });
});