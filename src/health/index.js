const path = require('path');
const appRootPath = require('app-root-path');
var { name, version } = require(appRootPath + path.sep + 'package.json');

const defaultChecker = async () => ({ name: 'status', value: 'OK' });

module.exports = function(path = '/health', checks = []) {
  return async (ctx, next) => {
    const checkers = await Promise.all(
      [defaultChecker, ...checks].map(fn => fn())
    );
    console.log('[DEBUG] checkers', checkers);
    ctx.body = {
      name,
      version,
      checkers
    };
    next();
  };
};
