import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_NAME,
} from '@opentelemetry/semantic-conventions';

export class TracerHelper {
  public static start(): NodeSDK | null {
    if (process.env.OTEL_SDK_DISABLED !== 'false') {
      return null;
    }

    if (process.env.OTEL_DIAG_LOG_LEVEL === 'debug') {
      diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
    }

    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME ?? 'unknown-service',
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: process.env.NODE_ENV ?? 'development',
    });
    const traceExporter = new OTLPTraceExporter();
    const autoInstrumentations = getNodeAutoInstrumentations();
    const sdk = new NodeSDK({ resource, traceExporter, instrumentations: [autoInstrumentations] });

    sdk.start();
    process.once('SIGTERM', () => TracerHelper.shutdown(sdk));
    process.once('SIGINT', () => TracerHelper.shutdown(sdk));

    return sdk;
  }

  private static shutdown(sdk: NodeSDK): void {
    sdk
      .shutdown()
      .catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.error('OpenTelemetry shutdown error', error);
      })
      .finally(() => process.exit(0));
  }
}
