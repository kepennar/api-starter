const Router = require('koa-router');
const fetch = require('node-fetch');

const stockRouter = new Router();

const DEFAULT_SYMBOL = 'GOOG';

stockRouter.get('/', async ctx => {
  const symbol = ctx.query.symbol || DEFAULT_SYMBOL;
  try {
    const response = await fetch(
      `https://api.iextrading.com/1.0/stock/${symbol}/quote`
    );
    ctx.body = await response.json();
  } catch (err) {
    ctx.throw(err);
  }
});

module.exports = stockRouter;
