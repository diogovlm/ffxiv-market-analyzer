import mongoose, { Document } from "mongoose";

export interface IAlertToggle extends Document {
  enabled: boolean;
  updatedAt: Date;
}

const AlertToggleSchema = new mongoose.Schema<IAlertToggle>(
  {
    enabled: { type: Boolean, required: true, default: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "alert_toggle" }
);

export default mongoose.model<IAlertToggle>("AlertToggle", AlertToggleSchema);
