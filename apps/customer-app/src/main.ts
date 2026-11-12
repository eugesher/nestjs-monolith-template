import '@acme-libs/observability/tracer';
import { AppBootstrap } from '@acme-libs/bootstrap';
import { AppNameEnum } from '@acme-libs/kernel';
import { AppModule } from '@acme-customer/app/app.module';

void AppBootstrap.run(AppModule, AppNameEnum.CUSTOMER_APP);
