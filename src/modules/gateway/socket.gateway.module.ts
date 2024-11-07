import {  forwardRef, Global, Module } from "@nestjs/common";

import { UsersModule } from "../users/users.module";
import { ChatModule } from "../chats/chat.module";

import { ChatService } from "../chats/chat.service";
import { SocketGateway } from "./socket.gateway";


@Global()
@Module({
	imports: [
		UsersModule, 
		forwardRef(() => ChatModule),

	],
	controllers: [],
	providers: [
		SocketGateway,
		
	],
	exports: [SocketGateway],
})
export class SocketModule {}