import {QueryExpression} from './QueryExpression';
import {QueryField} from './QueryField';

describe('QueryExpression', () => {
    it('should use QueryExpression.where()', () => {
        const a = new QueryExpression().where('id').equal(100);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$where": {
                "id": { "$eq": 100 }
            }
        });
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.or()', () => {
        const a = new QueryExpression().where('status').equal('completed').or('status').equal('cancelled');
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$where": {
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
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$where": {
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
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$where": {
                "status": { "$eq": "completed" }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('status').eq('completed');
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.notEqual()', () => {
        let a = new QueryExpression().where('status').notEqual('completed');
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$where": {
                "status": { "$ne": "completed" }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('status').ne('completed');
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.greaterThan()', () => {
        let a = new QueryExpression().where('price').greaterThan(600);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$where": {
                "price": { "$gt": 600 }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('price').gt(600);
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.greaterOrEqual()', () => {
        let a = new QueryExpression().where('price').greaterOrEqual(600);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$where": {
                "price": { "$gte": 600 }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('price').gte(600);
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.lowerThan()', () => {
        let a = new QueryExpression().where('price').lowerThan(600);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$where": {
                "price": { "$lt": 600 }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('price').lt(600);
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.lowerOrEqual()', () => {
        let a = new QueryExpression().where('price').lowerOrEqual(600);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$where": {
                "price": { "$lte": 600 }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('price').lte(600);
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.between()', () => {
        let a = new QueryExpression().where('price').between(600, 800);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$where": {
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
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$where": {
                "givenName": { $text: { $search: 'oh' } }
            }
        });
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.notContains()', () => {
        let a = new QueryExpression().where('givenName').notContains('oh');
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$where": {
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
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$where": {
                "givenName": { "$regex": "^Jo", "$options": "i" }
            }
        });
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.endsWith()', () => {
        let a = new QueryExpression().where('givenName').endsWith('hn');
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$where": {
                "givenName": { "$regex": "hn$", "$options": "i" }
            }
        });
        expect(a).toEqual(match);
    });
    it('should use QueryExpression.getDate()', () => {
        let a = new QueryExpression().where('dateCreated').getDate().equal(10);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "dayOfMonth1": {
                    "$dayOfMonth" : "$dateCreated"
                }
            },
            "$where": {
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
            "$where": {
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
            "$where": {
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
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "dayOfWeek1": {
                    "$dayOfWeek" : "$dateCreated"
                }
            },
            "$where": {
                "dayOfWeek1": { "$eq": 1 }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.getMonth()', () => {
        let a = new QueryExpression().where('dateCreated').getMonth().equal(1);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "month1": {
                    "$month" : "$dateCreated"
                }
            },
            "$where": {
                "month1": { "$eq": 1 }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.getYear()', () => {
        let a = new QueryExpression().where('dateCreated').getYear().equal(2019);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "year1": {
                    "$year" : "$dateCreated"
                }
            },
            "$where": {
                "year1": { "$eq": 2019 }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('dateCreated').getYear().as('yearCreated').equal(2019);
        expect(a.$where).toBeTruthy();
        match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "yearCreated": {
                    "$year" : "$dateCreated"
                }
            },
            "$where": {
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
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "hour1": {
                    "$hour" : "$dateCreated"
                }
            },
            "$where": {
                "hour1": { "$eq": 10 }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.getMinutes()', () => {
        let a = new QueryExpression().where('dateCreated').getMinutes().as('minuteCreated').between(1, 30);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "minuteCreated": {
                    "$minute" : "$dateCreated"
                }
            },
            "$where": {
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
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "second1": {
                    "$second" : "$dateCreated"
                }
            },
            "$where": {
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
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "substr1": {
                    "$substr" : [ "$givenName", 0, 2 ]
                }
            },
            "$where": {
                "substr1": {
                    "$eq": 'Jo'
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.indexOf()', () => {
        let a = new QueryExpression().where('givenName').indexOf('Jo').equal(0);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "indexOfBytes1": {
                    "$indexOfBytes" : [ "$givenName", 'Jo' ]
                }
            },
            "$where": {
                "indexOfBytes1": {
                    "$eq": 0
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.length()', () => {
        let a = new QueryExpression().where('givenName').length().lowerOrEqual(8);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "length1": {
                    "$length" : "$givenName"
                }
            },
            "$where": {
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
            "$where": {
                "givenNameLength": {
                    "$lte": 8
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.trim()', () => {
        let a = new QueryExpression().where('givenName').trim().equal('John');
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "trim1": {
                    "$trim" : "$givenName"
                }
            },
            "$where": {
                "trim1": {
                    "$eq": 'John'
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.floor()', () => {
        let a = new QueryExpression().where('price').floor().equal(120);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "floor1": {
                    "$floor" : "$price"
                }
            },
            "$where": {
                "floor1": {
                    "$eq": 120
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.ceil()', () => {
        let a = new QueryExpression().where('price').ceil().equal(120);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "ceil1": {
                    "$ceil" : "$price"
                }
            },
            "$where": {
                "ceil1": {
                    "$eq": 120
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.round()', () => {
        let a = new QueryExpression().where('price').round(4).lowerOrEqual(145);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "round1": {
                    "$round" : [ "$price", 4 ]
                }
            },
            "$where": {
                "round1": {
                    "$lte": 145
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.add()', () => {
        let a = new QueryExpression().where('price').add(50).lowerOrEqual(145);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "add1": {
                    "$add" : [ "$price", 50 ]
                }
            },
            "$where": {
                "add1": {
                    "$lte": 145
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.multiply()', () => {
        let a = new QueryExpression().where('price').multiply(1.2).lowerOrEqual(150);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "multiply1": {
                    "$multiply" : [ "$price", 1.2 ]
                }
            },
            "$where": {
                "multiply1": {
                    "$lte": 150
                }
            }
        });
        expect(a).toEqual(match);
        a = new QueryExpression().where('price').multiply(1.2).add(50).lowerOrEqual(150);
        expect(a.$where).toBeTruthy();
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
            "$where": {
                "add1": {
                    "$lte": 150
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.subtract()', () => {
        let a = new QueryExpression().where('price').subtract(50).as('discount').lowerOrEqual(100);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "discount": {
                    "$subtract" : [ "$price", 50 ]
                }
            },
            "$where": {
                "discount": {
                    "$lte": 100
                }
            }
        });
        expect(a).toEqual(match);
    });

    it('should use QueryExpression.divide()', () => {
        let a = new QueryExpression().where('price').divide(2).as('halfPrice').lowerOrEqual(100);
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "halfPrice": {
                    "$divide" : [ "$price", 2 ]
                }
            },
            "$where": {
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
        expect(a.$where).toBeTruthy();
        let match = Object.assign(new QueryExpression(), 
        {
            "$addFields": {
                "concat1": {
                    "$concat" : [ "$givenName", ' ', '$familyName' ]
                }
            },
            "$where": {
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
            "$collection": "Person",
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
            "$collection": "Person",
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


});