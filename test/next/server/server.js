import {HttpApplication} from '@themost/web/app';
import http from 'http';
import path from 'path';
//initialize app
let app = new HttpApplication(path.resolve(__dirname));
//set static content
app.useStaticContent(path.resolve('./public'));

http.createServer(app.runtime());
let server = http.createServer(app.runtime());
// Listen on provided port, on all network interfaces.
server.listen(3000, '127.0.0.1');
