import type { MarketMapOperations } from "document-models/market/v1";
import {
  AxesRequiredError,
  AxisTextRequiredError,
  DuplicatePlayerIdError,
  EvidenceAlreadyLinkedError,
  EvidenceNotLinkedError,
  OrganisationAlreadyPlacedError,
  PlayerNotFoundError,
  PositionOutOfRangeError,
} from "../../gen/map/error.js";

export const marketMapOperations: MarketMapOperations = {
  setAxesOperation(state, action) {
    const i = action.input;
    const [xLabel, xLow, xHigh, yLabel, yLow, yHigh] = [
      i.xLabel,
      i.xLow,
      i.xHigh,
      i.yLabel,
      i.yLow,
      i.yHigh,
    ].map((t) => t.trim());
    if ([xLabel, xLow, xHigh, yLabel, yLow, yHigh].some((t) => t === ""))
      throw new AxisTextRequiredError("Each axis needs a label and two ends");
    state.axes = {
      x: { label: xLabel, low: xLow, high: xHigh },
      y: { label: yLabel, low: yLow, high: yHigh },
    };
  },
  placePlayerOperation(state, action) {
    const { id, organisationId, x, y, note } = action.input;
    if (!state.axes) throw new AxesRequiredError("Set the map's axes first");
    if (x < 0 || x > 100 || y < 0 || y > 100)
      throw new PositionOutOfRangeError(
        "A position runs from 0 to 100 on each axis",
      );
    if (state.players.some((p) => p.organisationId === organisationId))
      throw new OrganisationAlreadyPlacedError(
        "The organisation is already on the map",
      );
    if (state.players.some((p) => p.id === id))
      throw new DuplicatePlayerIdError(`Player ${id} already exists`);
    state.players.push({
      id,
      organisationId,
      x,
      y,
      note: note ?? null,
      evidence: [],
    });
  },
  movePlayerOperation(state, action) {
    const { id, x, y } = action.input;
    const player = state.players.find((p) => p.id === id);
    if (!player) throw new PlayerNotFoundError(`Player ${id} not found`);
    if (x < 0 || x > 100 || y < 0 || y > 100)
      throw new PositionOutOfRangeError(
        "A position runs from 0 to 100 on each axis",
      );
    player.x = x;
    player.y = y;
  },
  setPlayerNoteOperation(state, action) {
    const player = state.players.find((p) => p.id === action.input.id);
    if (!player)
      throw new PlayerNotFoundError(`Player ${action.input.id} not found`);
    player.note = action.input.note ?? null;
  },
  linkPlayerEvidenceOperation(state, action) {
    const { id, refId, refTitle } = action.input;
    const player = state.players.find((p) => p.id === id);
    if (!player) throw new PlayerNotFoundError(`Player ${id} not found`);
    if (player.evidence.some((e) => e.id === refId))
      throw new EvidenceAlreadyLinkedError("The note is already linked");
    player.evidence.push({ id: refId, title: refTitle });
  },
  unlinkPlayerEvidenceOperation(state, action) {
    const { id, refId } = action.input;
    const player = state.players.find((p) => p.id === id);
    if (!player) throw new PlayerNotFoundError(`Player ${id} not found`);
    const index = player.evidence.findIndex((e) => e.id === refId);
    if (index === -1)
      throw new EvidenceNotLinkedError("The note is not linked");
    player.evidence.splice(index, 1);
  },
  removePlayerOperation(state, action) {
    const index = state.players.findIndex((p) => p.id === action.input.id);
    if (index === -1)
      throw new PlayerNotFoundError(`Player ${action.input.id} not found`);
    state.players.splice(index, 1);
  },
  setOurPositionOperation(state, action) {
    const { x, y, note, positioningId } = action.input;
    if (!state.axes) throw new AxesRequiredError("Set the map's axes first");
    if (x < 0 || x > 100 || y < 0 || y > 100)
      throw new PositionOutOfRangeError(
        "A position runs from 0 to 100 on each axis",
      );
    state.us = {
      x,
      y,
      note: note ?? null,
      positioningId: positioningId ?? null,
    };
  },
};
