import { ConsoleMetricExporter, MeterProvider } from "@opentelemetry/metrics";
import { BoundCounter } from "@opentelemetry/api-metrics";
import { Context, Next } from "koa";

const exporter = new ConsoleMetricExporter();

export const meterProvider = new MeterProvider({
  exporter,
  interval: 5000,
});
const meter = meterProvider.getMeter("JPF API");

const requestCount = meter.createCounter("requests", {
  description: "Count all incoming requests",
});

const boundInstruments = new Map<string, BoundCounter>();

export async function countAllRequests(context: Context, next: Next) {
  if (!boundInstruments.has(context.request.path)) {
    const labels = { route: context.request.path };
    const boundCounter = requestCount.bind(labels);
    boundInstruments.set(context.request.path, boundCounter);
  }
  boundInstruments.get(context.request.path)?.add(1);
  await next();
}
