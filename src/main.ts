import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import session from 'express-session';
import  passport from 'passport';
import cookieParser from 'cookie-parser';
import  MongoDBStore from 'connect-mongodb-session';
// somewhere in your initialization file

import helmet from 'helmet';
import { ConfigurationService } from './configuration/configuration.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
const MongoStore = MongoDBStore(session);
const env = process.env.NODE_ENV || 'dev';


class CustomSocketAdapter extends IoAdapter {
  private readonly logger = new Logger('WebSocketAdapter');

  constructor(
    app: any,
    private readonly configurationService: ConfigurationService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: any) {
    const wsPort =  3334;
    this.logger.log(`WebSocket Server starting on port: ${wsPort}`);

    const server = super.createIOServer(wsPort, {
      ...options,
      cors: {
        origin: this.configurationService.WEB_URL,
        credentials: true,
      },
    });

    return server;
  }
}
async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configurationService =
      app.get<ConfigurationService>(ConfigurationService);

    app.enableCors({
      credentials: true,
      origin: [
        configurationService.WEB_URL,

        'http://localhost:3000',
        'https://accounts.google.com',
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });

    app.use(cookieParser());
    app.use(helmet());
    // Enable API versioning
    app.enableVersioning({
      type: VersioningType.URI,
    });

   // WebSocket Adapter
   app.useWebSocketAdapter(new CustomSocketAdapter(app, configurationService));


    // Swagger Setup
    const config = new DocumentBuilder()
      .setTitle('Organize - An API for Organize')
      .setDescription(
        'Organize is your source for quality auto parts, advice and accessories. View family care tips, shop online for home delivery, or pick up in one of our 4000 convenient store locations in 30 minutes or less.',
      )
      .setVersion('1.0')
      .addServer(configurationService.API_URL)
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);


    // Express session configuration
    app.use(
      session({
        name: configurationService.SESSION_NAME,
        secret: configurationService.SESSION_SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          httpOnly: true,
          sameSite: process.env.NODE_ENV === 'production' ? 'none':'lax', // Use 'none' for cross-site cookies
          secure: process.env.NODE_ENV === 'production', // Set secure flag in production
        },
        store: new MongoStore({
          uri: configurationService.MONGODB_URI,
          collection: 'sessions',
          expires: 30 * 24 * 60 * 60 * 1000, // 30 days
        }),
      })
    );

    // Passport configuration
    app.use(passport.initialize());
    app.use(passport.session());

    app.set("trust proxy", 1);

    // app.useGlobalFilters(new NestHttpExceptionFilter(configurationService));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    const port = process.env.PORT || 3333;
    await app.listen(port);
    Logger.log(
      ` Alhamdulillah! - Application is running on: http://localhost:${port} 🚀 `
        .bgCyan.black,
    );
  } catch (error) {
    Logger.error(`Error: ${error.message}`.red);
    process.exit(1);
  }
}
bootstrap();
