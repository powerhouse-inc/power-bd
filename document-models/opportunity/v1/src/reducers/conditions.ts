import type { OpportunityConditionsOperations } from "document-models/opportunity/v1";
import {
  CheckedDateRequiredError,
  ConditionNotFoundError,
  DuplicateConditionIdError,
  SourceRequiredError,
} from "../../gen/conditions/error.js";

export const opportunityConditionsOperations: OpportunityConditionsOperations =
  {
    addConditionOperation(state, action) {
      const { input } = action;
      if (state.conditions.some((c) => c.id === input.id))
        throw new DuplicateConditionIdError(
          `Condition ${input.id} already exists`,
        );
      if (!input.source?.trim())
        throw new SourceRequiredError("A condition needs a source");
      if (!input.checkedAt)
        throw new CheckedDateRequiredError(
          "A condition needs the date it was checked",
        );

      state.conditions.push({
        id: input.id,
        kind: input.kind,
        text: input.text,
        state: input.state ?? "UNKNOWN",
        decisionIds: input.decisionIds ?? [],
        factNotes: input.factNotes ?? [],
        source: input.source,
        checkedAt: input.checkedAt,
      });
    },
    updateConditionOperation(state, action) {
      const { input } = action;
      const condition = state.conditions.find((c) => c.id === input.id);
      if (!condition)
        throw new ConditionNotFoundError(`Condition ${input.id} not found`);
      if (input.source != null && !input.source.trim())
        throw new SourceRequiredError("A condition needs a source");

      if (input.kind != null) condition.kind = input.kind;
      if (input.text != null) condition.text = input.text;
      if (input.decisionIds != null) condition.decisionIds = input.decisionIds;
      if (input.factNotes != null) condition.factNotes = input.factNotes;
      if (input.source != null) condition.source = input.source;
      if (input.checkedAt != null) condition.checkedAt = input.checkedAt;
    },
    removeConditionOperation(state, action) {
      const index = state.conditions.findIndex((c) => c.id === action.input.id);
      if (index === -1)
        throw new ConditionNotFoundError(
          `Condition ${action.input.id} not found`,
        );
      state.conditions.splice(index, 1);
    },
    markConditionOperation(state, action) {
      const { id, state: next, checkedAt } = action.input;
      const condition = state.conditions.find((c) => c.id === id);
      if (!condition)
        throw new ConditionNotFoundError(`Condition ${id} not found`);
      condition.state = next;
      condition.checkedAt = checkedAt;
    },
  };
