import {HttpApplication} from '@themost/web/app';
import path from 'path';
//initialize app
let app = new HttpApplication(__dirname);
//set static content
app.useStaticContent(path.resolve('./public'));

module.exports = app;
