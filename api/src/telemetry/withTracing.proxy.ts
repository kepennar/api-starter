/* eslint-disable */
import { context, trace, setSpan } from "@opentelemetry/api";
import { getTracer } from "./tracing.config";

export function withTracingProxy<A extends Record<string, unknown>>(
  target: A
): A {
  const withTracingHandler = {
    get(target: A, propKey: string) {
      const originalMethod = target[propKey];
      const self = this;
      return async function (...args: unknown[]) {
        if (originalMethod instanceof Function) {
          return withTracing(originalMethod as (...args: any) => any)(
            self,
            ...args
          );
        }
        return originalMethod;
      };
    },
  };
  return new Proxy(target, withTracingHandler);
}

export function withTracing<T extends (...args: any) => any>(func: T) {
  return async function (thisArg: unknown, ...args: Parameters<T>) {
    const tracer = getTracer();
    if (!tracer) {
      return func.apply(thisArg, args);
    }
    const span = tracer.startSpan(func.name);
    context.with(setSpan(context.active(), span), async () => {
      try {
        return await func.apply(thisArg, args);
      } catch (error) {
        span.recordException(error);
        throw error;
      } finally {
        span.end();
      }
    });
  };
}
