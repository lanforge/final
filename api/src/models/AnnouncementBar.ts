import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement {
  _id?: mongoose.Types.ObjectId;
  text: string;
  link?: string;
  isActive: boolean;
}

export interface IAnnouncementBar extends Document {
  announcements: IAnnouncement[];
  rotationSpeed: number; // in seconds
  isVisible: boolean;
}

const AnnouncementBarSchema = new Schema<IAnnouncementBar>(
  {
    announcements: [
      {
        text: { type: String, required: true },
        link: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
      },
    ],
    rotationSpeed: { type: Number, default: 5 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAnnouncementBar>('AnnouncementBar', AnnouncementBarSchema);
