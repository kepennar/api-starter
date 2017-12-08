const Router = require('koa-router');

const health = require('./health');
const stockRouter = require('./stocks');

const apiRouter = new Router();

apiRouter.get('/', ctx => (ctx.body = 'Welcome to Node-API-Starter'));
apiRouter.use('/stocks', stockRouter.routes(), stockRouter.allowedMethods());

// Possibility to customize checks
//  app.use(health([async () => { Check connectivity} ]));
apiRouter.get('/health', health());

apiRouter.get(
  '/routes',
  ctx =>
    (ctx.body = apiRouter.stack
      .filter(r => r.methods && r.methods.length > 0)
      .map(r => ({
        path: r.path,
        method: r.methods
      })))
);
module.exports = apiRouter;
