export { lead, opportunity, proposal } from "../organisation/fixtures.js";
export const NOW = "2026-11-16T10:00:00.000Z";
export const link = (contactId: string, personId: string | null) => ({
  id: `k-${contactId}-${personId}`,
  contactId,
  personId,
  role: null,
  dealRole: null,
});
