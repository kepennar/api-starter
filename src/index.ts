import Koa from "koa";
import helmet from "koa-helmet";
import accesslog from "koa-morgan";
import bodyParser from "koa-bodyparser";
import compress from "koa-compress";
import { config } from "./config";
import { apiRouter } from "./api";

const serverConfig = config.get("server");
const logConfig = config.get("log");

const app = new Koa();

app.use(helmet());
app.use(accesslog(logConfig.format));
app.use(compress());
app.use(bodyParser());

app.use(apiRouter.routes());

app.listen(serverConfig.port);
console.log("listening on port", serverConfig.port);
