import { health } from "../../src/api/health";
import httpMocks from "node-mocks-http";
import { createApp } from "../../src/app";
import Koa from "koa";

describe("Health checker", () => {
  let app: Koa;
  let context: Koa.ParameterizedContext;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    context = app.createContext(req, res);
  });

  it("should return a valid status code if all checkers are ok", async () => {
    await health()(context, jest.fn());

    expect(context.status).toBe(200);
  });

  it("should return an error status code if a checkers is in error", async () => {
    const inErrorChecker = () => {
      return Promise.resolve({ name: "test", status: false });
    };

    await health([inErrorChecker])(context, jest.fn());

    expect(context.status).toBe(503);
  });
});
