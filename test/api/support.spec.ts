import { Server } from "http";
import request from "supertest";
import { createAppServer } from "./fixture";

describe("Support endpoint", () => {
  let server: Server;

  beforeAll(async () => {
    server = await createAppServer();
  });

  it("GET /random-url should return 404", async () => {
    return request(server).get("/random-url ").expect(404);
  });

  it("GET /health should return healthy status", async () => {
    const response = await request(server).get("/health ").expect(200);
    expect(response.body.status).toBeTruthy();
  });

  it("GET /routes should return 200 and display a health route", async () => {
    const response = await request(server).get("/routes").expect(200);

    expect(response.body.find((p: any) => p.path === "/health")).toBeTruthy();
  });
});
