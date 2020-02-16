import {getApplication, serveApplication, getServerAddress, getToken} from '@themost/test';
import fetch from 'node-fetch';
describe('ServiceRouter', ()=> {
    let server;
    let server_uri;
    beforeAll(done => {
        const app = getApplication();
        serveApplication(app)
          .then(liveServer => {
            server = liveServer;
            server_uri = getServerAddress(server);
            return done();
          })
          .catch(err => {
            return done(err);
          });
      });
      afterAll(done => {
        if (server) {
          server.close(() => {
            return done();
          });
        }
      });
    it('should get 401 /api/users/me', async ()=> {
        const response = await fetch(new URL('/api/users/me', server_uri));
        expect(response.status).toBe(401);
    });
    it('should get /api/users/me', async ()=> {
        const token = await getToken(new URL('/auth', server_uri), 'alexis.rees@example.com', 'secret');
        const response = await fetch(new URL('/api/users/me', server_uri), {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        expect(response.status).toBe(200);
    });
});