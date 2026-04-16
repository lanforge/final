import mongoose, { Document, Schema } from 'mongoose';

export interface IShowcaseBuildPart {
  part?: mongoose.Types.ObjectId;
  quantity: number;
  partType: string;
}

export interface IShowcaseBuild extends Document {
  name: string; // e.g. "Streamer PC 1"
  creatorName: string; // e.g. "Ninja"
  creatorCode: string; // For the URL /partner/:code
  partner?: mongoose.Types.ObjectId; // Optional ref to Partner
  description: string;
  images: string[];
  parts: IShowcaseBuildPart[];
  subtotal: number;
  laborFee: number;
  total: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShowcaseBuildPartSchema = new Schema<IShowcaseBuildPart>(
  {
    part: { type: Schema.Types.ObjectId, ref: 'PCPart' },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    partType: { type: String, required: true },
  },
  { _id: false }
);

const ShowcaseBuildSchema = new Schema<IShowcaseBuild>(
  {
    name: { type: String, required: true },
    creatorName: { type: String, required: true },
    creatorCode: { type: String, required: true, lowercase: true },
    partner: { type: Schema.Types.ObjectId, ref: 'Partner' },
    description: { type: String, default: '' },
    images: [{ type: String }],
    parts: [ShowcaseBuildPartSchema],
    subtotal: { type: Number, required: true, default: 0 },
    laborFee: { type: Number, required: true, default: 99.99 },
    total: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ShowcaseBuildSchema.index({ creatorCode: 1 });

export default mongoose.model<IShowcaseBuild>('ShowcaseBuild', ShowcaseBuildSchema);
