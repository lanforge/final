import mongoose, { Document, Schema } from 'mongoose';

export type UsedPartType =
  | 'cpu'
  | 'gpu'
  | 'ram'
  | 'storage'
  | 'case'
  | 'psu'
  | 'cpu-cooler'
  | 'motherboard'
  | 'fan'
  | 'other';

export interface IUsedPart extends Document {
  type: UsedPartType;
  tradeIn: mongoose.Types.ObjectId;
  brand: string;
  partModel: string;
  price: number;
  notes?: string;
  specs: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const UsedPartSchema = new Schema<IUsedPart>(
  {
    type: {
      type: String,
      enum: ['cpu', 'gpu', 'ram', 'storage', 'case', 'psu', 'cpu-cooler', 'motherboard', 'fan', 'other'],
      required: true,
      index: true,
    },
    tradeIn: {
      type: Schema.Types.ObjectId,
      ref: 'TradeIn',
      required: true,
      index: true,
    },
    brand: { type: String, trim: true, default: '' },
    partModel: { type: String, trim: true, default: '' },
    price: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: '' },
    specs: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

UsedPartSchema.index({ type: 1 });
UsedPartSchema.index({ brand: 'text', partModel: 'text' });

export default mongoose.model<IUsedPart>('UsedPart', UsedPartSchema);