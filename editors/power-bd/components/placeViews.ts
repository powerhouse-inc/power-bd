import type { ComponentType } from "react";
import type { PlaceId } from "../kit/places.js";
import { DecisionsView } from "../views/decisions/DecisionsView.js";
import { FundingView } from "../views/funding/FundingView.js";
import { InvestorsView } from "../views/investors/InvestorsView.js";
import { LeadsView } from "../views/leads/LeadsView.js";
import { MarketsView } from "../views/market/MarketsView.js";
import { OrganisationsView } from "../views/organisations/OrganisationsView.js";
import { OverviewView } from "../views/overview/OverviewView.js";
import { ProposalsView } from "../views/proposals/ProposalsView.js";
import { PlaybookView } from "../views/playbook/PlaybookView.js";
import { SettingsView } from "../views/settings/SettingsView.js";

/**
 * The view each place shows: kit/places.ts stays free of React, so the table
 * sits here. The Agent place is the chat's full view, which the Shell shows.
 */
export const PLACE_VIEWS: Record<
  Exclude<PlaceId, "agent">,
  ComponentType<{ driveId: string }>
> = {
  overview: OverviewView,
  leads: LeadsView,
  proposals: ProposalsView,
  funding: FundingView,
  investors: InvestorsView,
  organisations: OrganisationsView,
  market: MarketsView,
  decisions: DecisionsView,
  playbook: PlaybookView,
  settings: SettingsView,
};
