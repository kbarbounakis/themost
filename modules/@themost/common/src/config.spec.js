import {ConfigurationBase} from './config';
describe('Config', () => {
    it('should create configuration', () => {
       const a = new ConfigurationBase();
       expect(a).toBeTruthy();
    });
    it('should get configuration source', () => {
       const a = new ConfigurationBase();
       expect(a).toBeTruthy();
       expect(a.getSource()).toBeTruthy();
    });
    it('should set configuration setting', () => {
       const a = new ConfigurationBase();
       expect(a).toBeTruthy();
       a.setSourceAt('settings/app', { title: 'Test Application' });
       expect(a.hasSourceAt('settings/app/title')).toBeTruthy();
       expect(a.getSourceAt('settings/app/title')).toBe('Test Application');
    });
    it('should get configuration path', () => {
       const a = new ConfigurationBase();
       expect(a.getConfigurationPath()).toBeTruthy();
       expect(a.getConfigurationPath()).toBe('/config');
    });
    it('should get execution path', () => {
       const a = new ConfigurationBase();
       expect(a.getExecutionPath()).toBeTruthy();
       expect(a.getExecutionPath()).toBe('/');
    });
});