import {Guid} from '@themost/common';
describe('Utils', () => {
   it('should create guid', () => {
       const a = new Guid();
       expect(a).toBeTruthy();
   });
   it('should validate guid', () => {
       expect(Guid.isGuid('cd1d7a96-d722-46ea-825f-e594367102f4')).toBeTruthy();
       expect(Guid.isGuid('w1w17a96-d722-46ea-825f-e594367102f4')).toBeFalsy();
   });
    it('should compare guid', () => {
        const a = new Guid('CD1d7a96-d722-46ea-825f-e594367102f4');
        const b = new Guid('cd1d7a96-d722-46ea-825f-e594367102f4');
        expect(a.equals(b)).toBeTruthy();
    })
});
