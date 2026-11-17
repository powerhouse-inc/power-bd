import { createContext, useContext } from "react";
import type { PlaceId } from "../kit/places.js";

/** Goes to another place of the app; does nothing outside the app shell. */
const GoToPlace = createContext<(id: PlaceId) => void>(() => {});
export const PlaceProvider = GoToPlace.Provider;
export const useGoToPlace = () => useContext(GoToPlace);

/** A row of the investor list to show open, asked for from outside the list (search). */
export type InvestorRowRequest = { rowId: string; asked: number };
const InvestorRow = createContext<InvestorRowRequest | undefined>(undefined);
export const InvestorRowProvider = InvestorRow.Provider;
export const useInvestorRowRequest = () => useContext(InvestorRow);
