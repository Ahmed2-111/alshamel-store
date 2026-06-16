import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorName: String,
    action: { type: String, required: true },
    entity: String,
    entityId: String,
    description: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", activityLogSchema);
