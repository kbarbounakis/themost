import {ClosureParser} from './ClosureParser';
import util from 'util';
describe('ClosureParser', () => {
   it('should create instance', () => {
      const parser = new ClosureParser();
      expect(parser).toBeTruthy();
   });
    it('should ClosureParser.parse()', async () => {
        const parser = new ClosureParser();
        const parseFilter = util.promisify(parser.parseFilter).bind(parser);
        const expr = await parseFilter(x => x.dateCreated);
        expect(expr).toBeTruthy();
    });
});
