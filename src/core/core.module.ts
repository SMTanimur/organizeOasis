import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ConfigurationModule } from '../configuration/configuration.module';
import { ConfigurationService } from '../configuration/configuration.service';
@Global()
@Module({
  imports: [
    ConfigurationModule,
    // PassportModule.register({ session: true }),
    {
      ...JwtModule.registerAsync({
        useFactory: async (configurationService: ConfigurationService) => ({
          secret: configurationService.JWT_SECRET_KEY,
          signOptions: { expiresIn: '3d' },
        }),
        inject: [ConfigurationService],
      }),
      global: true,
    },
  ],
  providers: [
    // { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    // { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
  ],
  exports: [JwtModule],
})
export class CoreModule {}
