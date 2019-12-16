import { MemoryAdapter } from './TestMemoryAdapter.spec';
import { QueryExpression } from './QueryExpression';
import Customers from './test/config/models/Customer.json';
import Categories from './test/config/models/Category.json';
import Shippers from './test/config/models/Shipper.json';
import Suppliers from './test/config/models/Supplier.json';
import Employees from './test/config/models/Employee.json';
import Products from './test/config/models/Product.json';
import Orders from './test/config/models/Order.json';
import OrderDetails from './test/config/models/OrderDetail.json';

async function migrateAsync(model) {
    await new MemoryAdapter().migrateAsync({
            version: model.version,
            appliesTo: model.source,
            model: model.name,
            add: model.fields
        });
        model.seed.forEach(async (item) => {
            const q = new QueryExpression().insert(item).into(model.source);
            await new MemoryAdapter().executeAsync(q);
        });
}

export async function initDatabase() {
    await migrateAsync(Customers);
    await migrateAsync(Shippers);
    await migrateAsync(Categories);
    await migrateAsync(Suppliers);
    await migrateAsync(Employees);
    await migrateAsync(Products);
    await migrateAsync(Orders);
    await migrateAsync(OrderDetails);
}
