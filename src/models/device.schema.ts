import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type DeviceDocument = HydratedDocument<Device>;

@Schema()
export class Device {
  @Prop({
    required: true,
  })
  type: string;

  @Prop({
    required: true,
    ref: 'User',
  })
  user_ref: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
  })
  session_id: string;

  @Prop({
    default: Date.now,
  })
  created_at: Date;

  @Prop({
    default: Date.now,
  })
  updated_at: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});
