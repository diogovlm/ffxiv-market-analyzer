import mongoose, { Document, Schema } from "mongoose";

export interface IAlert extends Document {
  itemId: string;
  itemName: string;
  buyWorld: string;
  buyPrice: number;
  sellWorld: string;
  sellPrice: number;
  profit: number;
  createdAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    itemId: { type: String, required: true, unique: true, index: true },
    itemName: { type: String, required: true },
    buyWorld: { type: String, required: true },
    buyPrice: { type: Number, required: true },
    sellWorld: { type: String, required: true },
    sellPrice: { type: Number, required: true },
    profit: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now, expires: 86400 }, // 24h
  },
  { timestamps: true }
);

export const Alert = mongoose.model<IAlert>("Alert", alertSchema);
