import { HttpApplication } from './HttpApplication';
import { HttpConfiguration } from './HttpConfiguration';
import { ApplicationService } from '@themost/common';
class TestService extends ApplicationService {
    constructor(app) {
        super(app);
    }

    getMessage() {
        return 'Hello from test service';
    }

}

class TestServiceStrategy extends TestService {
    constructor(app) {
        super(app);
    }

    getMessage() {
        return 'Hello from alternate test service';
    }

}

describe('HttpApplication', () => {

    it('should use HttpApplication', () => {
        const app = new HttpApplication();
        expect(app).toBeTruthy();
    });

    it('should use HttpApplication.useService()', () => {
        const app = new HttpApplication();
        app.useService(TestService);
        expect(app.hasService(TestService)).toBeTruthy();
    });

    it('should use HttpApplication.hasService()', () => {
        const app = new HttpApplication();
        app.useService(TestService);
        expect(app.hasService(TestService)).toBeTruthy();
        expect(app.hasService(function MissingService() {

        })).toBeFalsy();
    });

    it('should use HttpApplication.getService()', () => {
        const app = new HttpApplication();
        app.useService(TestService);
        const service = app.getService(TestService);
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(TestService);
    });

    it('should use HttpApplication.useStrategy()', () => {
        const app = new HttpApplication();
        app.useStrategy(TestService, TestServiceStrategy);
        expect(app.hasService(TestService)).toBeTruthy();
    });

    it('should use HttpApplication.hasStrategy()', () => {
        const app = new HttpApplication();
        app.useStrategy(TestService, TestServiceStrategy);
        expect(app.hasStrategy(TestServiceStrategy)).toBeTruthy();
        expect(app.hasStrategy(function MissingTestStrategy() {
        })).toBeFalsy();
    });

    it('should use HttpApplication.getConfiguration()', () => {
        const app = new HttpApplication();
        expect(app.getConfiguration()).toBeTruthy();
    });

    it('should use HttpApplication.configuration', () => {
        const app = new HttpApplication();
        expect(app.configuration).toBeTruthy();
        expect(app.configuration).toBeInstanceOf(HttpConfiguration);
    });

});