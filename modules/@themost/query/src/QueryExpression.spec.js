import {QueryExpression} from './QueryExpression';
import {QueryField} from './QueryField';

describe('QueryExpression', () => {
    it('should use QueryExpression.where()', () => {
        const a = new QueryExpression().where('id').equal(100);
        expect(a.$where).toBeTruthy();
    });
});