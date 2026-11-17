import {
  useInvestorListDocumentById,
} from "document-models/investor-list";
import { EmptyPlace } from "../../components/EmptyPlace.js";
import { useInvestorRowRequest } from "../../components/PlaceContext.js";
import { InvestorListDetail } from "../../records/investor-list/InvestorListDetail.js";
import { useInvestorListDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";

/** The Investors place: the drive's one investor list. */
export function InvestorsView() {
  const lists = useInvestorListDocumentsInSelectedDrive();
  const asked = useInvestorRowRequest();
  const [document, dispatch] = useInvestorListDocumentById(
    lists?.[0]?.header.id,
  );
  if (!document || !dispatch) {
    return (
      <div className="pb-page pb-page--wide">
        <div className="pb-page__head">
          <h1 className="pb-page__title">Investors</h1>
        </div>
        <EmptyPlace
          icon="investors"
          title="Setting up your investor list"
          text="It will appear here in a moment."
        />
      </div>
    );
  }
  // A row asked for from search opens the list afresh, on that row.
  return (
    <InvestorListDetail
      key={asked?.asked ?? 0}
      document={document}
      dispatch={dispatch}
      openRow={asked?.rowId}
    />
  );
}
