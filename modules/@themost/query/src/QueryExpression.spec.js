import {QueryExpression} from './QueryExpression';
import {QueryField} from './QueryField';
import {QueryCollection} from './QueryCollection';

describe('QueryExpression', () => {
    it('should use QueryExpression.where()', () => {
        const a = new QueryExpression().where('id').equal(100);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$match": {
                "id": { "$eq": 100 }
            }
        });
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.or()', () => {
        const a = new QueryExpression().where('status').equal('completed').or('status').equal('cancelled');
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$match": {
                "$or": [
                    {
                        "status": { "$eq": "completed" }
                    },
                    {
                        "status": { "$eq": "cancelled" }
                    }
                ]
            }
        });
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.and()', () => {
        const a = new QueryExpression().where('status').equal('completed').and('owner').equal('user1');
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$match": {
                "$and": [
                    {
                        "status": { "$eq": "completed" }
                    },
                    {
                        "owner": { "$eq": "user1" }
                    }
                ]
            }
        });
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.equal()', () => {
        let a = new QueryExpression().where('status').equal('completed');
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$match": {
                "status": { "$eq": "completed" }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('status').eq('completed');
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.notEqual()', () => {
        let a = new QueryExpression().where('status').notEqual('completed');
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$match": {
                "status": { "$ne": "completed" }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('status').ne('completed');
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.greaterThan()', () => {
        let a = new QueryExpression().where('price').greaterThan(600);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$match": {
                "price": { "$gt": 600 }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('price').gt(600);
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.greaterOrEqual()', () => {
        let a = new QueryExpression().where('price').greaterOrEqual(600);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$match": {
                "price": { "$gte": 600 }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('price').gte(600);
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.lowerThan()', () => {
        let a = new QueryExpression().where('price').lowerThan(600);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$match": {
                "price": { "$lt": 600 }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('price').lt(600);
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.lowerOrEqual()', () => {
        let a = new QueryExpression().where('price').lowerOrEqual(600);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$match": {
                "price": { "$lte": 600 }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('price').lte(600);
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.between()', () => {
        let a = new QueryExpression().where('price').between(600, 800);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$match": {
                "$and": [
                    { "price": { "$gte": 600 } },
                    { "price": { "$lte": 800 } }
                ]
            }
        });
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.contains()', () => {
        let a = new QueryExpression().where('givenName').contains('oh');
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$match": {
                "givenName": { $text: { $search: 'oh' } }
            }
        });
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.notContains()', () => {
        let a = new QueryExpression().where('givenName').notContains('oh');
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$match": {
                "givenName": { 
                    "$not": { 
                        "$text": { 
                            "$search": 'oh' 
                        } 
                    } 
                }
            }
        });
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.startsWith()', () => {
        let a = new QueryExpression().where('givenName').startsWith('Jo');
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$match": {
                "givenName": { "$regex": "^Jo", "$options": "i" }
            }
        });
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.endsWith()', () => {
        let a = new QueryExpression().where('givenName').endsWith('hn');
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$match": {
                "givenName": { "$regex": "hn$", "$options": "i" }
            }
        });
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.getDate()', () => {
        let a = new QueryExpression().where('dateCreated').getDate().equal(10);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "dayOfMonth1": {
                    "$dayOfMonth" : "$dateCreated"
                }
            },
            "$match": {
                "dayOfMonth1": { "$eq": 10 }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('dateCreated').getDate().between(10, 19);
        match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "dayOfMonth1": {
                    "$dayOfMonth" : "$dateCreated"
                }
            },
            "$match": {
                "$and": [
                    { "dayOfMonth1": { "$gte": 10 } },
                    { "dayOfMonth1": { "$lte": 19 } }
                ]
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression()
            .where('dateCreated').getDate().equal(10)
            .or('dateCreated').getDate().equal(11);
        match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "dayOfMonth1": {
                    "$dayOfMonth" : "$dateCreated"
                }
            },
            "$match": {
                "$or": [
                    { "dayOfMonth1": { "$eq": 10 } },
                    { "dayOfMonth1": { "$eq": 11 } }
                ]
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.getDay()', () => {
        let a = new QueryExpression().where('dateCreated').getDay().equal(1);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "dayOfWeek1": {
                    "$dayOfWeek" : "$dateCreated"
                }
            },
            "$match": {
                "dayOfWeek1": { "$eq": 1 }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.getMonth()', () => {
        let a = new QueryExpression().where('dateCreated').getMonth().equal(1);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "month1": {
                    "$month" : "$dateCreated"
                }
            },
            "$match": {
                "month1": { "$eq": 1 }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.getYear()', () => {
        let a = new QueryExpression().where('dateCreated').getYear().equal(2019);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "year1": {
                    "$year" : "$dateCreated"
                }
            },
            "$match": {
                "year1": { "$eq": 2019 }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('dateCreated').getYear().as('yearCreated').equal(2019);
        expect(a.$match).toBeTruthy();
        match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "yearCreated": {
                    "$year" : "$dateCreated"
                }
            },
            "$match": {
                "yearCreated": { "$eq": 2019 }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where({
                "yearCreated": {
                    "$year" : "$dateCreated"
                }
            }).equal(2019);
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.getHours()', () => {
        let a = new QueryExpression().where('dateCreated').getHours().equal(10);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "hour1": {
                    "$hour" : "$dateCreated"
                }
            },
            "$match": {
                "hour1": { "$eq": 10 }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.getMinutes()', () => {
        let a = new QueryExpression().where('dateCreated').getMinutes().as('minuteCreated').between(1, 30);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "minuteCreated": {
                    "$minute" : "$dateCreated"
                }
            },
            "$match": {
                "$and" : [
                    {
                        "minuteCreated": {
                            "$gte": 1
                        }
                    },
                    {
                        "minuteCreated": {
                            "$lte": 30
                        }
                    }
                ]
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.getSeconds()', () => {
        let a = new QueryExpression().where('dateCreated').getSeconds().between(1, 30);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "second1": {
                    "$second" : "$dateCreated"
                }
            },
            "$match": {
                "$and" : [
                    {
                        "second1": {
                            "$gte": 1
                        }
                    },
                    {
                        "second1": {
                            "$lte": 30
                        }
                    }
                ]
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.substr()', () => {
        let a = new QueryExpression().where('givenName').substr(0,2).equal('Jo');
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "substr1": {
                    "$substr" : [ "$givenName", 0, 2 ]
                }
            },
            "$match": {
                "substr1": {
                    "$eq": 'Jo'
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.indexOf()', () => {
        let a = new QueryExpression().where('givenName').indexOf('Jo').equal(0);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "indexOfBytes1": {
                    "$indexOfBytes" : [ "$givenName", 'Jo' ]
                }
            },
            "$match": {
                "indexOfBytes1": {
                    "$eq": 0
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.length()', () => {
        let a = new QueryExpression().where('givenName').length().lowerOrEqual(8);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "length1": {
                    "$length" : "$givenName"
                }
            },
            "$match": {
                "length1": {
                    "$lte": 8
                }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('givenName').length().as('givenNameLength').lowerOrEqual(8);
        match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "givenNameLength": {
                    "$length" : "$givenName"
                }
            },
            "$match": {
                "givenNameLength": {
                    "$lte": 8
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.trim()', () => {
        let a = new QueryExpression().where('givenName').trim().equal('John');
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "trim1": {
                    "$trim" : "$givenName"
                }
            },
            "$match": {
                "trim1": {
                    "$eq": 'John'
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.floor()', () => {
        let a = new QueryExpression().where('price').floor().equal(120);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "floor1": {
                    "$floor" : "$price"
                }
            },
            "$match": {
                "floor1": {
                    "$eq": 120
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.ceil()', () => {
        let a = new QueryExpression().where('price').ceil().equal(120);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "ceil1": {
                    "$ceil" : "$price"
                }
            },
            "$match": {
                "ceil1": {
                    "$eq": 120
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.round()', () => {
        let a = new QueryExpression().where('price').round(4).lowerOrEqual(145);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "round1": {
                    "$round" : [ "$price", 4 ]
                }
            },
            "$match": {
                "round1": {
                    "$lte": 145
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.add()', () => {
        let a = new QueryExpression().where('price').add(50).lowerOrEqual(145);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "add1": {
                    "$add" : [ "$price", 50 ]
                }
            },
            "$match": {
                "add1": {
                    "$lte": 145
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.multiply()', () => {
        let a = new QueryExpression().where('price').multiply(1.2).lowerOrEqual(150);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "multiply1": {
                    "$multiply" : [ "$price", 1.2 ]
                }
            },
            "$match": {
                "multiply1": {
                    "$lte": 150
                }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('price').multiply(1.2).add(50).lowerOrEqual(150);
        expect(a.$match).toBeTruthy();
        match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "add1": {
                    "$add": [
                        { 
                            "$multiply" : [ "$price", 1.2 ] 
                        },
                        50
                    ]
                }
            },
            "$match": {
                "add1": {
                    "$lte": 150
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.subtract()', () => {
        let a = new QueryExpression().where('price').subtract(50).as('discount').lowerOrEqual(100);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "discount": {
                    "$subtract" : [ "$price", 50 ]
                }
            },
            "$match": {
                "discount": {
                    "$lte": 100
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.divide()', () => {
        let a = new QueryExpression().where('price').divide(2).as('halfPrice').lowerOrEqual(100);
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "halfPrice": {
                    "$divide" : [ "$price", 2 ]
                }
            },
            "$match": {
                "halfPrice": {
                    "$lte": 100
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.concat()', () => {
        let a = new QueryExpression().where('givenName')
            .concat(' ', '$familyName')
            .startsWith('James');
        expect(a.$match).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "concat1": {
                    "$concat" : [ "$givenName", ' ', '$familyName' ]
                }
            },
            "$match": {
                "concat1": {
                    $regex: '^James', $options: 'i'
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.select()', () => {
        let a = new QueryExpression().select( 'id', 'firstName');
        expect(a).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$select": {
                "id": 1,
                "firstName": 1
            }
        });
        expect(a).toEqual(match);

        a = new QueryExpression().select();
        match = Object.assign(new QueryExpression(), 
        {
            "$select": { }
        });
        expect(a).toEqual(match);

        a = new QueryExpression().select( new QueryField('id'), new QueryField('firstName'), { lastName: 1 });
        expect(a).toBeTruthy();
        match = Object.assign(new QueryExpression(), 
        {
            "$select": {
                "id": 1,
                "firstName": 1,
                "lastName": 1
            }
        });
        expect(a).toEqual(match);

        a = new QueryExpression().select(new QueryField('id'), new QueryField('firstName').concat(' ', new QueryField('lastName')).as('name'));
        expect(a).toBeTruthy();
        match = Object.assign(new QueryExpression(), 
        {
            "$select": {
                "id": 1,
                "name": {
                    "$concat": [ "$firstName", " ", "$lastName" ]
                }
            }
        });
        expect(a).toEqual(match);

    });

    it('should use QueryExpression.orderBy()', () => {
        let a = new QueryExpression().select( 'id', 'givenName', 'familyName').orderBy('familyName');
        expect(a).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$select": {
                "id": 1,
                "givenName": 1,
                "familyName": 1
            },
            "$order": {
                "familyName" : -1
            }
        });
        expect(a).toEqual(match);

        a = new QueryExpression().select( 'id', 'givenName', 'familyName').orderBy('familyName', 'givenName');
        expect(a).toBeTruthy();
        match = Object.assign(new QueryExpression(), 
        {
            "$select": {
                "id": 1,
                "givenName": 1,
                "familyName": 1
            },
            "$order": {
                "familyName" : -1,
                "givenName": -1
            }
        });
        expect(a).toEqual(match);

        a = new QueryExpression().select( 'id', 'givenName', 'familyName').orderBy(
            {
                "$concat": ["$givenName", " ", "$familyName" ]
            }
        );
        expect(a).toBeTruthy();
        match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "concat1": {
                    "$concat": ["$givenName", " ", "$familyName" ]
                }
            },
            "$select": {
                "id": 1,
                "givenName": 1,
                "familyName": 1
            },
            "$order": {
                "concat1" : -1
            }
        });
        expect(a).toEqual(match);

    });

    it('should use QueryExpression.thenBy()', () => {
        let a = new QueryExpression().select( 'id', 'givenName', 'familyName')
                    .orderBy('familyName').thenBy('givenName');
        expect(a).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$select": {
                "id": 1,
                "givenName": 1,
                "familyName": 1
            },
            "$order": {
                "familyName" : -1,
                "givenName" : -1
            }
        });
        expect(a).toEqual(match);

    });

    it('should use QueryExpression.orderByDescending()', () => {
        let a = new QueryExpression().select( 'id', 'givenName', 'familyName')
                    .orderByDescending('familyName');
        expect(a).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$select": {
                "id": 1,
                "givenName": 1,
                "familyName": 1
            },
            "$order": {
                "familyName" : 1
            }
        });
        expect(a).toEqual(match);

    });

    it('should use QueryExpression.thenByDescending()', () => {
        let a = new QueryExpression().select( 'id', 'givenName', 'familyName')
                    .orderByDescending('familyName').thenByDescending('givenName');
        expect(a).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$select": {
                "id": 1,
                "givenName": 1,
                "familyName": 1
            },
            "$order": {
                "familyName" : 1,
                "givenName": 1
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.insert()', () => {
        let a = new QueryExpression().insert({
            familyName: 'Jones',
            givenName: 'Tom'
        }).into('Person');
        expect(a).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$collection": {
                "Person": 1
            },
            "$insert": {
                "familyName" : "Jones",
                "givenName": "Tom"
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.insertMany()', () => {
        let a = new QueryExpression().insert([
            {
                familyName: 'Jones',
                givenName: 'Tom'
            }, 
            {
                familyName: 'Williamson',
                givenName: 'Margaret'
            }]).into('Person');
        expect(a).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$collection": {
                "Person": 1
            },
            "$insert": [{
                "familyName" : "Jones",
                "givenName": "Tom"
            }, {
                "familyName" : "Williamson",
                "givenName": "Margaret"
            }]
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.from() and QueryExpression.as()', () => {
        let a = new QueryExpression().select( 'id', 'givenName', 'familyName').from('Person')
                    .as('People')
                    .orderByDescending('familyName');
        expect(a).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$collection": {
                "People": "$Person"
            },
            "$select": {
                "id": 1,
                "givenName": 1,
                "familyName": 1
            },
            "$order": {
                "familyName" : 1
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.update()', () => {
        
        expect(()=> {
            let q = new QueryExpression()
                    .set({
                        "price": 60.5
                    }).update('Product').where('id').equal(100);
        }).toThrowError('Target collection must be defined. Use update() method first.');

        expect(()=> {
            let q = new QueryExpression()
                    .update('Product').set([{
                        "price": 60.5
                    }]).where('id').equal(100);
        }).toThrowError('Item for update cannot be an array.');

        expect(()=> {
            let q = new QueryExpression()
                    .update('Product').set(null).where('id').equal(100);
        }).toThrowError('Item for update may not be null or undefined');

        let a = new QueryExpression().update('Product')
                    .set({
                        "price": 60.5
                    }).where('id').equal(100);
        expect(a).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$collection": {
                "Product": 1
            },
            "$update": {
                "price": 60.5
            },
            "$match": {
                "id" : { $eq: 100 }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.join()', () => {
        let a = new QueryExpression().select( 'id', 'name', 'model', 'productCategory').from('Product')
                    .join('ProductCategory').with('productCategory', 'id');
        expect(a).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$collection": {
                "Product": 1
            },
            "$select": {
                "id": 1,
                "name": 1,
                "model": 1,
                "productCategory": 1
            },
            "$expand": [{
                "$lookup": {
                    "from": "ProductCategory",
                    "localField": "productCategory",
                    "foreignField": "id"
                }
            }]
        });
        expect(a).toEqual(match);
    });


});