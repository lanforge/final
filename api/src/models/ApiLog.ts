import mongoose, { Document, Schema } from 'mongoose';

export interface IApiLog extends Document {
  method: string;
  path: string;
  fullUrl: string;
  statusCode: number;
  ipAddress: string;
  origin: string;
  referer: string;
  userAgent: string;
  source: 'internal' | 'external';
  responseTime: number; // ms
  timestamp: Date;
}

const ApiLogSchema = new Schema<IApiLog>(
  {
    method: { type: String, required: true, index: true },
    path: { type: String, required: true, index: true },
    fullUrl: { type: String },
    statusCode: { type: Number, required: true, index: true },
    ipAddress: { type: String, required: true, index: true },
    origin: { type: String, default: '' },
    referer: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    source: {
      type: String,
      enum: ['internal', 'external'],
      default: 'external',
      index: true,
    },
    responseTime: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ApiLogSchema.index({ createdAt: -1 });
ApiLogSchema.index({ source: 1, createdAt: -1 });
ApiLogSchema.index({ statusCode: 1, createdAt: -1 });
ApiLogSchema.index({ ipAddress: 1, createdAt: -1 });

export default mongoose.model<IApiLog>('ApiLog', ApiLogSchema);
