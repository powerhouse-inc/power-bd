import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "powerbd/lead",
  name: "Lead",
  author: {
    name: "Powerhouse",
    website: "https://powerhouse.inc",
  },
  extension: "",
  description:
    "One sales, partnership, exchange or investor relationship: who it is with, who owns it, how far it has got, the angles we could take and the outreach messages a person approves and sends.",
  specifications: [
    {
      state: {
        local: {
          schema: "",
          examples: [],
          initialValue: "",
        },
        global: {
          schema:
            "type LeadState {\n  name: String\n  kind: LeadKind\n  organisationId: PHID\n  owner: EthereumAddress\n  status: LeadStatus!\n  parkedFrom: LeadStatus\n  statusReason: String\n  closedAt: DateTime\n  source: LeadSource\n  sourceDetail: String\n  expectedCloseDate: Date\n  angles: [Angle!]!\n  messages: [Message!]!\n  nextSteps: [NextStep!]!\n  interactions: [Interaction!]!\n  contactLinks: [ContactLink!]!\n  references: [Reference!]!\n  confidentialItems: [ConfidentialItem!]!\n}\n\nenum LeadKind {\n  SALES\n  PARTNERSHIP\n  EXCHANGE\n  INVESTOR\n}\n\nenum LeadStatus {\n  TO_CONTACT\n  IN_TOUCH\n  MEETING_SET\n  MET\n  PROPOSAL\n  WON\n  LOST\n  PARKED\n}\n\ntype Angle {\n  id: OID!\n  summary: String!\n  fit: Fit!\n  positioningId: OID\n}\n\nenum Fit {\n  BEST\n  GOOD\n  LATER\n  UNLIKELY\n}\n\ntype Message {\n  id: OID!\n  channel: MessageChannel!\n  recipient: PersonRef\n  subject: String\n  body: String!\n  angleId: OID\n  status: MessageStatus!\n  draftedBy: EthereumAddress!\n  draftedAt: DateTime!\n  approvedBy: EthereumAddress\n  approvedAt: DateTime\n  sentBy: EthereumAddress\n  sentAt: DateTime\n}\n\nenum MessageChannel {\n  EMAIL\n  LINKEDIN\n  OTHER\n}\n\nenum MessageStatus {\n  DRAFT\n  APPROVED\n  SENT\n  DISCARDED\n}\n\ntype PersonRef {\n  contactId: PHID!\n  personId: OID!\n}\n\ntype VaultRef {\n  id: PHID!\n  title: String!\n}\n\ntype NextStep {\n  id: OID!\n  text: String!\n  owner: EthereumAddress\n  dueDate: Date\n  doneAt: DateTime\n}\n\nenum InteractionKind {\n  EMAIL\n  CALL\n  MEETING\n  EVENT\n  MESSAGE\n  OTHER\n}\n\nenum InteractionStatus {\n  SCHEDULED\n  HELD\n  CANCELLED\n}\n\ntype Interaction {\n  id: OID!\n  kind: InteractionKind!\n  status: InteractionStatus!\n  at: DateTime\n  timeZone: String\n  summary: String\n  people: [PersonRef!]!\n  teamMembers: [EthereumAddress!]!\n  notesSource: VaultRef\n  outcome: InteractionOutcome\n}\n\ntype ContactLink {\n  id: OID!\n  contactId: PHID!\n  personId: OID\n  role: String\n  dealRole: DealRole\n}\n\nenum ReferenceKind {\n  RESEARCH\n  NOTE\n  SOURCE\n  COMPARABLE\n  OPPORTUNITY\n  LEAD\n  DECISION\n  OTHER\n}\n\ntype Reference {\n  id: OID!\n  kind: ReferenceKind!\n  documentId: PHID!\n  title: String!\n}\n\ntype ConfidentialItem {\n  id: OID!\n  subjectContactId: PHID\n  text: String!\n  addedBy: EthereumAddress!\n  addedAt: DateTime!\n}\n\nenum LeadSource {\n  EVENT\n  REFERRAL\n  INBOUND\n  OUTBOUND\n  PARTNER\n  OTHER\n}\n\nenum DealRole {\n  CHAMPION\n  DECISION_MAKER\n  INFLUENCER\n  BLOCKER\n  USER\n}\n\nenum InteractionOutcome {\n  POSITIVE\n  NEUTRAL\n  NEGATIVE\n}\n",
          examples: [],
          initialValue:
            '{"name":null,"kind":null,"organisationId":null,"owner":null,"status":"TO_CONTACT","parkedFrom":null,"statusReason":null,"closedAt":null,"source":null,"sourceDetail":null,"expectedCloseDate":null,"angles":[],"messages":[],"nextSteps":[],"interactions":[],"contactLinks":[],"references":[],"confidentialItems":[]}',
        },
      },
      modules: [
        {
          id: "d436c6a6-7791-4d88-9557-f8ecda0311fe",
          name: "details",
          description:
            "Who the lead is with, what kind of relationship it is and who owns it",
          operations: [
            {
              id: "638064da-f6f8-4f7a-97bd-58cf9566c02d",
              name: "SET_LEAD_DETAILS",
              description:
                "Set the lead's name, kind and organisation; a field left out is unchanged",
              schema:
                "input SetLeadDetailsInput {\n  name: String\n  kind: LeadKind\n  organisationId: PHID\n}",
              template:
                "Set the lead's name, kind and organisation; a field left out is unchanged",
              reducer:
                'const { name, kind, organisationId } = action.input;\nif (organisationId === null && state.status !== "TO_CONTACT")\n  throw new OrganisationRequiredError(\n    "A lead past to contact needs an organisation",\n  );\nconst reached = state.status === "PARKED" ? state.parkedFrom : state.status;\nif (kind === "INVESTOR" && (reached === "PROPOSAL" || reached === "WON"))\n  throw new InvestorLeadLimitError(\n    "An investor lead goes no further than met",\n  );\nif (name !== undefined) state.name = name;\nif (kind !== undefined) state.kind = kind;\nif (organisationId !== undefined) state.organisationId = organisationId;',
              errors: [
                {
                  id: "2a3887c9-0b40-438d-a6e0-668ca634eb32",
                  name: "OrganisationRequiredError",
                  code: "ORGANISATION_REQUIRED",
                  description: "A lead past to contact needs an organisation",
                  template: "",
                },
                {
                  id: "92928371-c0df-42e6-9d8c-c47bf658e7ba",
                  name: "InvestorLeadLimitError",
                  code: "INVESTOR_LEAD_LIMIT",
                  description:
                    "An investor lead goes no further than met, so a lead at proposal or won cannot become one",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "8381f2bb-bbcf-423f-a7df-4bc972429f88",
              name: "SET_OWNER",
              description:
                "Set the team member who owns the lead, or clear the owner",
              schema: "input SetOwnerInput {\n  owner: EthereumAddress\n}",
              template:
                "Set the team member who owns the lead, or clear the owner",
              reducer:
                'const owner = action.input.owner ?? null;\nif (owner === null && state.status !== "TO_CONTACT")\n  throw new OwnerRequiredError("A lead past to contact needs an owner");\nstate.owner = owner;',
              errors: [
                {
                  id: "42261ec2-a89f-4af3-81f0-6b7851841e72",
                  name: "OwnerRequiredError",
                  code: "OWNER_REQUIRED",
                  description: "A lead past to contact needs an owner",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "0b64cf6e-4a44-4fc0-95be-ba5b7beeab27",
              name: "SET_LEAD_SOURCE",
              description:
                "Say where the lead came from: the channel, and the event, person or campaign; a field left out stays as it is",
              schema:
                "input SetLeadSourceInput {\n  source: LeadSource\n  sourceDetail: String\n}",
              template:
                "Say where the lead came from: the channel, and the event, person or campaign; a field left out stays as it is",
              reducer:
                "const { source, sourceDetail } = action.input;\nif (source !== undefined) state.source = source ?? null;\nif (sourceDetail !== undefined) state.sourceDetail = sourceDetail?.trim() || null;",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "ac8f46bd-f897-4a1d-9c01-bf818f654e62",
              name: "SET_EXPECTED_CLOSE",
              description:
                "Set the day we expect to close the lead; null clears it",
              schema:
                "input SetExpectedCloseInput {\n  expectedCloseDate: Date\n}",
              template:
                "Set the day we expect to close the lead; null clears it",
              reducer:
                "state.expectedCloseDate = action.input.expectedCloseDate ?? null;",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "24ca7cb4-a488-46db-a80f-e7d9b032a52f",
          name: "status",
          description:
            "How far the relationship has got: the open statuses, won, lost and parked",
          operations: [
            {
              id: "88d94f71-ee9c-404c-992b-e474739fa60a",
              name: "SET_LEAD_STATUS",
              description:
                "Move the lead between the open statuses by hand, or close it as won or lost",
              schema:
                "input SetLeadStatusInput {\n  status: LeadStatus!\n  reason: String\n  changedAt: DateTime!\n}",
              template:
                "Move the lead between the open statuses by hand, or close it as won or lost",
              reducer:
                'const { status, reason, changedAt } = action.input;\nif (state.status === "WON" || state.status === "LOST")\n  throw new LeadClosedError("A won or lost lead is final");\nif (state.status === "PARKED")\n  throw new LeadParkedError(\n    "A parked lead is unparked before its status changes",\n  );\nif (status === "PARKED")\n  throw new ParkLeadRequiredError(\n    "A lead is parked with PARK_LEAD, which takes the reason",\n  );\nif (status !== "TO_CONTACT" && state.owner === null)\n  throw new OwnerRequiredError("A lead past to contact needs an owner");\nif (status !== "TO_CONTACT" && state.organisationId === null)\n  throw new OrganisationRequiredError(\n    "A lead past to contact needs an organisation",\n  );\nif (\n  state.kind === "INVESTOR" &&\n  (status === "PROPOSAL" || status === "WON")\n)\n  throw new InvestorLeadLimitError(\n    "An investor lead goes no further than met",\n  );\nlet statusReason: string | null = null;\nif (status === "LOST") {\n  if (reason == null || reason.trim() === "")\n    throw new LostReasonRequiredError("A lost lead needs a reason");\n  statusReason = reason;\n}\nstate.status = status;\nstate.statusReason = statusReason;\nif (status === "WON" || status === "LOST") state.closedAt = changedAt;',
              errors: [
                {
                  id: "0fdccfdb-da27-4edc-b9b5-0033c20eeb9a",
                  name: "LeadClosedError",
                  code: "LEAD_CLOSED",
                  description: "A won or lost lead is final",
                  template: "",
                },
                {
                  id: "9d5ad7c7-ef61-472a-8f35-8591c181208f",
                  name: "LeadParkedError",
                  code: "LEAD_PARKED",
                  description:
                    "A parked lead is unparked before its status changes",
                  template: "",
                },
                {
                  id: "e27dbdf5-0a23-4f1a-8fb0-16b022cbba6f",
                  name: "ParkLeadRequiredError",
                  code: "PARK_LEAD_REQUIRED",
                  description:
                    "Parked is reached only through PARK_LEAD, which takes the reason",
                  template: "",
                },
                {
                  id: "ac6eeef3-b3cb-48bb-b4d9-5cfadbdfaec9",
                  name: "OwnerRequiredError",
                  code: "OWNER_REQUIRED",
                  description: "A lead past to contact needs an owner",
                  template: "",
                },
                {
                  id: "d9e662b2-5867-44c1-bb5f-b66b5f6a0534",
                  name: "OrganisationRequiredError",
                  code: "ORGANISATION_REQUIRED",
                  description: "A lead past to contact needs an organisation",
                  template: "",
                },
                {
                  id: "4f7200d4-1d74-449c-887d-7d50b78bf7e0",
                  name: "InvestorLeadLimitError",
                  code: "INVESTOR_LEAD_LIMIT",
                  description: "An investor lead goes no further than met",
                  template: "",
                },
                {
                  id: "d41acc44-72fb-4bec-b2b9-e88a6f2f460a",
                  name: "LostReasonRequiredError",
                  code: "LOST_REASON_REQUIRED",
                  description: "A lost lead needs a reason",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "d7768ad9-d0e7-4277-9614-d41c070dda5f",
              name: "PARK_LEAD",
              description:
                "Park an open lead with a reason, keeping the status it was at",
              schema:
                "input ParkLeadInput {\n  reason: String!\n  parkedAt: DateTime!\n}",
              template:
                "Park an open lead with a reason, keeping the status it was at",
              reducer:
                'const { reason } = action.input;\nif (state.status === "WON" || state.status === "LOST")\n  throw new LeadClosedError("A won or lost lead is final");\nif (state.status === "PARKED")\n  throw new LeadAlreadyParkedError("The lead is already parked");\nif (state.owner === null)\n  throw new OwnerRequiredError("A lead past to contact needs an owner");\nif (state.organisationId === null)\n  throw new OrganisationRequiredError(\n    "A lead past to contact needs an organisation",\n  );\nif (reason.trim() === "")\n  throw new ParkReasonRequiredError("Parking a lead needs a reason");\nstate.parkedFrom = state.status;\nstate.status = "PARKED";\nstate.statusReason = reason;',
              errors: [
                {
                  id: "dbd3c4a5-3467-40e1-b2a7-9cd563cdbbb6",
                  name: "LeadClosedError",
                  code: "LEAD_CLOSED",
                  description: "A won or lost lead is final",
                  template: "",
                },
                {
                  id: "2bb499f7-d6c9-4c99-84af-550f569b25a4",
                  name: "LeadAlreadyParkedError",
                  code: "LEAD_ALREADY_PARKED",
                  description: "The lead is already parked",
                  template: "",
                },
                {
                  id: "138bb735-f186-445e-a025-84a47231efb8",
                  name: "OwnerRequiredError",
                  code: "OWNER_REQUIRED",
                  description: "A lead past to contact needs an owner",
                  template: "",
                },
                {
                  id: "d2045b6c-d006-40c7-8a91-c54cbc028a8c",
                  name: "OrganisationRequiredError",
                  code: "ORGANISATION_REQUIRED",
                  description: "A lead past to contact needs an organisation",
                  template: "",
                },
                {
                  id: "73db4529-e3c2-43d5-9240-2e93fccd3b8d",
                  name: "ParkReasonRequiredError",
                  code: "PARK_REASON_REQUIRED",
                  description: "Parking a lead needs a reason",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "ba075a1b-e8ce-4d25-bc71-028c639d1431",
              name: "UNPARK_LEAD",
              description:
                "Return a parked lead to the status it was parked from",
              schema: "input UnparkLeadInput {\n  _empty: Boolean\n}",
              template: "Return a parked lead to the status it was parked from",
              reducer:
                'const from = state.parkedFrom;\nif (state.status !== "PARKED" || from == null)\n  throw new LeadNotParkedError("Only a parked lead can be unparked");\nstate.status = from;\nstate.parkedFrom = null;\nstate.statusReason = null;',
              errors: [
                {
                  id: "2fcaa7c8-8f15-475b-a805-6f00b6bc7543",
                  name: "LeadNotParkedError",
                  code: "LEAD_NOT_PARKED",
                  description: "Only a parked lead can be unparked",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "a62cfc2f-0f49-4c10-8db3-3dc0a1c5704e",
          name: "angles",
          description:
            "The angles we could take with the lead, each with our fit",
          operations: [
            {
              id: "2e117f7d-4c6e-4568-aab3-cb2a6d07d91f",
              name: "ADD_ANGLE",
              description:
                "Add an angle with our fit and, when it uses one, the playbook positioning",
              schema:
                "input AddAngleInput {\n  id: OID!\n  summary: String!\n  fit: Fit!\n  positioningId: OID\n}",
              template:
                "Add an angle with our fit and, when it uses one, the playbook positioning",
              reducer:
                "const { id, summary, fit, positioningId } = action.input;\nif (state.angles.some((angle) => angle.id === id))\n  throw new DuplicateAngleIdError(`Angle ${id} already exists`);\nstate.angles.push({\n  id,\n  summary,\n  fit,\n  positioningId: positioningId ?? null,\n});",
              errors: [
                {
                  id: "5f7bd676-ef8b-499d-af3f-538bfc64d352",
                  name: "DuplicateAngleIdError",
                  code: "DUPLICATE_ANGLE_ID",
                  description: "An angle with this id already exists",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "836ad85f-44e1-4558-947c-62cd46104a33",
              name: "UPDATE_ANGLE",
              description: "Change an angle's summary, fit or positioning",
              schema:
                "input UpdateAngleInput {\n  id: OID!\n  summary: String\n  fit: Fit\n  positioningId: OID\n}",
              template: "Change an angle's summary, fit or positioning",
              reducer:
                "const { id, summary, fit, positioningId } = action.input;\nconst angle = state.angles.find((a) => a.id === id);\nif (!angle) throw new AngleNotFoundError(`Angle ${id} not found`);\nif (summary != null) angle.summary = summary;\nif (fit != null) angle.fit = fit;\nif (positioningId !== undefined) angle.positioningId = positioningId;",
              errors: [
                {
                  id: "2fd57922-df29-4db4-b97f-22b850860387",
                  name: "AngleNotFoundError",
                  code: "ANGLE_NOT_FOUND",
                  description: "No angle has this id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "b86078e5-b0e2-44d2-bcc8-e73cd8646ca4",
              name: "REMOVE_ANGLE",
              description:
                "Remove an angle, and take it off the messages that use it",
              schema: "input RemoveAngleInput {\n  id: OID!\n}",
              template:
                "Remove an angle, and take it off the messages that use it",
              reducer:
                "const { id } = action.input;\nif (!state.angles.some((angle) => angle.id === id))\n  throw new AngleNotFoundError(`Angle ${id} not found`);\nstate.angles = state.angles.filter((angle) => angle.id !== id);\nfor (const message of state.messages)\n  if (message.angleId === id) message.angleId = null;",
              errors: [
                {
                  id: "7ccd5b20-0cec-4604-83a1-58ea0278be07",
                  name: "AngleNotFoundError",
                  code: "ANGLE_NOT_FOUND",
                  description: "No angle has this id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "196b888e-40a5-4dad-aa0e-4b143dec0ea1",
          name: "messages",
          description:
            "Outreach messages: drafted, approved by a person, sent by a person",
          operations: [
            {
              id: "ad8b2fe5-0a03-4d5f-90e5-f77faeba6c64",
              name: "DRAFT_MESSAGE",
              description: "Draft an outreach message on the lead",
              schema:
                "input DraftMessageInput {\n  id: OID!\n  channel: MessageChannel!\n  recipient: DraftMessageRecipientInput\n  subject: String\n  body: String!\n  angleId: OID\n  draftedBy: EthereumAddress!\n  draftedAt: DateTime!\n}\n\ninput DraftMessageRecipientInput {\n  contactId: PHID!\n  personId: OID!\n}",
              template: "Draft an outreach message on the lead",
              reducer:
                'const {\n  id,\n  channel,\n  recipient,\n  subject,\n  body,\n  angleId,\n  draftedBy,\n  draftedAt,\n} = action.input;\nif (state.messages.some((message) => message.id === id))\n  throw new DuplicateMessageIdError(`Message ${id} already exists`);\nif (angleId != null && !state.angles.some((angle) => angle.id === angleId))\n  throw new AngleNotFoundError(`Angle ${angleId} not found`);\nstate.messages.push({\n  id,\n  channel,\n  recipient: recipient\n    ? { contactId: recipient.contactId, personId: recipient.personId }\n    : null,\n  subject: subject ?? null,\n  body,\n  angleId: angleId ?? null,\n  status: "DRAFT",\n  draftedBy,\n  draftedAt,\n  approvedBy: null,\n  approvedAt: null,\n  sentBy: null,\n  sentAt: null,\n});',
              errors: [
                {
                  id: "63cef100-b592-433f-8efe-3cebae41a10e",
                  name: "DuplicateMessageIdError",
                  code: "DUPLICATE_MESSAGE_ID",
                  description: "A message with this id already exists",
                  template: "",
                },
                {
                  id: "c44e12f8-de32-4cc0-a127-99b5a6dba538",
                  name: "AngleNotFoundError",
                  code: "ANGLE_NOT_FOUND",
                  description:
                    "The angle a message uses must be one of this lead's angles",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "4fc7046a-f464-4f6b-ab1d-8dbd35fe05e8",
              name: "UPDATE_MESSAGE",
              description:
                "Edit a draft's channel, recipient, subject, body or angle",
              schema:
                "input UpdateMessageInput {\n  id: OID!\n  channel: MessageChannel\n  recipient: UpdateMessageRecipientInput\n  subject: String\n  body: String\n  angleId: OID\n}\n\ninput UpdateMessageRecipientInput {\n  contactId: PHID!\n  personId: OID!\n}",
              template:
                "Edit a draft's channel, recipient, subject, body or angle",
              reducer:
                'const { id, channel, recipient, subject, body, angleId } = action.input;\nconst message = state.messages.find((m) => m.id === id);\nif (!message) throw new MessageNotFoundError(`Message ${id} not found`);\nif (message.status !== "DRAFT")\n  throw new MessageNotDraftError("Only a draft can be updated or approved");\nif (angleId != null && !state.angles.some((angle) => angle.id === angleId))\n  throw new AngleNotFoundError(`Angle ${angleId} not found`);\nif (channel != null) message.channel = channel;\nif (recipient !== undefined)\n  message.recipient = recipient\n    ? { contactId: recipient.contactId, personId: recipient.personId }\n    : null;\nif (subject !== undefined) message.subject = subject;\nif (body != null) message.body = body;\nif (angleId !== undefined) message.angleId = angleId;',
              errors: [
                {
                  id: "16dbb1ad-4229-412d-943e-cd30d9856aef",
                  name: "MessageNotFoundError",
                  code: "MESSAGE_NOT_FOUND",
                  description: "No message has this id",
                  template: "",
                },
                {
                  id: "90cfe4e9-f7db-4ada-8f81-387fb58f6afc",
                  name: "MessageNotDraftError",
                  code: "MESSAGE_NOT_DRAFT",
                  description: "Only a draft can be updated or approved",
                  template: "",
                },
                {
                  id: "5bcb098d-3257-448c-b219-2e68e1bc5ad8",
                  name: "AngleNotFoundError",
                  code: "ANGLE_NOT_FOUND",
                  description:
                    "The angle a message uses must be one of this lead's angles",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "c40db1f1-91f9-419a-84a3-1de5ede776b2",
              name: "APPROVE_MESSAGE",
              description:
                "Approve a draft for sending; only a person may do this",
              schema:
                "input ApproveMessageInput {\n  id: OID!\n  approvedBy: EthereumAddress!\n  approvedAt: DateTime!\n}",
              template:
                "Approve a draft for sending; only a person may do this",
              reducer:
                'const { id, approvedBy, approvedAt } = action.input;\nconst message = state.messages.find((m) => m.id === id);\nif (!message) throw new MessageNotFoundError(`Message ${id} not found`);\nif (message.status !== "DRAFT")\n  throw new MessageNotDraftError("Only a draft can be updated or approved");\nmessage.status = "APPROVED";\nmessage.approvedBy = approvedBy;\nmessage.approvedAt = approvedAt;',
              errors: [
                {
                  id: "33edade5-67aa-477a-9b8c-913f606131e9",
                  name: "MessageNotFoundError",
                  code: "MESSAGE_NOT_FOUND",
                  description: "No message has this id",
                  template: "",
                },
                {
                  id: "7c0a189d-219c-4df1-b4f2-b1d0d8156d5a",
                  name: "MessageNotDraftError",
                  code: "MESSAGE_NOT_DRAFT",
                  description: "Only a draft can be updated or approved",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "5f117ae8-f222-47cf-8390-62f9a41e7c2c",
              name: "REOPEN_MESSAGE",
              description:
                "Return an approved message to draft and clear its approval",
              schema: "input ReopenMessageInput {\n  id: OID!\n}",
              template:
                "Return an approved message to draft and clear its approval",
              reducer:
                'const { id } = action.input;\nconst message = state.messages.find((m) => m.id === id);\nif (!message) throw new MessageNotFoundError(`Message ${id} not found`);\nif (message.status !== "APPROVED")\n  throw new MessageNotApprovedError(\n    "Only an approved message can be reopened or marked sent",\n  );\nmessage.status = "DRAFT";\nmessage.approvedBy = null;\nmessage.approvedAt = null;',
              errors: [
                {
                  id: "4e820491-40fe-4916-8d8c-4c9a0849467c",
                  name: "MessageNotFoundError",
                  code: "MESSAGE_NOT_FOUND",
                  description: "No message has this id",
                  template: "",
                },
                {
                  id: "4d1388f5-0f7a-4ba1-b652-bae787c4d6d0",
                  name: "MessageNotApprovedError",
                  code: "MESSAGE_NOT_APPROVED",
                  description:
                    "Only an approved message can be reopened or marked sent",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "36074e13-5575-4613-ba29-88186f465fca",
              name: "MARK_MESSAGE_SENT",
              description:
                "Record that a person sent an approved message; only a person may do this",
              schema:
                "input MarkMessageSentInput {\n  id: OID!\n  sentBy: EthereumAddress!\n  sentAt: DateTime!\n}",
              template:
                "Record that a person sent an approved message; only a person may do this",
              reducer:
                'const { id, sentBy, sentAt } = action.input;\nconst message = state.messages.find((m) => m.id === id);\nif (!message) throw new MessageNotFoundError(`Message ${id} not found`);\nif (message.status !== "APPROVED")\n  throw new MessageNotApprovedError(\n    "Only an approved message can be reopened or marked sent",\n  );\nmessage.status = "SENT";\nmessage.sentBy = sentBy;\nmessage.sentAt = sentAt;',
              errors: [
                {
                  id: "70954de1-998c-4bb9-b7e2-02600a178ce1",
                  name: "MessageNotFoundError",
                  code: "MESSAGE_NOT_FOUND",
                  description: "No message has this id",
                  template: "",
                },
                {
                  id: "8765c314-1bf1-4207-84f9-2e2b3ce946c4",
                  name: "MessageNotApprovedError",
                  code: "MESSAGE_NOT_APPROVED",
                  description:
                    "Only an approved message can be reopened or marked sent",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "f62e2690-1a8a-4a61-818b-92bdb10aa11c",
              name: "DISCARD_MESSAGE",
              description:
                "Discard a draft or an approved message that will not be sent",
              schema: "input DiscardMessageInput {\n  id: OID!\n}",
              template:
                "Discard a draft or an approved message that will not be sent",
              reducer:
                'const { id } = action.input;\nconst message = state.messages.find((m) => m.id === id);\nif (!message) throw new MessageNotFoundError(`Message ${id} not found`);\nif (message.status === "SENT" || message.status === "DISCARDED")\n  throw new MessageFinalError("A sent or discarded message is final");\nmessage.status = "DISCARDED";',
              errors: [
                {
                  id: "01b463c1-1e00-4cfa-afdf-7151203c1016",
                  name: "MessageNotFoundError",
                  code: "MESSAGE_NOT_FOUND",
                  description: "No message has this id",
                  template: "",
                },
                {
                  id: "02b2fbb0-11cb-4691-8f2d-314e5026400a",
                  name: "MessageFinalError",
                  code: "MESSAGE_FINAL",
                  description: "A sent or discarded message is final",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "25e6554d-7192-4f48-bc31-ff0ce51c8cfb",
          name: "relationship",
          description:
            "The parts every relationship carries: next steps, interactions, contact links, references and confidential items",
          operations: [
            {
              id: "3c5fbcd5-00d6-4934-adeb-5087f7e36226",
              name: "ADD_NEXT_STEP",
              description: "Add a next step, open until it is done",
              schema:
                "input AddNextStepInput {\n  id: OID!\n  text: String!\n  owner: EthereumAddress\n  dueDate: Date\n}",
              template: "Add a next step, open until it is completed",
              reducer:
                "const { id, text, owner, dueDate } = action.input;\nif (state.nextSteps.some((step) => step.id === id))\n  throw new DuplicateNextStepIdError(`NextStep ${id} already exists`);\nstate.nextSteps.push({\n  id,\n  text,\n  owner: owner ?? null,\n  dueDate: dueDate ?? null,\n  doneAt: null,\n});",
              errors: [
                {
                  id: "d45424b2-d64c-4f6f-a2ae-a717cf04be2e",
                  name: "DuplicateNextStepIdError",
                  code: "DUPLICATE_NEXT_STEP_ID",
                  description: "A next step with this id already exists",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "7259383d-b51e-44f9-b02a-feb83ad14977",
              name: "UPDATE_NEXT_STEP",
              description:
                "Change a next step's text, owner or due date; a field left out is unchanged",
              schema:
                "input UpdateNextStepInput {\n  id: OID!\n  text: String\n  owner: EthereumAddress\n  dueDate: Date\n}",
              template:
                "Change a next step's text, owner or due date; a field left out is unchanged",
              reducer:
                "const { id, text, owner, dueDate } = action.input;\nconst step = state.nextSteps.find((s) => s.id === id);\nif (!step) throw new NextStepNotFoundError(`NextStep ${id} not found`);\nif (text != null) step.text = text;\nif (owner !== undefined) step.owner = owner;\nif (dueDate !== undefined) step.dueDate = dueDate;",
              errors: [
                {
                  id: "2ccd177f-61e1-4725-9b82-ce0b214391c8",
                  name: "NextStepNotFoundError",
                  code: "NEXT_STEP_NOT_FOUND",
                  description: "No next step has this id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "837d2ff1-4d7d-46c3-b93f-6e0906e7e505",
              name: "COMPLETE_NEXT_STEP",
              description: "Mark a next step done",
              schema:
                "input CompleteNextStepInput {\n  id: OID!\n  doneAt: DateTime!\n}",
              template: "Mark a next step done",
              reducer:
                "const { id, doneAt } = action.input;\nconst step = state.nextSteps.find((s) => s.id === id);\nif (!step) throw new NextStepNotFoundError(`NextStep ${id} not found`);\nif (step.doneAt !== null)\n  throw new NextStepAlreadyDoneError(`NextStep ${id} is already done`);\nstep.doneAt = doneAt;",
              errors: [
                {
                  id: "76d99fdc-7b8f-430d-99d2-c3333ebccfac",
                  name: "NextStepNotFoundError",
                  code: "NEXT_STEP_NOT_FOUND",
                  description: "No next step has this id",
                  template: "",
                },
                {
                  id: "218fd63c-32a5-4d92-b1a8-fdec9307a705",
                  name: "NextStepAlreadyDoneError",
                  code: "NEXT_STEP_ALREADY_DONE",
                  description: "The next step is already done",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "8e34038d-0e2c-437f-acc7-5f9a9b13a08a",
              name: "REOPEN_NEXT_STEP",
              description: "Return a done next step to open",
              schema: "input ReopenNextStepInput {\n  id: OID!\n}",
              template: "Return a done next step to open",
              reducer:
                "const { id } = action.input;\nconst step = state.nextSteps.find((s) => s.id === id);\nif (!step) throw new NextStepNotFoundError(`NextStep ${id} not found`);\nif (step.doneAt === null)\n  throw new NextStepNotDoneError(`NextStep ${id} is not done`);\nstep.doneAt = null;",
              errors: [
                {
                  id: "28a236bb-b543-40b1-8ede-89702ef1700d",
                  name: "NextStepNotFoundError",
                  code: "NEXT_STEP_NOT_FOUND",
                  description: "No next step has this id",
                  template: "",
                },
                {
                  id: "4cc5455c-ed2d-46d1-9ea1-57b6c2adba65",
                  name: "NextStepNotDoneError",
                  code: "NEXT_STEP_NOT_DONE",
                  description: "The next step is not done",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "8d7c9a76-5590-405e-a7bf-8854683fc251",
              name: "REMOVE_NEXT_STEP",
              description: "Remove a next step",
              schema: "input RemoveNextStepInput {\n  id: OID!\n}",
              template: "Remove a next step",
              reducer:
                "const { id } = action.input;\nif (!state.nextSteps.some((step) => step.id === id))\n  throw new NextStepNotFoundError(`NextStep ${id} not found`);\nstate.nextSteps = state.nextSteps.filter((step) => step.id !== id);",
              errors: [
                {
                  id: "91d0ed5c-1a51-4aa2-a45f-15a8580e607f",
                  name: "NextStepNotFoundError",
                  code: "NEXT_STEP_NOT_FOUND",
                  description: "No next step has this id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "def6bbc1-c87e-40f0-86cb-248e6a269326",
              name: "ADD_INTERACTION",
              description:
                "Record an email, call, meeting, event or message, held or scheduled",
              schema:
                "input AddInteractionInput {\n  id: OID!\n  kind: InteractionKind!\n  status: InteractionStatus!\n  at: DateTime\n  timeZone: String\n  summary: String\n  people: [AddInteractionPersonInput!]\n  teamMembers: [EthereumAddress!]\n  notesSource: AddInteractionNotesSourceInput\n}\n\ninput AddInteractionPersonInput {\n  contactId: PHID!\n  personId: OID!\n}\n\ninput AddInteractionNotesSourceInput {\n  id: PHID!\n  title: String!\n}",
              template:
                "Record an email, call, meeting, event or message, held or scheduled",
              reducer:
                "const { id, kind, status, summary, people, teamMembers, notesSource } =\n  action.input;\nconst at = action.input.at ?? null;\nconst timeZone = action.input.timeZone ?? null;\nif (state.interactions.some((interaction) => interaction.id === id))\n  throw new DuplicateInteractionIdError(`Interaction ${id} already exists`);\ncheckWhen(kind, status, at, timeZone);\nstate.interactions.push({\n  id,\n  kind,\n  status,\n  at,\n  timeZone,\n  summary: summary ?? null,\n  people: (people ?? []).map((p) => ({\n    contactId: p.contactId,\n    personId: p.personId,\n  })),\n  teamMembers: teamMembers ?? [],\n  notesSource: notesSource\n    ? { id: notesSource.id, title: notesSource.title }\n    : null,\n  outcome: null,\n});",
              errors: [
                {
                  id: "e52bb10d-942a-4ae1-89cc-4149162756d1",
                  name: "DuplicateInteractionIdError",
                  code: "DUPLICATE_INTERACTION_ID",
                  description: "An interaction with this id already exists",
                  template: "",
                },
                {
                  id: "e6894ad4-19ea-4b88-822b-465722abb46b",
                  name: "MeetingNeedsTimeError",
                  code: "MEETING_NEEDS_TIME",
                  description:
                    "A scheduled or held meeting needs an instant and a time zone",
                  template: "",
                },
                {
                  id: "fe09f782-2824-4667-be2c-710554beddc1",
                  name: "InvalidTimeZoneError",
                  code: "INVALID_TIME_ZONE",
                  description: "The time zone is not a well-formed IANA name",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "42210622-0aa6-4483-b64c-38a0a4eade49",
              name: "UPDATE_INTERACTION",
              description:
                "Change an interaction; a field left out is unchanged",
              schema:
                "input UpdateInteractionInput {\n  id: OID!\n  kind: InteractionKind\n  status: InteractionStatus\n  at: DateTime\n  timeZone: String\n  summary: String\n  people: [UpdateInteractionPersonInput!]\n  teamMembers: [EthereumAddress!]\n  notesSource: UpdateInteractionNotesSourceInput\n}\n\ninput UpdateInteractionPersonInput {\n  contactId: PHID!\n  personId: OID!\n}\n\ninput UpdateInteractionNotesSourceInput {\n  id: PHID!\n  title: String!\n}",
              template: "Change an interaction; a field left out is unchanged",
              reducer:
                "const {\n  id,\n  kind,\n  status,\n  at,\n  timeZone,\n  summary,\n  people,\n  teamMembers,\n  notesSource,\n} = action.input;\nconst interaction = state.interactions.find((i) => i.id === id);\nif (!interaction)\n  throw new InteractionNotFoundError(`Interaction ${id} not found`);\nconst nextAt = at === undefined ? interaction.at : at;\nconst nextZone = timeZone === undefined ? interaction.timeZone : timeZone;\ncheckWhen(\n  kind ?? interaction.kind,\n  status ?? interaction.status,\n  nextAt ?? null,\n  nextZone ?? null,\n);\nif (kind != null) interaction.kind = kind;\nif (status != null) interaction.status = status;\ninteraction.at = nextAt ?? null;\ninteraction.timeZone = nextZone ?? null;\nif (summary !== undefined) interaction.summary = summary;\nif (people != null)\n  interaction.people = people.map((p) => ({\n    contactId: p.contactId,\n    personId: p.personId,\n  }));\nif (teamMembers != null) interaction.teamMembers = teamMembers;\nif (notesSource !== undefined)\n  interaction.notesSource = notesSource\n    ? { id: notesSource.id, title: notesSource.title }\n    : null;",
              errors: [
                {
                  id: "89250c9e-56aa-4508-a656-c245c578205e",
                  name: "InteractionNotFoundError",
                  code: "INTERACTION_NOT_FOUND",
                  description: "No interaction has this id",
                  template: "",
                },
                {
                  id: "3fbdc1be-c18c-4cdd-b5fa-1c445b5e1355",
                  name: "MeetingNeedsTimeError",
                  code: "MEETING_NEEDS_TIME",
                  description:
                    "A scheduled or held meeting needs an instant and a time zone",
                  template: "",
                },
                {
                  id: "a4b3900a-4e35-4d82-b879-a4ef6ffdf76b",
                  name: "InvalidTimeZoneError",
                  code: "INVALID_TIME_ZONE",
                  description: "The time zone is not a well-formed IANA name",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "db5c11eb-cd2e-4127-9dd2-075cbdf66248",
              name: "REMOVE_INTERACTION",
              description: "Remove an interaction",
              schema: "input RemoveInteractionInput {\n  id: OID!\n}",
              template: "Remove an interaction",
              reducer:
                "const { id } = action.input;\nif (!state.interactions.some((interaction) => interaction.id === id))\n  throw new InteractionNotFoundError(`Interaction ${id} not found`);\nstate.interactions = state.interactions.filter(\n  (interaction) => interaction.id !== id,\n);",
              errors: [
                {
                  id: "8185f1d5-c26c-4a99-9602-37d465bfa1f2",
                  name: "InteractionNotFoundError",
                  code: "INTERACTION_NOT_FOUND",
                  description: "No interaction has this id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "a7bc34d7-bc35-4332-a964-2fbe585741bc",
              name: "LINK_CONTACT",
              description:
                "Link a contact, or one person at it, to the relationship with a role",
              schema:
                "input LinkContactInput {\n  id: OID!\n  contactId: PHID!\n  personId: OID\n  role: String\n}",
              template:
                "Link a contact, or one person at it, to the relationship with a role",
              reducer:
                "const { id, contactId, personId, role } = action.input;\nif (state.contactLinks.some((link) => link.id === id))\n  throw new DuplicateContactLinkIdError(`ContactLink ${id} already exists`);\nstate.contactLinks.push({\n  id,\n  contactId,\n  personId: personId ?? null,\n  role: role ?? null,\n  dealRole: null,\n});",
              errors: [
                {
                  id: "deaddb11-d53a-4efb-af66-f916e13b9d8d",
                  name: "DuplicateContactLinkIdError",
                  code: "DUPLICATE_CONTACT_LINK_ID",
                  description: "A contact link with this id already exists",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "08262389-4b40-4ea6-b86e-18e0ba899447",
              name: "UNLINK_CONTACT",
              description: "Remove a contact link",
              schema: "input UnlinkContactInput {\n  id: OID!\n}",
              template: "Remove a contact link",
              reducer:
                "const { id } = action.input;\nif (!state.contactLinks.some((link) => link.id === id))\n  throw new ContactLinkNotFoundError(`ContactLink ${id} not found`);\nstate.contactLinks = state.contactLinks.filter((link) => link.id !== id);",
              errors: [
                {
                  id: "ba57460b-13ce-450b-bae9-4aa5c2c09e54",
                  name: "ContactLinkNotFoundError",
                  code: "CONTACT_LINK_NOT_FOUND",
                  description: "No contact link has this id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "4b190dca-8313-4054-82d2-5ed55c00291d",
              name: "ADD_REFERENCE",
              description:
                "Reference a vault note, source, comparable or another BD document",
              schema:
                "input AddReferenceInput {\n  id: OID!\n  kind: ReferenceKind!\n  documentId: PHID!\n  title: String!\n}",
              template:
                "Reference a vault note, source, comparable or another BD document",
              reducer:
                'const { id, kind, documentId, title } = action.input;\nif (state.references.some((reference) => reference.id === id))\n  throw new DuplicateReferenceIdError(`Reference ${id} already exists`);\n{\n  const existing = state.references.find(\n    (reference) =>\n      reference.documentId === documentId && reference.kind === kind,\n  );\n  if (existing)\n    throw new DuplicateReferenceError(\n      `"${existing.title}" is already linked.`,\n    );\n}\nstate.references.push({ id, kind, documentId, title });',
              errors: [
                {
                  id: "6587d96b-d1f3-4eb0-925f-dabb4974c9d0",
                  name: "DuplicateReferenceIdError",
                  code: "DUPLICATE_REFERENCE_ID",
                  description: "A reference with this id already exists",
                  template: "",
                },
                {
                  id: "a4f5ffbd-602b-4408-8711-93c8616e30b7",
                  name: "DuplicateReferenceError",
                  code: "DUPLICATE_REFERENCE",
                  description:
                    "The same document is already referenced with the same kind",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "11623415-e8e0-463c-80e0-e19fd8e9686f",
              name: "REMOVE_REFERENCE",
              description: "Remove a reference",
              schema: "input RemoveReferenceInput {\n  id: OID!\n}",
              template: "Remove a reference",
              reducer:
                "const { id } = action.input;\nif (!state.references.some((reference) => reference.id === id))\n  throw new ReferenceNotFoundError(`Reference ${id} not found`);\nstate.references = state.references.filter(\n  (reference) => reference.id !== id,\n);",
              errors: [
                {
                  id: "1eb5279f-3b1f-46cc-ad61-2bcf5c15abe3",
                  name: "ReferenceNotFoundError",
                  code: "REFERENCE_NOT_FOUND",
                  description: "No reference has this id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "8e2c9b34-be49-4321-9b80-0c3ff989e795",
              name: "ADD_CONFIDENTIAL_ITEM",
              description:
                "Record a confidential note, optionally about one contact",
              schema:
                "input AddConfidentialItemInput {\n  id: OID!\n  subjectContactId: PHID\n  text: String!\n  addedBy: EthereumAddress!\n  addedAt: DateTime!\n}",
              template:
                "Record a confidential note, optionally about one contact",
              reducer:
                "const { id, subjectContactId, text, addedBy, addedAt } = action.input;\nif (state.confidentialItems.some((item) => item.id === id))\n  throw new DuplicateConfidentialItemIdError(\n    `ConfidentialItem ${id} already exists`,\n  );\nstate.confidentialItems.push({\n  id,\n  subjectContactId: subjectContactId ?? null,\n  text,\n  addedBy,\n  addedAt,\n});",
              errors: [
                {
                  id: "72ecbabb-1dcf-4a46-bab3-f10dee73cfb4",
                  name: "DuplicateConfidentialItemIdError",
                  code: "DUPLICATE_CONFIDENTIAL_ITEM_ID",
                  description:
                    "A confidential item with this id already exists",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "baef10a9-395d-464e-b2b2-c50c7e6f957e",
              name: "REMOVE_CONFIDENTIAL_ITEM",
              description: "Remove a confidential item",
              schema: "input RemoveConfidentialItemInput {\n  id: OID!\n}",
              template: "Remove a confidential item",
              reducer:
                "const { id } = action.input;\nif (!state.confidentialItems.some((item) => item.id === id))\n  throw new ConfidentialItemNotFoundError(\n    `ConfidentialItem ${id} not found`,\n  );\nstate.confidentialItems = state.confidentialItems.filter(\n  (item) => item.id !== id,\n);",
              errors: [
                {
                  id: "6fe369d6-53b5-4a4d-9e63-2f4014cdd17d",
                  name: "ConfidentialItemNotFoundError",
                  code: "CONFIDENTIAL_ITEM_NOT_FOUND",
                  description: "No confidential item has this id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "9c97f5da-4ff8-497c-bdf3-d98319ec3df2",
              name: "SET_CONTACT_LINK_DEAL_ROLE",
              description:
                "Say what role a linked person plays in the deal; null clears it",
              schema:
                "input SetContactLinkDealRoleInput {\n  id: OID!\n  dealRole: DealRole\n}",
              template:
                "Say what role a linked person plays in the deal; null clears it",
              reducer:
                "const link = state.contactLinks.find((l) => l.id === action.input.id);\nif (!link)\n  throw new ContactLinkNotFoundError(`ContactLink ${action.input.id} not found`);\nlink.dealRole = action.input.dealRole ?? null;",
              errors: [
                {
                  id: "925f3e73-2599-48d5-a3bc-f10291a9db75",
                  name: "ContactLinkNotFoundError",
                  code: "CONTACT_LINK_NOT_FOUND",
                  description: "No contact link has this id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "cf9923d3-e1d8-42dc-9546-35dbbe7d9c0a",
              name: "SET_INTERACTION_OUTCOME",
              description: "Say how a held interaction went; null clears it",
              schema:
                "input SetInteractionOutcomeInput {\n  id: OID!\n  outcome: InteractionOutcome\n}",
              template: "Say how a held interaction went; null clears it",
              reducer:
                'const interaction = state.interactions.find((i) => i.id === action.input.id);\nif (!interaction)\n  throw new InteractionNotFoundError(`Interaction ${action.input.id} not found`);\nif (action.input.outcome != null && interaction.status !== "HELD")\n  throw new InteractionNotHeldError("Only a held interaction has an outcome");\ninteraction.outcome = action.input.outcome ?? null;',
              errors: [
                {
                  id: "38317380-f18f-4c6e-a741-eab6af9498e9",
                  name: "InteractionNotFoundError",
                  code: "INTERACTION_NOT_FOUND",
                  description: "No interaction has this id",
                  template: "",
                },
                {
                  id: "1cefd75b-4116-42a4-a8eb-0c9536aa8453",
                  name: "InteractionNotHeldError",
                  code: "INTERACTION_NOT_HELD",
                  description: "The interaction has not been held",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
        },
      ],
      version: 1,
      changeLog: [],
    },
  ],
};
