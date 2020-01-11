import {HttpError, HttpBadRequestError, HttpNotFoundError, HttpForbiddenError, HttpUnauthorizedError, DataError, NotNullError} from './errors';
describe('Errors', () => {
   it('should create http error', () => {
       const err = new HttpError(500);
       expect(err).toBeTruthy();
       expect(err instanceof HttpError).toBeTruthy();
       expect(err.code).toBe('EHTTP');
       expect(err.statusCode).toBe(500);
       expect(err.title).toBe('Internal Server Error');
       expect(err.message).toBe('The server encountered an internal error and was unable to complete your request.');
   });
   it('should create 400 http error', () => {
       const err = new HttpError(400);
       expect(err).toBeTruthy();
       expect(err instanceof HttpError).toBeTruthy();
       expect(err.code).toBe('EHTTP');
       expect(err.statusCode).toBe(400);
       expect(err.title).toBe('Bad Request');
       expect(err.message).toBe('The request cannot be fulfilled due to bad syntax.');
   });
   it('should create bad request error', () => {
       const err = new HttpBadRequestError();
       expect(err).toBeTruthy();
       expect(err instanceof HttpBadRequestError).toBeTruthy();
       expect(err.code).toBe('EHTTP');
       expect(err.statusCode).toBe(400);
   });
   it('should create not found error', () => {
       const err = new HttpNotFoundError();
       expect(err).toBeTruthy();
       expect(err instanceof HttpNotFoundError).toBeTruthy();
       expect(err.code).toBe('EHTTP');
       expect(err.statusCode).toBe(404);
   });
   it('should create forbidden error', () => {
       const err = new HttpForbiddenError();
       expect(err).toBeTruthy();
       expect(err instanceof HttpForbiddenError).toBeTruthy();
       expect(err.code).toBe('EHTTP');
       expect(err.statusCode).toBe(403);
   });
   it('should create unauthorized error', () => {
       const err = new HttpUnauthorizedError();
       expect(err).toBeTruthy();
       expect(err instanceof HttpUnauthorizedError).toBeTruthy();
       expect(err.code).toBe('EHTTP');
       expect(err.statusCode).toBe(401);
       expect(err.title).toBe('Unauthorized');
   });
   it('should create data error', () => {
       const err = new DataError('E_FAIL', 'A internal data error occurred.', 'Model is missing', 'TestModel');
       expect(err).toBeTruthy();
       expect(err instanceof DataError).toBeTruthy();
       expect(err.code).toBe('E_FAIL');
       expect(err.message).toBe('A internal data error occurred.');
       expect(err.innerMessage).toBe('Model is missing');
       expect(err.model).toBe('TestModel');
   });
   it('should create not null error', () => {
       const err = new NotNullError();
       expect(err).toBeTruthy();
       expect(err instanceof DataError).toBeTruthy();
       expect(err.code).toBe('ENULL');
       expect(err.message).toBe('A value is required.');
       expect(err.model).toBeFalsy();
       expect(err.statusCode).toBe(409);
   });
});