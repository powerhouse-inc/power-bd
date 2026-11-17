import type { LeadAnglesOperations } from "document-models/lead/v1";
import {
  AngleNotFoundError,
  DuplicateAngleIdError,
} from "../../gen/angles/error.js";

export const leadAnglesOperations: LeadAnglesOperations = {
  addAngleOperation(state, action) {
    const { id, summary, fit, positioningId } = action.input;
    if (state.angles.some((angle) => angle.id === id))
      throw new DuplicateAngleIdError(`Angle ${id} already exists`);
    state.angles.push({
      id,
      summary,
      fit,
      positioningId: positioningId ?? null,
    });
  },
  updateAngleOperation(state, action) {
    const { id, summary, fit, positioningId } = action.input;
    const angle = state.angles.find((a) => a.id === id);
    if (!angle) throw new AngleNotFoundError(`Angle ${id} not found`);
    if (summary != null) angle.summary = summary;
    if (fit != null) angle.fit = fit;
    if (positioningId !== undefined) angle.positioningId = positioningId;
  },
  removeAngleOperation(state, action) {
    const { id } = action.input;
    if (!state.angles.some((angle) => angle.id === id))
      throw new AngleNotFoundError(`Angle ${id} not found`);
    state.angles = state.angles.filter((angle) => angle.id !== id);
    for (const message of state.messages)
      if (message.angleId === id) message.angleId = null;
  },
};
