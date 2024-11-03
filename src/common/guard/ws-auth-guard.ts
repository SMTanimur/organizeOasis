import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import session from 'express-session';
import { parse } from 'cookie';
import { Response } from 'express';
import { ConfigurationService } from '../../configuration/configuration.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly configurationService: ConfigurationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const request = client.handshake;
      
      // Get session ID from cookie
      if (!request.headers.cookie) {
        throw new WsException('No session cookie found');
      }

      const cookies = parse(request.headers.cookie);
      const sessionId = cookies[this.configurationService.SESSION_NAME]; // or your session cookie name

      if (!sessionId) {
        throw new WsException('No session ID found');
      }

      // Get session data
      const session = await this.getSession(request);
      
      if (!session || !session.passport || !session.passport.user) {
        throw new WsException('Unauthorized');
      }

      // Attach user data to socket
      client.data.user = session.passport.user;
      
      return true;
    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }

  private getSession(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      session({
        secret: this.configurationService.SESSION_SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        name: this.configurationService.SESSION_NAME// Your session cookie name
        // ... other session options
      })(request, {} as Response, () => {
        if (request.session && request.session.passport) {
          resolve(request.session);
        } else {
          reject('No session found');
        }
      });
    });
  }
}