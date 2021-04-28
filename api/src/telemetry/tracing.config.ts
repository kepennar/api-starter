import {
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  getSpanContext,
  trace,
  Tracer,
  context,
} from "@opentelemetry/api";
import { ZipkinExporter } from "@opentelemetry/exporter-zipkin";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { NodeTracerProvider } from "@opentelemetry/node";
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  SpanExporter,
} from "@opentelemetry/tracing";
import { config, TracingExporter } from "../config";
import "./monitoring.config";
import { meterProvider } from "./monitoring.config";

const tracingConfig = config.get("tracing");

let TRACER: Tracer | undefined;

function getExporter(
  serviceName: string,
  tracingExporter: TracingExporter
): SpanExporter | undefined {
  switch (tracingExporter) {
    case "console":
      return new ConsoleSpanExporter();
    case "zipkin":
      return new ZipkinExporter({
        serviceName,
      });
    case "none":
      return;
  }
}

function configTracing(serviceName = "API") {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);
  const provider = new NodeTracerProvider();

  const exporter = getExporter(serviceName, tracingConfig.exporter);
  if (exporter) {
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  }
  registerInstrumentations({
    instrumentations: [],
    tracerProvider: provider,
    meterProvider,
  });
  provider.register();

  return trace.getTracer(`${serviceName}-tracer`);
}

if (tracingConfig.exporter !== "none") {
  TRACER = configTracing();
}

export function getTracer() {
  return TRACER;
}
