import mongoose, { Document, Schema } from 'mongoose';

export interface IBuildRequest extends Document {
  name: string;
  email: string;
  phone?: string;
  budget?: string;
  details: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  usage?: string;
  preferredBrands?: string;
  timeline?: string;
  status: 'pending' | 'reviewed' | 'contacted' | 'completed' | 'unbuildable';
  rejectionReason?: string;
  quote?: {
    parts: { partId: mongoose.Types.ObjectId; name: string; price: number; quantity: number }[];
    laborCost: number;
    shipping: { provider: string; serviceLevel: string; amount: number };
    totalPrice: number;
    sentAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BuildRequestSchema = new Schema<IBuildRequest>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    budget: { type: String },
    details: { type: String, required: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
      country: { type: String }
    },
    usage: { type: String },
    preferredBrands: { type: String },
    timeline: { type: String },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'contacted', 'completed', 'unbuildable'],
      default: 'pending',
    },
    rejectionReason: { type: String },
    quote: {
      parts: [
        {
          partId: { type: Schema.Types.ObjectId, ref: 'PCPart' },
          name: { type: String },
          price: { type: Number },
          quantity: { type: Number, default: 1 }
        }
      ],
      laborCost: { type: Number, default: 0 },
      shipping: {
        provider: { type: String },
        serviceLevel: { type: String },
        amount: { type: Number }
      },
      totalPrice: { type: Number },
      sentAt: { type: Date }
    }
  },
  { timestamps: true }
);

export default mongoose.model<IBuildRequest>('BuildRequest', BuildRequestSchema);
