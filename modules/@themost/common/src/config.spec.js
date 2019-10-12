import {ConfigurationBase} from './config';
describe('Config', () => {
   it('should create configuration', () => {
       const a = new ConfigurationBase();
       expect(a).toBeTruthy()
    });
});