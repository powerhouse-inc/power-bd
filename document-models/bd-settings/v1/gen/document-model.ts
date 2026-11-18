import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "powerbd/settings",
  name: "BD Settings",
  author: {
    name: "Powerhouse",
    website: "https://powerhouse.inc",
  },
  extension: "",
  description:
    "The settings of a BD drive: the team list, our time zone, the due window, the vault drive that links point at, and the retention period. One per drive; it marks the drive as a BD drive.",
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
            "type BdSettingsState {\n  teamMembers: [TeamMember!]!\n  timeZone: String\n  dueWindowDays: Int!\n  vaultDriveId: PHID\n  retentionMonths: Int!\n  targets: [Target!]!\n}\n\ntype TeamMember {\n  id: OID!\n  name: String!\n  address: EthereumAddress!\n  active: Boolean!\n  email: EmailAddress\n}\n\ntype Target {\n  id: OID!\n  quarter: String!\n  metric: TargetMetric!\n  value: Float!\n}\n\nenum TargetMetric {\n  MEETINGS_HELD\n  PROPOSALS_SENT\n  VALUE_PROPOSED\n  LEADS_WON\n}\n",
          examples: [],
          initialValue:
            '{"teamMembers":[],"timeZone":null,"dueWindowDays":14,"vaultDriveId":null,"retentionMonths":12,"targets":[]}',
        },
      },
      modules: [
        {
          id: "9dfcbbc3-5631-48d2-ad3c-5748a3cb6bef",
          name: "team",
          description: "The team list that every owner is picked from",
          operations: [
            {
              id: "f9ccf5b8-c2a3-4742-b730-43e030cd1eb8",
              name: "ADD_TEAM_MEMBER",
              description: "Add a person to the team list",
              schema:
                "input AddTeamMemberInput {\n  id: OID!\n  name: String!\n  address: EthereumAddress!\n  email: EmailAddress\n}",
              template: "Add a person to the team list",
              reducer:
                'const { id, name, address } = action.input;\nif (state.teamMembers.some((member) => member.id === id))\n  throw new DuplicateTeamMemberIdError(`Team member ${id} already exists`);\nif (\n  state.teamMembers.some(\n    (member) => member.address.toLowerCase() === address.toLowerCase(),\n  )\n)\n  throw new DuplicateTeamMemberAddressError(\n    `Another team member already has the address ${address}`,\n  );\nif (name.trim() === "")\n  throw new TeamMemberNameRequiredError("A team member needs a name");\nstate.teamMembers.push({\n  id: action.input.id,\n  name: action.input.name,\n  address: action.input.address,\n  active: true,\n  email: action.input.email ?? null,\n});',
              errors: [
                {
                  id: "11f16279-7321-42ca-b5fc-130e9c156930",
                  name: "DuplicateTeamMemberIdError",
                  code: "DUPLICATE_TEAM_MEMBER_ID",
                  description: "A team member with this id already exists",
                  template: "",
                },
                {
                  id: "8ca0e65d-5eb6-482f-b312-82a745c92e20",
                  name: "DuplicateTeamMemberAddressError",
                  code: "DUPLICATE_TEAM_MEMBER_ADDRESS",
                  description: "Another team member already has this address",
                  template: "",
                },
                {
                  id: "e647e994-a30c-4257-966a-24fdecd6cd70",
                  name: "TeamMemberNameRequiredError",
                  code: "TEAM_MEMBER_NAME_REQUIRED",
                  description: "A team member needs a name",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "64ce69b7-e2bb-4590-9606-8d12728dbc9e",
              name: "UPDATE_TEAM_MEMBER",
              description: "Change a team member's name or address",
              schema:
                "input UpdateTeamMemberInput {\n  id: OID!\n  name: String\n  address: EthereumAddress\n  email: EmailAddress\n}",
              template: "Change a team member's name or address",
              reducer:
                'const { id, name, address } = action.input;\nconst member = state.teamMembers.find((candidate) => candidate.id === id);\nif (!member)\n  throw new TeamMemberNotFoundError(`Team member ${id} not found`);\nif (\n  address != null &&\n  state.teamMembers.some(\n    (other) =>\n      other.id !== id &&\n      other.address.toLowerCase() === address.toLowerCase(),\n  )\n)\n  throw new DuplicateTeamMemberAddressError(\n    `Another team member already has the address ${address}`,\n  );\nif (name != null && name.trim() === "")\n  throw new TeamMemberNameRequiredError("A team member needs a name");\nif (name != null) member.name = name;\nif (address != null) member.address = address;\nif (action.input.email !== undefined) member.email = action.input.email ?? null;',
              errors: [
                {
                  id: "c71c4b90-765a-47df-8805-8ad15de6c119",
                  name: "TeamMemberNotFoundError",
                  code: "TEAM_MEMBER_NOT_FOUND",
                  description: "No team member has this id",
                  template: "",
                },
                {
                  id: "5adab550-c463-4083-988e-ab3c8913faed",
                  name: "DuplicateTeamMemberAddressError",
                  code: "DUPLICATE_TEAM_MEMBER_ADDRESS",
                  description: "Another team member already has this address",
                  template: "",
                },
                {
                  id: "04888a35-8463-4ccf-92b1-67ff0fdf96eb",
                  name: "TeamMemberNameRequiredError",
                  code: "TEAM_MEMBER_NAME_REQUIRED",
                  description: "A team member needs a name",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "edcee1b3-a732-4f73-af2f-10062ccf6894",
              name: "DEACTIVATE_TEAM_MEMBER",
              description:
                "Take a member out of the pickers; old records still resolve to the name",
              schema: "input DeactivateTeamMemberInput {\n  id: OID!\n}",
              template:
                "Take a member out of the pickers; old records still resolve to the name",
              reducer:
                "const member = state.teamMembers.find(\n  (candidate) => candidate.id === action.input.id,\n);\nif (!member)\n  throw new TeamMemberNotFoundError(\n    `Team member ${action.input.id} not found`,\n  );\nmember.active = false;",
              errors: [
                {
                  id: "e04db722-59fc-4f32-8a52-9fa68afe0184",
                  name: "TeamMemberNotFoundError",
                  code: "TEAM_MEMBER_NOT_FOUND",
                  description: "No team member has this id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "62623589-6e37-428f-a5a3-28d8c11d587f",
              name: "REACTIVATE_TEAM_MEMBER",
              description: "Bring a deactivated member back",
              schema: "input ReactivateTeamMemberInput {\n  id: OID!\n}",
              template: "Bring a deactivated member back",
              reducer:
                "const member = state.teamMembers.find(\n  (candidate) => candidate.id === action.input.id,\n);\nif (!member)\n  throw new TeamMemberNotFoundError(\n    `Team member ${action.input.id} not found`,\n  );\nmember.active = true;",
              errors: [
                {
                  id: "1edfead6-fad9-4fbf-adab-15a7515ed9ae",
                  name: "TeamMemberNotFoundError",
                  code: "TEAM_MEMBER_NOT_FOUND",
                  description: "No team member has this id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "e42908e8-68b1-4c32-b457-26d078904293",
          name: "preferences",
          description: "Time zone, due window, vault drive and retention",
          operations: [
            {
              id: "b54a293e-1d43-4813-9160-5348cba0edf9",
              name: "SET_TIME_ZONE",
              description: 'Set the time zone that "our time" means',
              schema: "input SetTimeZoneInput {\n  timeZone: String!\n}",
              template: 'Set the time zone that "our time" means',
              reducer:
                'const { timeZone } = action.input;\nif (!TIME_ZONE_NAME.test(timeZone))\n  throw new InvalidTimeZoneError(\n    `"${timeZone}" is not a time zone name such as Europe/Zurich`,\n  );\nstate.timeZone = timeZone;',
              errors: [
                {
                  id: "29d6339b-74f5-4193-adb8-4d6ef1defab6",
                  name: "InvalidTimeZoneError",
                  code: "INVALID_TIME_ZONE",
                  description:
                    "The time zone must be UTC or an IANA name of two or three parts",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "00d32865-df3e-4c8e-a5ba-1ebe79c15b8a",
              name: "SET_DUE_WINDOW",
              description: "Set how many days ahead count as due soon",
              schema: "input SetDueWindowInput {\n  days: Int!\n}",
              template: "Set how many days ahead count as due soon",
              reducer:
                'const { days } = action.input;\nif (days < 1 || days > 90)\n  throw new InvalidDueWindowError(\n    "The due window must be between 1 and 90 days",\n  );\nstate.dueWindowDays = days;',
              errors: [
                {
                  id: "c1d7be34-0033-44d3-a188-b12413371afb",
                  name: "InvalidDueWindowError",
                  code: "INVALID_DUE_WINDOW",
                  description: "The due window must be between 1 and 90 days",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "bc08f24d-2af1-44d7-8456-8d02852cd894",
              name: "SET_VAULT_DRIVE",
              description:
                "Set the vault drive that links to notes and sources point at",
              schema: "input SetVaultDriveInput {\n  driveId: PHID!\n}",
              template:
                "Set the vault drive that links to notes and sources point at",
              reducer:
                'const { driveId } = action.input;\nif (driveId.trim() === "")\n  throw new VaultDriveRequiredError("The vault drive needs an id");\nstate.vaultDriveId = driveId;',
              errors: [
                {
                  id: "05db03c9-5f6c-4716-8b7a-25f423a019e4",
                  name: "VaultDriveRequiredError",
                  code: "VAULT_DRIVE_REQUIRED",
                  description: "The vault drive needs an id",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "a8905b8c-53a6-4420-a114-e4d454b35832",
              name: "SET_RETENTION",
              description:
                "Set how many months personal data is kept after a relationship closes",
              schema: "input SetRetentionInput {\n  months: Int!\n}",
              template:
                "Set how many months personal data is kept after a relationship closes",
              reducer:
                'const { months } = action.input;\nif (months < 1)\n  throw new InvalidRetentionError(\n    "The retention period must be at least one month",\n  );\nstate.retentionMonths = months;',
              errors: [
                {
                  id: "4163b1e8-3e76-4fcf-883d-9416fe53fcc3",
                  name: "InvalidRetentionError",
                  code: "INVALID_RETENTION",
                  description:
                    "The retention period must be at least one month",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "9694b405-6756-477d-8cb1-1687ef389b7e",
              name: "SET_TARGET",
              description:
                "Set the target for one measure in one quarter; a target already set for both is changed, keeping its id",
              schema:
                "input SetTargetInput {\n  id: OID!\n  quarter: String!\n  metric: TargetMetric!\n  value: Float!\n}",
              template:
                "Set the target for one measure in one quarter; a target already set for both is changed, keeping its id",
              reducer:
                'const { id, quarter, metric, value } = action.input;\nif (!/^\\d{4}-Q[1-4]$/.test(quarter))\n  throw new InvalidQuarterError("A quarter is written like 2026-Q4");\nif (value < 0) throw new NegativeTargetError("A target can\'t be negative");\n// Settings saved before targets existed have no list yet.\nif (!(state.targets as typeof state.targets | undefined)) state.targets = [];\nconst existing = state.targets.find((t) => t.quarter === quarter && t.metric === metric);\nif (existing) existing.value = value;\nelse state.targets.push({ id, quarter, metric, value });',
              errors: [
                {
                  id: "1ad04674-2c05-4872-970a-5f2b7cdfbd75",
                  name: "InvalidQuarterError",
                  code: "INVALID_QUARTER",
                  description: "The quarter is not written like 2026-Q4",
                  template: "",
                },
                {
                  id: "07961c04-0ead-4f27-8e42-f5083d107442",
                  name: "NegativeTargetError",
                  code: "NEGATIVE_TARGET",
                  description: "The target is below zero",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "0715cf61-d51a-4f25-98c6-a5968197c2f3",
              name: "REMOVE_TARGET",
              description: "Remove a target",
              schema: "input RemoveTargetInput {\n  id: OID!\n}",
              template: "Remove a target",
              reducer:
                "// Settings saved before targets existed have no list yet.\nconst targets = (state.targets as typeof state.targets | undefined) ?? [];\nconst index = targets.findIndex((t) => t.id === action.input.id);\nif (index === -1) throw new TargetNotFoundError(`Target ${action.input.id} not found`);\ntargets.splice(index, 1);",
              errors: [
                {
                  id: "d8cbfea0-6399-49dd-a39b-a3a4dfe7cf90",
                  name: "TargetNotFoundError",
                  code: "TARGET_NOT_FOUND",
                  description: "No target has this id",
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
