import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import bcrypt from 'bcryptjs';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Provider, Role } from '../../../common/constants';
import { Types } from 'mongoose';
import { Organization } from '../../organization/schemas';
import { IsObjectId } from 'nestjs-object-id';

@Schema({ timestamps: true })
export class User {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty()
  @Prop({ required: true })
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty()
  @Prop({ required: true })
  lastName: string;

  @IsEmail()
  @ApiProperty()
  @Prop({ required: true, unique: true })
  email: string;

  @IsString()
  @IsOptional()
  @Prop({
    type: String,
    default:
      'https://res.cloudinary.com/smtanimur/image/upload/v1658841812/mushfiqTanim/user_qcrqny_kcgfes.svg',
  })
  avatar?: string;

  @IsString()
  @MinLength(7)
  @MaxLength(150)
  @ApiProperty()
  @Prop({ required: true })
  password: string;

  @IsEnum(Provider)
  @IsOptional()
  @Prop({
    enum: [
      Provider.FACEBOOK,
      Provider.GITHUB,
      Provider.GOOGLE,
      Provider.PASSWORD,
    ],
    default: Provider.PASSWORD,
    type: String,
  })
  provider: string;

  @IsString()
  @IsOptional()
  @Prop({ type: String, default: null })
  provider_id: string;

  @IsOptional()
  @Prop()
  contact?: string;

  @IsBoolean()
  @IsOptional()
  @Prop({ default: false })
  email_verified?: boolean;

  @IsEnum(Role)
  @IsOptional()
  @Prop({
    enum: [Role.ADMIN, Role.USER],
    default: Role.USER,
    type: String,
  })
  role?: string;

  @Prop([
    {
      organization: { type: Types.ObjectId, ref: 'Organization' },
      role: String,
    },
  ])
  @IsArray({each: true})
  @IsObjectId({each: true})
  @IsOptional()
  organizations?: Types.ObjectId[];
}

export interface UserDocument extends User {
  comparePassword?(password: string): Promise<boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  const user = this as UserDocument;
  return await bcrypt.compare(password, user.password);
};
