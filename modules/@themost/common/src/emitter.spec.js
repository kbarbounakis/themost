import {SequentialEventEmitter} from './emitter';
describe('Emitter', () => {
    it('should create event emitter', ()=> {
        const a  = new SequentialEventEmitter();
        expect(a).toBeTruthy();
    });
    it('should add event', ()=> {
        const a  = new SequentialEventEmitter();
        a.on('change', (event, callback) => {
            return callback();
        });
        expect(a).toBeTruthy();
        a.emit('change', { message: 'Hello World' }, (err) => {
            expect(err).toBeFalsy();
        });
    });
});