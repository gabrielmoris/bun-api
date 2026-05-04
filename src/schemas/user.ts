import mongoose, { Document, Schema, Model } from "mongoose";

export interface IBookmark extends Document {
  url: string;
  title?: string;
  description?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Bookmark: Model<IBookmark> =
  (mongoose.models.Bookmark as Model<IBookmark>) ||
  mongoose.model<IBookmark>("Bookmark", bookmarkSchema);

export default Bookmark;
