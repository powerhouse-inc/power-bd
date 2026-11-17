import type { LeadKind, LeadStatus } from "document-models/lead/v1";
import {
  parkLead,
  reducer,
  setLeadDetails,
  setLeadStatus,
  setOwner,
  unparkLead,
  utils,
} from "document-models/lead/v1";
import { describe, expect, it } from "vitest";

type LeadDocument = ReturnType<typeof utils.createDocument>;

const JONAS = "0x1111111111111111111111111111111111111aaa";

/** The error of each operation, in the order they were dispatched. */
function errors(document: LeadDocument) {
  return document.operations.global.map((operation) => operation.error);
}

/** Brisa Labs, owned by Jonas and still to contact: the first two operations. */
function brisaLead(kind: LeadKind = "SALES") {
  const document = reducer(
    utils.createDocument(),
    setLeadDetails({
      name: "Brisa Labs · e-signature rollout",
      kind,
      organisationId: "contact-brisa-labs",
    }),
  );
  return reducer(document, setOwner({ owner: JONAS }));
}

/** The statuses a lead moves between by hand. */
const OPEN = [
  "TO_CONTACT",
  "IN_TOUCH",
  "MEETING_SET",
  "MET",
  "PROPOSAL",
] as const;

/** Moves the lead by hand, on the morning of 16 November 2026. */
function move(document: LeadDocument, status: LeadStatus, reason?: string) {
  return reducer(
    document,
    setLeadStatus({ status, reason, changedAt: "2026-11-16T09:00:00.000Z" }),
  );
}

/** Parks the lead on the morning of 16 November 2026. */
function park(
  document: LeadDocument,
  reason = "Waiting for their budget cycle",
) {
  return reducer(
    document,
    parkLead({ reason, parkedAt: "2026-11-16T09:00:00.000Z" }),
  );
}

/** Brisa Labs at the given open status: three operations. */
function leadAt(status: (typeof OPEN)[number], kind: LeadKind = "SALES") {
  return move(brisaLead(kind), status);
}

describe("a lead's status, moved by hand", () => {
  it("moves a lead that has an owner and an organisation from to contact to in touch", () => {
    const document = move(brisaLead(), "IN_TOUCH");

    expect(errors(document)).toStrictEqual([undefined, undefined, undefined]);
    expect(document.state.global.status).toBe("IN_TOUCH");
  });

  it.each(
    OPEN.flatMap((from) =>
      OPEN.filter((to) => to !== from).map((to) => [from, to] as const),
    ),
  )("moves an open lead from %s to %s", (from, to) => {
    const document = move(leadAt(from), to);

    expect(document.operations.global[3].error).toBeUndefined();
    expect(document.state.global.status).toBe(to);
  });
});

describe("refused moves by hand", () => {
  it("refuses any move of a won or lost lead", () => {
    let won = move(leadAt("MET"), "WON");
    let lost = move(leadAt("MET"), "LOST", "They signed with another vendor");
    for (const status of ["TO_CONTACT", "PROPOSAL", "WON", "LOST"] as const) {
      won = move(won, status, "Too late");
      lost = move(lost, status, "Too late");
    }

    expect(errors(won).slice(4)).toStrictEqual(
      Array(4).fill("A won or lost lead is final"),
    );
    expect(errors(lost).slice(4)).toStrictEqual(
      Array(4).fill("A won or lost lead is final"),
    );
    expect(won.state.global.status).toBe("WON");
    expect(lost.state.global).toMatchObject({
      status: "LOST",
      statusReason: "They signed with another vendor",
    });
  });

  it("refuses to move a parked lead until it is unparked", () => {
    let document = park(leadAt("MET"));
    document = move(document, "IN_TOUCH");
    document = move(document, "WON");

    expect(errors(document).slice(4)).toStrictEqual([
      "A parked lead is unparked before its status changes",
      "A parked lead is unparked before its status changes",
    ]);
    expect(document.state.global.status).toBe("PARKED");
  });

  it("refuses to reach parked by hand", () => {
    const document = move(leadAt("MET"), "PARKED", "Waiting for budget");

    expect(errors(document)[3]).toBe(
      "A lead is parked with PARK_LEAD, which takes the reason",
    );
    expect(document.state.global.status).toBe("MET");
  });
});

describe("the investor limit", () => {
  it("refuses proposal and won for an investor lead, and lets it go as far as met", () => {
    let document = leadAt("MET", "INVESTOR");
    document = move(document, "PROPOSAL");
    document = move(document, "WON");

    expect(errors(document).slice(3)).toStrictEqual([
      "An investor lead goes no further than met",
      "An investor lead goes no further than met",
    ]);
    expect(document.state.global.status).toBe("MET");
  });

  it("still closes an investor lead as lost", () => {
    const document = move(leadAt("MET", "INVESTOR"), "LOST", "Fund closed");

    expect(errors(document)[3]).toBeUndefined();
    expect(document.state.global.status).toBe("LOST");
  });

  it("refuses to make a lead at proposal an investor lead, or to change its kind to one", () => {
    let document = leadAt("PROPOSAL");
    document = reducer(document, setLeadDetails({ kind: "INVESTOR" }));

    expect(errors(document)[3]).toBe(
      "An investor lead goes no further than met",
    );
    expect(document.state.global.kind).toBe("SALES");

    document = move(document, "MET");
    document = reducer(document, setLeadDetails({ kind: "INVESTOR" }));
    expect(errors(document)[5]).toBeUndefined();
    expect(document.state.global.kind).toBe("INVESTOR");
  });

  it("refuses to make a lead investor while it is parked from proposal, or already won", () => {
    let document = park(leadAt("PROPOSAL"));
    document = reducer(document, setLeadDetails({ kind: "INVESTOR" }));
    const won = reducer(
      move(leadAt("MET"), "WON"),
      setLeadDetails({ kind: "INVESTOR" }),
    );

    expect(errors(document)[4]).toBe(
      "An investor lead goes no further than met",
    );
    expect(errors(won)[4]).toBe("An investor lead goes no further than met");
  });
});

describe("parking and unparking", () => {
  it.each(OPEN)("parks a lead at %s, keeping where it was and why", (from) => {
    const document = park(leadAt(from), "Waiting for their budget cycle");

    expect(document.operations.global[3].error).toBeUndefined();
    expect(document.state.global).toMatchObject({
      status: "PARKED",
      parkedFrom: from,
      statusReason: "Waiting for their budget cycle",
      closedAt: null,
    });
  });

  it.each(OPEN)("unparks a lead back to %s", (from) => {
    const document = reducer(park(leadAt(from)), unparkLead({}));

    expect(document.operations.global[4].error).toBeUndefined();
    expect(document.state.global).toMatchObject({
      status: from,
      parkedFrom: null,
      statusReason: null,
    });
  });

  it("refuses to park a won or lost lead", () => {
    const won = park(move(leadAt("MET"), "WON"));
    const lost = park(move(leadAt("MET"), "LOST", "Fund closed"));

    expect(errors(won)[4]).toBe("A won or lost lead is final");
    expect(errors(lost)[4]).toBe("A won or lost lead is final");
    expect(won.state.global.status).toBe("WON");
  });

  it("refuses to park a lead that is already parked, and keeps the first reason", () => {
    const document = park(park(leadAt("MET"), "First reason"), "Second reason");

    expect(errors(document)[4]).toBe("The lead is already parked");
    expect(document.state.global).toMatchObject({
      parkedFrom: "MET",
      statusReason: "First reason",
    });
  });

  it("refuses to park without a reason, an owner or an organisation", () => {
    let noReason = park(leadAt("MET"), "  ");
    noReason = park(noReason, "");
    const noOwner = park(
      reducer(
        utils.createDocument(),
        setLeadDetails({ organisationId: "contact-brisa-labs" }),
      ),
    );
    const noOrganisation = park(
      reducer(utils.createDocument(), setOwner({ owner: JONAS })),
    );

    expect(errors(noReason).slice(3)).toStrictEqual([
      "Parking a lead needs a reason",
      "Parking a lead needs a reason",
    ]);
    expect(noReason.state.global.status).toBe("MET");
    expect(errors(noOwner)[1]).toBe("A lead past to contact needs an owner");
    expect(errors(noOrganisation)[1]).toBe(
      "A lead past to contact needs an organisation",
    );
  });

  it("refuses to unpark a lead that is not parked", () => {
    const document = reducer(leadAt("MET"), unparkLead({}));

    expect(errors(document)[3]).toBe("Only a parked lead can be unparked");
    expect(document.state.global.status).toBe("MET");
  });
});

describe("owner and organisation of a lead past to contact", () => {
  it("refuses to clear the owner or the organisation of a lead that is past to contact", () => {
    let document = leadAt("IN_TOUCH");
    document = reducer(document, setOwner({ owner: null }));
    document = reducer(document, setLeadDetails({ organisationId: null }));
    document = reducer(document, setLeadDetails({ name: "Renamed" }));

    expect(errors(document).slice(3)).toStrictEqual([
      "A lead past to contact needs an owner",
      "A lead past to contact needs an organisation",
      undefined,
    ]);
    expect(document.state.global).toMatchObject({
      owner: JONAS,
      organisationId: "contact-brisa-labs",
    });
  });
});

describe("a lead past to contact", () => {
  it("refuses every status past to contact while the lead has no owner", () => {
    let document = reducer(
      utils.createDocument(),
      setLeadDetails({
        name: "Kelvar Institute · research exchange",
        kind: "EXCHANGE",
        organisationId: "contact-kelvar-institute",
      }),
    );
    for (const status of [
      "IN_TOUCH",
      "MEETING_SET",
      "MET",
      "PROPOSAL",
      "WON",
      "LOST",
    ] as const) {
      document = move(document, status, "They chose another partner");
    }

    expect(errors(document).slice(1)).toStrictEqual([
      "A lead past to contact needs an owner",
      "A lead past to contact needs an owner",
      "A lead past to contact needs an owner",
      "A lead past to contact needs an owner",
      "A lead past to contact needs an owner",
      "A lead past to contact needs an owner",
    ]);
    expect(document.state.global.status).toBe("TO_CONTACT");
  });

  it("refuses every status past to contact while the lead has no organisation", () => {
    let document = reducer(utils.createDocument(), setOwner({ owner: JONAS }));
    for (const status of [
      "IN_TOUCH",
      "MEETING_SET",
      "MET",
      "PROPOSAL",
      "WON",
      "LOST",
    ] as const) {
      document = move(document, status, "They chose another partner");
    }

    expect(errors(document).slice(1)).toStrictEqual([
      "A lead past to contact needs an organisation",
      "A lead past to contact needs an organisation",
      "A lead past to contact needs an organisation",
      "A lead past to contact needs an organisation",
      "A lead past to contact needs an organisation",
      "A lead past to contact needs an organisation",
    ]);
    expect(document.state.global.status).toBe("TO_CONTACT");
  });
});

describe("closing a lead", () => {
  it.each(OPEN)(
    "closes a lead at %s as won, recording the instant it closed",
    (from) => {
      const document = reducer(
        leadAt(from),
        setLeadStatus({ status: "WON", changedAt: "2026-12-01T15:30:00.000Z" }),
      );

      expect(document.operations.global[3].error).toBeUndefined();
      expect(document.state.global).toMatchObject({
        status: "WON",
        statusReason: null,
        closedAt: "2026-12-01T15:30:00.000Z",
      });
    },
  );

  it.each(OPEN)(
    "closes a lead at %s as lost, recording the reason and the instant it closed",
    (from) => {
      const document = reducer(
        leadAt(from),
        setLeadStatus({
          status: "LOST",
          reason: "They signed with another vendor",
          changedAt: "2026-12-01T15:30:00.000Z",
        }),
      );

      expect(document.operations.global[3].error).toBeUndefined();
      expect(document.state.global).toMatchObject({
        status: "LOST",
        statusReason: "They signed with another vendor",
        closedAt: "2026-12-01T15:30:00.000Z",
      });
    },
  );

  it("refuses to close a lead as lost without a reason", () => {
    let document = leadAt("MET");
    document = move(document, "LOST");
    document = move(document, "LOST", "   ");
    document = reducer(
      document,
      setLeadStatus({
        status: "LOST",
        reason: null,
        changedAt: "2026-12-01T15:30:00.000Z",
      }),
    );

    expect(errors(document).slice(3)).toStrictEqual([
      "A lost lead needs a reason",
      "A lost lead needs a reason",
      "A lost lead needs a reason",
    ]);
    expect(document.state.global).toMatchObject({
      status: "MET",
      statusReason: null,
      closedAt: null,
    });
  });
});
