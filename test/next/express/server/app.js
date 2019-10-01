import express from 'express';
import {HttpApplication} from '@themost/web';

let app = express();
// serve static files
app.use(express.static('public'));

let httpApplication = new HttpApplication();

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>');
  res.end();
});
app.use(httpApplication.runtime());
// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || err.statusCode || 500);
  res.render('error');
});

module.exports = app;
