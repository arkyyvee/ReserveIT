import { Log } from "../models/Log.js";

export async function logActivity({ actor, action, entity, entityId, message, metadata = {} }) {
  await Log.create({
    actor,
    action,
    entity,
    entityId,
    message,
    metadata
  });
}
