import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigurationService {
  constructor(private readonly configService: ConfigService) {}

  get WEB_URL() {
    return this.configService.get<string>('WEB_URL');
  }
  get JWT_SECRET_KEY() {
    return this.configService.get<string>('JWT_SECRET_KEY');
  }
  get API_URL() { 
    return this.configService.get<string>('API_URL');
  }

  get CLOUDINARY_CLOUD_NAME() {
    return this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
  }
  get CLOUDINARY_API_KEY() {
    return this.configService.get<string>('CLOUDINARY_API_KEY');
  }
  get CLOUDINARY_API_SECRET() {
    return this.configService.get<string>('CLOUDINARY_API_SECRET');
  }

  get MONGODB_URI() {
    return this.configService.get<string>('MONGODB_URI');
  }

  get GOOGLE_CLIENT_ID() {
    return this.configService.get<string>('GOOGLE_CLIENT_ID');
  }
  get GOOGLE_CLIENT_SECRET() {
    return this.configService.get<string>('GOOGLE_CLIENT_SECRET');
  }
  get JWT_EXPIRATION() {
    return this.configService.get<string>('JWT_EXPIRATION');
  }
  get SESSION_NAME() {
    return this.configService.get<string>('SESSION_NAME');
  }
  get SESSION_SECRET_KEY() {
    return this.configService.get<string>('SESSION_SECRET_KEY');
  }
}
