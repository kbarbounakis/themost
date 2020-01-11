import {ClosureParser} from './ClosureParser';
import {MemberExpression, SequenceExpression} from './expressions';
// eslint-disable-next-line no-unused-vars
import {round, ceil, floor, mod, multiply, subtract, divide, add, bitAnd} from 'mathjs';
describe('ClosureParser', () => {
   it('should create instance', () => {
      const parser = new ClosureParser();
      expect(parser).toBeTruthy();
   });
    it('should use ClosureParser.parseSelect()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => x.dateCreated);
        expect(expr).toBeTruthy();
        expect(expr instanceof MemberExpression).toBeTruthy();
        expect(expr.name).toBe('dateCreated');
    });
    it('should use ClosureParser.parseSelect()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            x.id,
            x.dateCreated
        });
        expect(expr).toBeTruthy();
        expect(expr).toBeInstanceOf(SequenceExpression);
        expect(expr.value[0]).toBeInstanceOf(MemberExpression);
        expect(expr.value[1]).toBeInstanceOf(MemberExpression);
    });
    it('should use ClosureParser.parseSelect()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect( x => {
            return {
                id: x.id,
                createdAt: x.dateCreated
            }
        });
        expect(expr).toBeTruthy();
        expect(expr.id).toBeInstanceOf(MemberExpression);
        expect(expr.createdAt).toBeInstanceOf(MemberExpression);
        const select = expr.exprOf();
        expect(select).toBeTruthy();
        expect(select.id).toBe('$id');
        expect(select.createdAt).toBe('$dateCreated');

        expr = parser.parseSelect(function(x) {
            return {
                id: x.id,
                createdAt: x.dateCreated
            }
        });
        expect(expr).toBeTruthy();
    });

    it('should use ClosureParser.parseSelect() with SequenceExpression', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            x.id,
            x.dateCreated.getMonth()
        });
        expect(expr).toBeTruthy();
        const select = expr.exprOf();
        expect(select).toBeTruthy();
    });

    it('should use Math.floor()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
                x.id,
                Math.floor(x.price)
        });
        expect(expr).toBeTruthy();
        let select = expr.exprOf();
        expect(select).toBeTruthy();
        expect(select).toEqual({
            id: 1,
            floor1: {
                $floor: "$price"
            }
        });
        expr = parser.parseSelect(x => {
                return {
                    "price": Math.floor(x.price)
                }
        });
        select = expr.exprOf();
        expect(select).toEqual({
            price: {
                $floor: "$price"
            }
        });
    });

    it('should use Math.ceil()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
                x.id,
                Math.ceil(x.price)
        });
        expect(expr).toBeTruthy();
        let select = expr.exprOf();
        expect(select).toBeTruthy();
        expect(select).toEqual({
            id: 1,
            ceil1: {
                $ceil: "$price"
            }
        });
        expr = parser.parseSelect(x => {
            return {
                "price": Math.ceil(x.price)
            }
        });
        select = expr.exprOf();
        expect(select).toEqual({
            price: {
                $ceil: "$price"
            }
        });
        expr = parser.parseSelect(x => {
            return {
                "price": ceil(x.price)
            }
        });
        select = expr.exprOf();
        expect(select).toEqual({
            price: {
                $ceil: "$price"
            }
        });
    });

    it('should use Math.round()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            x.id,
            Math.round(x.price)
        });
        expect(expr).toBeTruthy();
        let select = expr.exprOf();
        expect(select).toEqual({
            id: 1,
            round1: {
                $round: "$price"
            }
        });
        expr = parser.parseSelect(x => {
            return {
                "price": Math.round(x.price)
            }
        });
        select = expr.exprOf();
        expect(select).toEqual({
            price: {
                $round: "$price"
            }
        });
    });


    it('should use mathjs.round()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "price": round(x.price, 4)
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            price: {
                $round: [ "$price", 4 ]
            }
        });
    });

    it('should use mathjs.floor()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "price": floor(x.price * 0.8)
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual(
        {
            "price": {
                "$floor": { 
                    "$multiply": [ 
                        "$price",
                        0.8 
                    ] 
                }
            }
        });
    });

    it('should use mathjs.add()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "price": add(x.price, 4)
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            price: {
                $add: [ "$price", 4 ]
            }
        });
    });

    it('should use add javascript add operator', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "price": x.price + 4
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            price: {
                $add: [ "$price", 4 ]
            }
        });
    });

    it('should use mathjs.subtract()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "price": subtract(x.price, 4)
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            price: {
                $subtract: [ "$price", 4 ]
            }
        });
    });

    it('should use add javascript subtract operator', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "price": x.price - 4
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            price: {
                $subtract: [ "$price", 4 ]
            }
        });
    });

    it('should use mathjs.multiply()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "price": multiply(x.price, 0.9)
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            price: {
                $multiply: [ "$price", 0.9 ]
            }
        });
    });

    it('should use add javascript multiply operator', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "price": x.price * 0.8
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            price: {
                $multiply: [ "$price", 0.8 ]
            }
        });
    });

    it('should use mathjs.divide()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "price": divide(x.price, 2)
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            price: {
                $divide: [ "$price", 2 ]
            }
        });
    });

    it('should use add javascript divide operator', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "price": x.price / 2
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            price: {
                $divide: [ "$price", 2 ]
            }
        });
    });

    it('should use add javascript divide and add operator', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "price": (x.price / 2) + 10
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            price: {
                $add: [ 
                    { $divide: [ "$price", 2 ] }, 
                    10 
                ]
            }
        });
    });

    it('should use String.prototype.substring()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "name": x.name.substring(0,4)
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            name: {
                $substr: [ "$name", 0, 4 ]
            }
        });
    });

    it('should use String.prototype.toLowerCase()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "status": x.status.toLowerCase()
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            status: {
                $toLower: "$status"
            }
        });
    });

    it('should use String.prototype.toUpperCase()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "status": x.status.toUpperCase()
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            status: {
                $toUpper: "$status"
            }
        });
    });

    it('should use Date.prototype.getFullYear()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "yearCreated": x.dateCreated.getFullYear()
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            yearCreated: {
                $year: "$dateCreated"
            }
        });
    });

    it('should use Date.prototype.getMonth()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "monthCreated": x.dateCreated.getMonth()
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            monthCreated: {
                $month: "$dateCreated"
            }
        });
    });

    it('should use Date.prototype.getDate()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "dayCreated": x.dateCreated.getDate()
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            dayCreated: {
                $dayOfMonth: "$dateCreated"
            }
        });
    });

    it('should use Date.prototype.getHours()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "hourCreated": x.dateCreated.getHours()
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            hourCreated: {
                $hour: "$dateCreated"
            }
        });
    });

    it('should use Date.prototype.getMinutes()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "minuteCreated": x.dateCreated.getMinutes()
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            minuteCreated: {
                $minute: "$dateCreated"
            }
        });
    });

    it('should use Date.prototype.getSeconds()', async () => {
        const parser = new ClosureParser();
        let expr = parser.parseSelect(x => {
            return {
                "secondCreated": x.dateCreated.getSeconds()
            }
        });
        let select = expr.exprOf();
        expect(select).toEqual({
            secondCreated: {
                $second: "$dateCreated"
            }
        });
    });



});
