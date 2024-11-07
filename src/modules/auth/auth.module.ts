import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigurationService } from '../../configuration/configuration.service';
import { SessionSerializer } from './session.serializer';
import { CustomStrategy } from './strategy/custom.strategy';

@Module({
  imports: [
    UsersModule,

    {
      ...JwtModule.registerAsync({
        useFactory: async (configurationService: ConfigurationService) => ({
          secret: configurationService.JWT_SECRET_KEY,
          signOptions: { expiresIn: configurationService.JWT_EXPIRATION },
        }),
        inject: [ConfigurationService],
      }),
      global: true,
    },
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionSerializer,CustomStrategy],
})
export class AuthModule {}
