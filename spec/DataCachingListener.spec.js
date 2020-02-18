
import {getApplication} from '@themost/test';
import {ExpressDataApplication, ExpressDataContext} from '@themost/express';
import { DataConfigurationStrategy, DataCachingListener } from '@themost/data';
import {promisify} from 'util';

describe('DataCachingListener', ()=> {
    /**
     * @type {ExpressDataContext}
     */
    let context;
    beforeAll(()=> {
        // get express app
        const app = getApplication();
        // get data application
        const dataApplication = app.get(ExpressDataApplication.name);
        // create context
        context = dataApplication.createContext();
    });
    it('should generate hashCode', async ()=> {
        // set cache
        const configuration = context.getApplication().getConfiguration().getStrategy(DataConfigurationStrategy);
        const modelDefinition = configuration.getModelDefinition('User');
        // set cache attribute to always
        modelDefinition.caching = 'always';
        configuration.setModelDefinition(modelDefinition);
        let model = context.model('User');
        let queryUsers = model.where('name').equal('alexis.rees@example.com').select();
        const listener = new DataCachingListener();
        const beforeExecuteAsync = promisify(listener.beforeExecute);
        await beforeExecuteAsync({
            context: context,
            model: model,
            emitter: queryUsers,
            query: queryUsers.query
        });
        expect(queryUsers.hashCode).toBeTruthy();
        // set cache attribute to conditional
        model.caching = 'conditional';
        // enable cache
        queryUsers = model.where('name').equal('alexis.rees@example.com').select().cache(true);
        await beforeExecuteAsync({
            context: context,
            model: model,
            emitter: queryUsers,
            query: queryUsers.query
        });
        expect(queryUsers.hashCode).toBeTruthy();
        // do not use cache
        queryUsers = model.where('name').equal('alexis.rees@example.com').select();
        await beforeExecuteAsync({
            context: context,
            model: model,
            emitter: queryUsers,
            query: queryUsers.query
        });
        expect(queryUsers.hashCode).toBeFalsy();

    });

    it('should omit hashCode', async ()=> {
        const configuration = context.getApplication().getConfiguration().getStrategy(DataConfigurationStrategy);
        const modelDefinition = configuration.getModelDefinition('User');
        // set cache attribute to none
        modelDefinition.caching = 'none';
        configuration.setModelDefinition(modelDefinition);
        const model = context.model('User');
        const queryUsers = model.where('name').equal('alexis.rees@example.com').select();
        const listener = new DataCachingListener();
        const beforeExecuteAsync = promisify(listener.beforeExecute);
        await beforeExecuteAsync({
            context: context,
            model: model,
            emitter: queryUsers,
            query: queryUsers.query
        });
        expect(queryUsers.hashCode).toBeFalsy();
    });

    it('should use cache data', async ()=> {
        // update model definition
        const configuration = context.getApplication().getConfiguration().getStrategy(DataConfigurationStrategy);
        const modelDefinition = configuration.getModelDefinition('User');
        modelDefinition.caching = 'always';
        configuration.setModelDefinition(modelDefinition);
        // get model and data
        const model = context.model('User');
        let query = model.where('name').equal('alexis.rees@example.com').silent();
        let item = await query.getItem();
        expect(item).toBeTruthy();
        // get query again
        item = await query.getItem();
        expect(item).toBeTruthy();
    });

});