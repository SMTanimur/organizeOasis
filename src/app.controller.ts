import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ChatsGateway } from './modules/chats/chat-gateway';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly chatGateway: ChatsGateway,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('connections')
  getConnections() {
    const server = this.chatGateway.server;
    return {
      connections: server.sockets.sockets?.size,
      rooms: Array.from(server.sockets.adapter?.rooms?.keys()),
      namespaces: Object.keys(server._nsps),
    };
  }

  @Post('broadcast')
  broadcastMessage(@Body() { event, data }: { event: string; data: any }) {
    this.chatGateway.server.emit(event, data);
    return { success: true, message: 'Broadcast sent' };
  }

  @Get('clients')
  getClients() {
    const server = this.chatGateway.server;
    const clients = Array.from(server.sockets.sockets?.values())?.map(
      (socket) => ({
        id: socket.id,
        rooms: Array.from(socket.rooms),
        connectedAt: socket.data.connectedAt,
        handshake: {
          headers: socket.handshake.headers,
          query: socket.handshake.query,
          auth: socket.handshake.auth,
        },
      }),
    );

    return { clients };
  }
}
