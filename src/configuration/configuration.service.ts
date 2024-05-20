import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigurationService {
  constructor(private readonly configService: ConfigService) {}

  get API_URL() {
    return this.configService.get<string>('API_URL');
  }
  get MAIL() {
    return this.configService.get<string>('MAIL');
  }

  get WEB_URL() {
    return this.configService.get<string>('WEB_URL');
  }
  get JWT_SECRET_KEY() {
    return this.configService.get<string>('JWT_SECRET_KEY');
  }
  get SMPT_HOST() {
    return this.configService.get<string>('SMPT_HOST');
  }
  get SMPT_SERVICE() {
    return this.configService.get<string>('SMPT_SERVICE');
  }
  get SMPT_PASSWORD() {
    return this.configService.get<string>('SMPT_PASSWORD');
  }
  get SMPT_MAIL() {
    return this.configService.get<string>('SMPT_MAIL');
  }
  get SMPT_PORT() {
    return this.configService.get<number>('SMPT_PORT');
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
}
