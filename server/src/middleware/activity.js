import ActivityLog from "../models/ActivityLog.js";

export async function logActivity(req, action, entity, entityId, description, metadata = {}) {
  if (!req.user) return;
  await ActivityLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    action,
    entity,
    entityId: String(entityId || ""),
    description,
    metadata
  });
}
