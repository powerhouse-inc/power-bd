# Power BD

Business development for Powerhouse teams. Power BD is a Powerhouse package: one drive app where a team runs its leads, funding opportunities, investors, proposals, company decisions and positioning playbook. It links to the team's Knowledge Vault and has an agent chat that works across both.

## What's in the package

**The Power BD app**, the editor for a BD drive. Its places:

| Place | What it holds |
| --- | --- |
| Overview | The landing view. It shows what needs attention (each item with its fix), what's coming up day by day, and every lead, opportunity and shortlisted investor on one board or table. Cards move between stages. |
| Leads | Sales, partnership and investor leads, with their next step, outreach messages and proposals |
| Proposals | Offers to clients: packages, options, prices and terms, edited and previewed as a document, exported as Markdown with their pictures |
| Funding | Grants and calls, with deadlines in date order, the go-or-no-go gate, conditions and attempts left |
| Investors | The investor list and its shortlist |
| Organisations | Everyone the team deals with, with the retention list |
| Decisions | Company decisions the BD work waits on |
| Playbook | Approved positioning, proof cases and the never-claim list |
| Settings | The team, the time zone, the due window, the vault drive and the retention period |
| Agent | The chat. It reads and changes BD records, and reads the vault. |

A first-run guide sets the drive up. Search (Ctrl K or ⌘ K) covers every record and, with a vault, its notes.

**Eight document models:** `powerbd/lead`, `powerbd/opportunity`, `powerbd/proposal`, `powerbd/investor-list`, `powerbd/decision`, `powerbd/playbook`, `powerbd/settings` and `powerbd/contact`. Each one has a thin editor that shows the same screen as the app, so a record opened on its own looks the same as it does inside the app.

## Requirements

- **The Powerhouse stack 6.3.0-dev.1**, on Connect and the Switchboard. When the Knowledge Vault is installed beside Power BD, both packages must run the same stack version.
- **Optional: the Knowledge Vault** (`@powerhousedao/knowledge-note`) on the same Switchboard. It adds links from records to vault notes, vault notes in search, and the chat's vault tools. Name the vault drive in Settings. Power BD keeps its own drive and never writes to the vault.
- **Optional: the Switchboard's AI plugin** (`@powerhousedao/switchboard/plugins/ai`) for the chat. On a deployed Switchboard it needs authentication, and the server's admins are its admins. An admin adds an OpenRouter key in the chat's key card. The server keeps the key, and neither the page nor the agent ever sees it.

## Getting started

1. Install the package on your host: run `ph install @powerhousedao/power-bd` in the host project, or add it from Connect's package manager.
2. Create a drive and open it with the Power BD app. On first open the app creates its folders, the settings, the playbook and the investor list, then walks you through the team, the time zone and the vault.

## Steps that stay with a person

Eight steps are a person's:
- approving an outreach message, and marking it sent
- approving positioning
- answering a company decision
- deciding go or no-go
- marking a submission
- approving a proposal, and marking it sent

Operation permissions on the BD drive can restrict who may run each of them; go or no-go, for example, can be limited to the team lead. In the chat, the agent takes one of these steps only when you ask for it. Each change waits for your approval unless you turn on auto-approve, which is each person's own choice and off by default.

## Confidential items

Confidential assessments on leads and opportunities stay in the BD drive. The chat withholds them from the model, and nothing in the vault points back at BD records.

## Development

Use bun for everything.

```sh
bun install
bun run vetra          # Vetra Studio and a Switchboard: http://localhost:2927 and http://localhost:7927
bun run tsc
bun run lint
bun run test:coverage  # reducers and the kit stay at 95% or more
```

- `document-models/<name>/v1/`: each model's reducers in `src/` and tests in `tests/`. `gen/` is generated: don't edit it.
- `editors/power-bd/`: the app. `kit/` holds pure, tested modules; the rest is views, records and shared components.
- `design-system/`: tokens, component classes, icons and the status vocabulary, in light and dark. Open `design-system/index.html` to see every part.
- `hosts/`: the local hosts. The Vetra host loads the AI plugin with `allowWithoutAuth` for local development only. Never set that on a deployed Switchboard.

Build and publish with the Powerhouse CLI: `bun run build`, then `ph registry-login` and `ph publish`.

## License

AGPL-3.0-only. See [LICENSE](LICENSE).
