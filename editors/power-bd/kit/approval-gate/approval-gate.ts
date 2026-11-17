export type ApprovalGateInput = {
  /** The playbook the check reads was found in the open drive. */
  playbookLoaded: boolean;
  /** For a proposal: its lead was found. Leave out when the check needs no lead. */
  leadLoaded?: boolean;
  /** Things the check found to fix. */
  findings: number;
  signedIn: boolean;
};

export type ApprovalGate = {
  canApprove: boolean;
  /** Why approval is closed, for the line beside the button; set only when inputs are missing. */
  message: string | null;
};

/** Approval opens only when the check had everything to check against, found nothing and a person is signed in. */
export function approvalGate(input: ApprovalGateInput): ApprovalGate {
  const missing = [
    ...(input.playbookLoaded ? [] : ["playbook"]),
    ...(input.leadLoaded === false ? ["lead"] : []),
  ];
  if (missing.length) {
    const what = missing.map((m) => `the ${m}`).join(" and ");
    return {
      canApprove: false,
      message: `${what[0].toUpperCase()}${what.slice(1)} ${
        missing.length > 1 ? "are" : "is"
      } not loaded, so this cannot be checked yet`,
    };
  }
  return {
    canApprove: input.findings === 0 && input.signedIn,
    message: null,
  };
}
