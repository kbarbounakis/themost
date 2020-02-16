import {getApplication} from '@themost/test';
import {ODataModelBuilder} from '@themost/data';
import {ExpressDataApplication} from '@themost/express';
describe('ODataModelBuilder', ()=> {
    let app;
    beforeAll(() => {
        app = getApplication();
    });
    it('should get metadata', async ()=> {
        /**
         * @type {ExpressDataApplication}
         */
        const application = app.get(ExpressDataApplication.name);
        expect(application).toBeTruthy();
        // noinspection JSValidateTypes
        /**
         * @type {ODataModelBuilder}
         */
        let builder = application.getStrategy(ODataModelBuilder);
        expect(builder).toBeTruthy();
        const document = builder.getEdmDocumentSync();
        expect(document).toBeTruthy();
    });
});
