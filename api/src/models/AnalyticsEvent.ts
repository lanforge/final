import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalyticsEvent extends Document {
  sessionId: string;
  cartSessionId?: string;
  userId?: string;
  eventType: string;
  pageUrl: string;
  productId?: string;
  discountCode?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

const analyticsEventSchema = new Schema({
  sessionId: { type: String, required: true },
  cartSessionId: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  eventType: { type: String, required: true },
  pageUrl: { type: String, required: true },
  productId: { type: String }, // Store as string to handle different types of items or raw IDs
  discountCode: { type: String },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String }
});

export default mongoose.model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventSchema);
