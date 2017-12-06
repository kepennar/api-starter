const Router = require('koa-router');

const stockRouter = require('./stocks');

const apiRouter = new Router();

apiRouter.get('/', ctx => (ctx.body = 'Welcome to Node-API-Starter'));
apiRouter.use('/stocks', stockRouter.routes(), stockRouter.allowedMethods());

apiRouter.get(
  '/available-routes',
  ctx =>
    (ctx.body = apiRouter.stack.map(r => ({
      path: r.path,
      method: r.methods
    })))
);
module.exports = apiRouter;
