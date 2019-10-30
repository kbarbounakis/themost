import {QueryExpression} from './QueryExpression';
import {QueryField} from './QueryField';
import {QueryCollection} from './QueryCollection';
import {SqlFormatter2 as SqlFormatter} from './SqlFormatter2';

describe('SqlFormatter', () => {

    it('should create instance', ()=> {
        const formatter = new SqlFormatter();
        expect(formatter).toBeTruthy();
    });

    it('should use SqlFormatter.formatSelect()', ()=> {
        const formatter = new SqlFormatter();
        let query = {
            $collection: {
                'UserData': 1
            },
            $select: {},
        }
        let sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT * FROM `UserData`;');
        formatter.settings.forceAlias = true;
        sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT `UserData`.* FROM `UserData`;');
        query = {
            $collection: {
                'Users': '$UserData'
            },
            $select: {},
        };
        sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT `Users`.* FROM `UserData` AS `Users`;');

    });

    it('should use SqlFormatter.escapeName()', ()=> {
        const formatter = new SqlFormatter();
        expect(formatter.escapeName('actionStatus')).toBe('`actionStatus`');
        expect(formatter.escapeName('$actionStatus')).toBe('`actionStatus`');
        expect(formatter.escapeName('ActionData.actionStatus')).toBe('`ActionData`.`actionStatus`');
        expect(formatter.escapeName('value1')).toBe('`value1`');
        expect(formatter.escapeName('value_100')).toBe('`value_100`');
        expect(formatter.escapeName('family_name')).toBe('`family_name`');
    });

    it('should use SqlFormatter.$eq()', ()=> {
        const formatter = new SqlFormatter();
        let sql = formatter.formatWhere({
            "actionStatus": {  "$eq" : 1 }
        });
        expect(sql).toBe('`actionStatus` = 1');
        sql = formatter.formatWhere({
            "$eq": [ "$actionStatus", 1 ]
        });
        expect(sql).toBe('`actionStatus` = 1');
        sql = formatter.formatWhere({
            "givenName": {  "$eq" : "John" }
        });
        expect(sql).toBe('`givenName` = \'John\'');
        sql = formatter.formatWhere({
            "actionStatus": {  "$eq" : null }
        });
        expect(sql).toBe('`actionStatus` IS NULL');
        sql = formatter.formatWhere({
            "$eq": [ "$actionStatus", { "$add": [ 45, 5 ] } ]
        });
        expect(sql).toBe('`actionStatus` = (45 + 5)');
    });

    it('should use SqlFormatter.$ne()', ()=> {
        const formatter = new SqlFormatter();
        let sql = formatter.formatWhere({
            "actionStatus": {  "$ne" : 1 }
        });
        expect(sql).toBe('NOT (`actionStatus` = 1)');
    });

    it('should use SqlFormatter.$and()', ()=> {
        const formatter = new SqlFormatter();
        let sql = formatter.formatWhere({
            "$and": [
                { "actionStatus": {  "$eq" : 1 } },
                { "owner": {  "$eq" : 'user1' } }
            ]
            
        });
        expect(sql).toBe('(`actionStatus` = 1 AND `owner` = \'user1\')');
        sql = formatter.formatSelect({
            "$collection": {
                "ActionData": 1
            },
            "$select": {

            },
            "$match": {
                "$and": [
                    { "actionStatus": {  "$eq" : 1 } },
                    { "owner": {  "$eq" : 'user1' } }
                ]
            }            
        });
        const sqlToBe = 'SELECT * FROM `ActionData` WHERE (`actionStatus` = 1 AND `owner` = \'user1\');';
        expect(sql).toBe(sqlToBe);
        let q = new QueryExpression().select().from('ActionData').where('actionStatus').equal(1).and('owner').equal('user1');
        expect(formatter.formatSelect(q)).toBe(sqlToBe);
    });

    it('should use SqlFormatter.$or()', ()=> {
        const formatter = new SqlFormatter();
        let sql = formatter.formatWhere({
            "$or": [
                { "owner": {  "$eq" : 'user1' } },
                { "owner": {  "$eq" : 'user2' } }
            ]
        });
        expect(sql).toBe('(`owner` = \'user1\' OR `owner` = \'user2\')');
    });

    it('should use SqlFormatter.formatField()', ()=> {
        const formatter = new SqlFormatter();
        let query = {
            $collection: {
                'Users': '$UserData'
            },
            $select: {
                "id": 1,
                "name": 1
            }
        };
        let sql = formatter.formatSelect(query);
        expect(sql).toBe('SELECT `id`, `name` FROM `UserData` AS `Users`;');
    });

    it('should use SqlFormatter.$min()', ()=> {
        const formatter = new SqlFormatter();
        let sql = formatter.formatField({
            "minPrice" : {
                 "$min": "$price"
            }
        });
        expect(sql).toBe('MIN(`price`) AS `minPrice`');
        sql = formatter.formatField({
            "minPrice" : {
                 "$min": { "$add": [ "$price", 10 ] }
            }
        });
        const sqlToBe = 'MIN((`price` + 10)) AS `minPrice`';
        expect(sql).toBe(sqlToBe);
        const q = new QueryField('price').add(10).min().as('minPrice');
        expect(formatter.formatField(q)).toBe(sqlToBe);
    });

    it('should use SqlFormatter.$max()', ()=> {
        const formatter = new SqlFormatter();
        let sql = formatter.formatField({
            "maxPrice" : {
                 "$max": "$price"
            }
        });
        const sqlToBe = 'MAX(`price`) AS `maxPrice`';
        expect(sql).toBe(sqlToBe);
        const q = new QueryField('price').max().as('maxPrice');
        expect(formatter.formatField(q)).toBe(sqlToBe);
    });

    it('should use SqlFormatter.$avg()', ()=> {
        const formatter = new SqlFormatter();
        let sql = formatter.formatField({
            "avgPrice" : {
                 "$avg": "$price"
            }
        });
        expect(sql).toBe('AVG(`price`) AS `avgPrice`');
    });

    it('should use SqlFormatter.$sum()', ()=> {
        const formatter = new SqlFormatter();
        let sql = formatter.formatField({
            "sumPrice" : {
                 "$sum": "$price"
            }
        });
        expect(sql).toBe('SUM(`price`) AS `sumPrice`');
    });

    it('should use SqlFormatter.escape()', ()=> {
        const formatter = new SqlFormatter();
        let sql = formatter.escape({ "$min": "$price" });
        expect(sql).toBe('MIN(`price`)');
        sql = formatter.escape({ "$min": { "$add": ["$price", 10] } });
        expect(sql).toBe('MIN((`price` + 10))');
    });

    it('should use SqlFormatter.formatOrder()', ()=> {
        const formatter = new SqlFormatter();
        let sql = formatter.formatOrder({
            "$price": -1
        });
        expect(sql).toBe('`price` ASC');

        // change name format to simple
        formatter.settings.nameFormat = '$1';

        let sqlToBe = 'SELECT * FROM Customers ORDER BY Country DESC;'
        let q = new QueryExpression().select().from('Customers')
            .orderByDescending('Country');
        expect(formatter.formatSelect(q)).toBe(sqlToBe);

        sqlToBe = 'SELECT * FROM Customers ORDER BY Country ASC, CustomerName DESC;'
        q = new QueryExpression().select().from('Customers')
            .orderBy('Country')
            .thenByDescending('CustomerName');
        expect(formatter.formatSelect(q)).toBe(sqlToBe);
    });

    it('should use SqlFormatter.formatGroupBy()', ()=> {
        const formatter = new SqlFormatter();
        let sql = formatter.formatGroupBy({
            "$count": "$CustomerID",
            "Country" : 1
        });
        expect(sql).toBe('COUNT(`CustomerID`), `Country`');
        // change name format to simple
        formatter.settings.nameFormat = '$1';
        let sqlToBe = 'SELECT COUNT(CustomerID), Country FROM Customers GROUP BY Country;';
        let q = new QueryExpression().select(new QueryField('CustomerID').count(), new QueryField('Country'))
            .from('Customers')
            .groupBy('Country');
        sqlToBe = 'SELECT COUNT(CustomerID) AS TotalCustomers, Country FROM Customers GROUP BY Country;';
        q = new QueryExpression().select(
            new QueryField('CustomerID').count().as('TotalCustomers'), 
            new QueryField('Country'))
            .from('Customers')
            .groupBy('Country');
        expect(formatter.formatSelect(q)).toBe(sqlToBe);
    });

    

});