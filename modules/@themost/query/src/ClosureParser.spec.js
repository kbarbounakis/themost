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


});
