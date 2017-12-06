const Koa = require('koa');
const helmet = require('koa-helmet');
const accesslog = require('koa-accesslog');
const bodyParser = require('koa-bodyparser');
const compress = require('koa-compress');

const health = require('./health');
const serverConfig = require('./config').get('server');
const apis = require('./api');

const app = new Koa();

app.use(helmet());
app.use(accesslog());
app.use(compress());
app.use(bodyParser());

app.use(apis.routes(), apis.allowedMethods());

// Possibility to customize path and checks
//  app.use(health('/ping', [async () => { Check connectivity} ]));
app.use(health());

app.listen(serverConfig.port);
console.log('listening on port', serverConfig.port);
