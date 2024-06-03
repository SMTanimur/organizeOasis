import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JWTService } from './jwt.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schema/user.schema';
import { JwtModule } from '@nestjs/jwt';

import { ConfigurationService } from 'src/configuration/configuration.service';

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
  providers: [AuthService, JwtStrategy, JWTService],
})
export class AuthModule {}
