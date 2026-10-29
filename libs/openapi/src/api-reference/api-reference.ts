import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

import { AppNameEnum } from '@acme-libs/kernel';

export class ApiReference {
  private static readonly DOCUMENTS: Record<AppNameEnum, { title: string; description: string }> = {
    [AppNameEnum.STAFF_APP]: {
      title: 'ACME staff API',
      description: 'The back-office surface: identity administration and the audit log.',
    },
    [AppNameEnum.CUSTOMER_APP]: {
      title: 'ACME customer API',
      description: 'The customer-facing surface: sessions and the item catalog.',
    },
  };

  public static setup(app: INestApplication, appName: AppNameEnum, port: number): void {
    const config = app.get(ConfigService);

    if (!config.getOrThrow<boolean>('API_USE_API_REFERENCE')) {
      return;
    }

    const prefix = config.getOrThrow<string>('API_PREFIX');
    const { title, description } = ApiReference.DOCUMENTS[appName];
    const options = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .addBearerAuth()
      .addServer(`http://localhost:${port}`, 'Local')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    const reference = apiReference({ content: document });

    app.use(`/${prefix}/reference`, reference);
  }
}
