import {DataModel} from '@themost/data';
import {SqliteFormatter} from '@themost/sqlite';

class TestFormatter extends SqliteFormatter {
   constructor() {
      super();
   }
}

describe('DataModel', () => {
    it('should create instance', async () => {
       const model = new DataModel();
       expect(model).toBeTruthy();
    });
});
