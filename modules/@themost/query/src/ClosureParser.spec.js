import {ClosureParser} from './ClosureParser';
import util from 'util';
import {MemberExpression} from './expressions';

describe('ClosureParser', () => {
   it('should create instance', () => {
      const parser = new ClosureParser();
      expect(parser).toBeTruthy();
   });
    it('should use ClosureParser.parseSelect()', async () => {
        const parser = new ClosureParser();
        let expr = await parser.parseSelectAsync(x => x.dateCreated);
        expect(expr).toBeTruthy();
        expect(expr instanceof MemberExpression).toBeTruthy();
        expect(expr.name).toBe('dateCreated');
    });
    it('should use ClosureParser.parseSelect()', async () => {
        const parser = new ClosureParser();
        let expr = await parser.parseSelectAsync(x => {
            x.id,
            x.dateCreated
        });
        expect(Array.isArray(expr)).toBeTruthy();
        expect(expr[0]).toBeInstanceOf(MemberExpression);
        expect(expr[1]).toBeInstanceOf(MemberExpression);
    });
    it('should use ClosureParser.parseSelect()', async () => {
        const parser = new ClosureParser();
        let expr = await parser.parseSelectAsync( x => {
            return {
                id: x.id,
                createdAt: x.dateCreated
            }
        });
        expect(expr).toBeInstanceOf(Array);
        expect(expr[0]).toBeInstanceOf(MemberExpression);
        expect(expr[1]).toBeInstanceOf(MemberExpression);
    });
    
});
