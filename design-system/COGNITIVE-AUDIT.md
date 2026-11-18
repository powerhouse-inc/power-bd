# Power BD: cognitive audit (Six Minds of Experience)

This document applies the `six-minds-design` skill in `.claude/skills/six-minds-design/SKILL.md` (John Whalen, *Design for How People Think*) to the Power BD app. It comes before any screen is designed or built. Each new screen adds a short audit of its own under *Per-screen audits*, using the same four parts.

Sources: the BD requirements (`bd-addon-funding-v1.0-requirements.md`), the spec (`.scratch/power-bd/spec.md`), and the Powerhouse context. Names in examples are invented (K1).

## Who uses it

| Who | How often | What they know | Main question |
|---|---|---|---|
| BD team member (owner) | Daily | Expert in BD: leads, pipelines, grants, cut-offs, consortia | "What do I do next, and by when?" |
| Team lead | Daily to weekly | Expert in BD; decides go or no-go and company questions | "Where is everything, and what is slipping?" |
| Business analysts and others | Occasionally | Novice in this app, knows the vault | "What do we know about this organisation?" |
| The agent | Constantly | No mind to design for, but its work must be trusted | (people check what it drafted) |

Everyone knows the vault and Connect. Nobody should need to know Powerhouse's internals: drives, documents, operations, ids.

## Cognitive audit checkpoints

1. **Vision and attention.**
   - **What to look at first:** on the overview, the things that need attention, as one ranked list. On a record, where it stands and what to do next.
   - **Risks:**
     - Four equal summary cards divide attention.
     - A coloured status tag on every card competes with the warnings.
     - A problem shown inside a card is missed when scanning.
   - **Mechanism:**
     - One bounded, high-contrast attention panel as the anchor.
     - A red or orange reason line (`.pb-signal`) on any card or row that is slipping, which can be spotted without reading. No component carries a coloured edge: one was tried and removed at the stakeholder's request.
     - Quiet figures: summary tiles that stay neutral and smaller than the attention count, so they do not compete with it (see the Overview's audit).
     - One charcoal primary button per view.
2. **Wayfinding.**
   - **Where people think they are:** in a workspace of places (Overview, Leads, Funding…), with pages inside them, as in Notion.
   - **Mechanism:**
     - The sidebar shows the current place, breadcrumbs the path, and a fixed icon each kind of record.
     - A status path on every record page shows where it is in its journey, including the gates (go or no-go).
     - Opening a record from a board or list slides a side peek in from the right, so the list stays in place. "Open full page" goes deeper.
     - Dialogs rise from below, menus drop from their trigger, toasts come up from the bottom edge.
3. **Memory and semantics.**
   - **The tools people know:** Notion (pages, properties, databases, boards, side peek), CRMs (pipeline stages, deals, activity, tasks), email (drafts, sent), calendars.
   - **Expectations:**
     - Changes save by themselves, without a Save button.
     - Search lives top-right, and ⌘K opens it.
     - Settings is a gear, deleting is a bin, and undo is offered after a change.
   - **Where we deviate, and the scaffolding:**
     - People-only actions get a person-check mark with an explanation.
     - Confidential items get a lock with an explanation.
     - "Mark sent" instead of "Send", explained where it appears.
4. **Language.**
   - **Audience:** experts in BD and novices in Powerhouse internals.
   - **Use BD words:** lead, funding opportunity, organisation, owner, next step, go or no-go, slipping, attempts left, never-claim, angle, positioning.
   - **Never show system words:** document, drive, PHID, operation, reducer, enum values, wallet addresses.
   - **Tiered detail:** the summary and the next action first. Sources, checked dates and history sit one click deeper, under a disclosure, for the experts who want them.
5. **Decision making.**
   - **The microgoals people follow:**
     - Member: what needs me → do it → record it.
     - Lead: what is slipping → why → who fixes it.
     - Go or no-go: is it worth it (amount, fit) → can we apply (conditions) → can we afford a try (attempts left) → by when (dates) → decide.
     - Outreach: draft → check → approve → send outside → mark sent.
   - **Mechanism:**
     - Every warning names its fix as a button ("Assign an owner", "Answer the decision").
     - Record pages show a "Next" bar with the single next action.
     - Prerequisites come before decisions: the go-or-no-go dialog lists conditions, attempts and the deadline above the choice.
     - Help sits at the point of decision, as hints and helper text, never on a separate page.
6. **Emotion.**
   - **Appeal:** a calm, professional, Powerhouse-branded workspace that shows on arrival that nothing is lost.
   - **Enhance:** one view instead of two Notion pages; the agent drafts; automatic saving; deadlines in our time.
   - **Awaken:** feeling in control, and looking professional to funders and partners.
   - **Anxieties to soothe:**
     - missing a deadline in another time zone
     - burning a limited attempt
     - sending a wrong claim, or leaking an assessment
     - the agent acting alone
     - losing work
     - holding personal data unlawfully
   - **Mechanism:**
     - A reassurance line beside each risky action.
     - A save state that always shows.
     - Undo after removals.
     - Small rewards for progress: ticking a next step, "All caught up", a win.

## Divergent concepts evaluated

Concepts for the overview, the screen the team lead and members open first:

- **A · Task-oriented, minimalist.** One ranked queue of everything that needs action now, each row with its fix. Best for decisions and speed. But it hides the whole pipeline, which the team lead must see (success measure: "where is every relationship…").
- **B · Contextual, conventional.** A CRM or Notion pipeline: summary cards, then a board or table with filters. Best for memory and wayfinding, since it is instantly familiar. But equal-weight cards divide attention, and problems hide inside cards.
- **C · Immersive, emotional.** A health score ring, a runway of upcoming deadlines, a feed of wins. Strong appeal and motivation. But a score feels like judgement, hides the specifics, and adds noise to a calm, professional tool.

**Chosen blend.**
- A's ranked attention panel is the visual anchor at the top.
- C's runway, in its quiet form: what's coming up, grouped by day and in our time.
- B's board and table below, with each slipping card showing its reason in red or orange.
- C's warmth only at moments of progress: "All caught up", a ticked step, a win.

The evidence for this blend:
- The requirements' success measures need both the anchor and the whole picture.
- Risk R13, that the team keeps using Notion if this is more work, rules out anything heavier than Notion.
- The deadline anxieties above call for the runway.

Record pages blend the same way:
- B: Notion properties and sections.
- A: a "Next" bar with one action.
- C: the status path and a readiness ring, which show progress.

## Evidence-driven implementation (design system)

| Mind | What the design system now has |
|---|---|
| Vision | `.pb-attention` panel (the anchor); red and orange reason lines on slipping cards and rows (`.pb-signal`); quiet summary tiles (`.pb-tiles`), neutral and smaller than the attention count; one charcoal primary per view |
| Wayfinding | `.pb-path` status path with gates; `.pb-peek` side peek; breadcrumbs; motion that matches space: dialogs rise, the peek slides from the right, menus drop, toasts rise |
| Memory | Gear for settings, bin for delete; `.pb-search-trigger` with ⌘K; `.pb-save-state` (Saved, Saving, Offline, Can't reach the server); undo in toasts; inline validation |
| Language | The lexicon below; `vocabulary.ts` labels; `.pb-disclosure` for tiered detail; tooltips naming time zones in full |
| Decision | `.pb-next` bar with the next action; every slipping reason carries its fix (`vocabulary.ts`, `action`); prerequisites-first go-or-no-go dialog; `.pb-hint` help at the point of decision |
| Emotion | `.pb-reassure` lines at risky actions; `.pb-ring` readiness; check and celebration motion; "All caught up" |

## Lexicon

| Say | Don't say | Why |
|---|---|---|
| Lead, funding opportunity, organisation, person | record, document, entity | BD words; the rest is how the software stores it |
| Note in the vault, or the note's title | reference, PHID, document id | The team knows "the vault" |
| Owner (a name) | assignee, user, 0x… address | Names come from the team list |
| View, Edit, Manage | READ, WRITE, ADMIN, permission level | The levels said by what they let someone do |
| Access, give access, remove | grant, revoke, permission, ACL | The team's words for who can open the space |
| Wallet address (in Access and the gate only) | user id, DID, Renown account | Access is given to the address someone signs in with; a team name shows beside it when known |
| Next step | task, to-do item | The team's own phrase |
| History | interactions, operations, events | What a person calls the past of a relationship |
| Stage: New, Active, Parked, Closed | common stage | "Common stage" is a spec term |
| Status labels from `vocabulary.ts` | NEXT_STAGE, enum values | Never show stored values |
| Decide go or no-go | approve, submit a decision | The team's phrase |
| Mark sent, mark a submission | send, submit | The app never sends or submits (K8) |
| Attempts left | quota, limit | Plain and countable |
| Waits on: writing, findings to fix, approval, sending, the client's answer, nothing | pending, blocked, awaiting, workflow state | Says whose move a proposal is, in the words of the step |
| Draft (beside a value) | unconfirmed, pipeline, weighted | A value that is not sent yet is shown, and counted nowhere |
| Slipping, needs attention | alerts, errors | The requirements' word, and calmer than "errors" |
| Confidential | private, hidden, secret | One word, always with the lock |
| Saved | synced, committed, dispatched | What people expect from Notion |
| Your time, the funder's time (with the city) | UTC, offset, local | Experts get the short zone; the tooltip names the city |
| Space, the vault | drive, workspace id | "Space" for where the team works, "the vault" for where its notes live |
| Vault address | Ethereum address, wallet, public key | The Settings word; the hint says what it looks like |
| Set up, the set-up guide, step | onboarding, wizard, configuration | Plain words for a first visit |
| For example | sample data, placeholder, demo record | An example is marked as one, so nobody takes it for a record |
| Agent, ask the agent | assistant, AI, bot, copilot | One name for the one thing; its gradient mark carries it |
| Open beside, open full view | dock, undock, sidebar mode, maximise | Says where the chat goes |
| Set-up (the chat's key and what it reads) | configuration, chat settings | Settings is a place; Set-up is the chat's own |
| Auto-approve | autonomous mode, skip approvals, trust mode | Sektar's word, and it says what it does |
| Your own key, in this browser | BYOK, API key, client-side key, local storage | Says whose key it is and where it stays |

Copy rules:
- Sentence case. Buttons start with a verb.
- Dates read "Fri 27 Nov, 02:00", followed by the relative form ("in 10 days").
- Amounts keep their currency.
- A reassurance line names the fear it answers ("Nothing is sent from Power BD").

## Six Minds mapping

- **Vision:** one anchor per screen (the attention panel, or the record's Next bar). Slipping items show their reason in red or orange, which can be spotted without reading. Everything else stays quiet.
- **Wayfinding:** sidebar place, breadcrumbs, status path, side peek that keeps the list in view, motion that follows space.
- **Memory:** Notion and CRM conventions, automatic saving with a visible state, ⌘K search, gear and bin, undo.
- **Language:** BD words only. System terms never appear. Detail is tiered, with summaries first and sources one click deeper.
- **Decision:** each warning names its fix, a Next bar per record, prerequisites before every decision, help where it is needed.
- **Emotion:**
  - A calm, branded workspace.
  - Reassurance at every risky step: time zones, attempts, outreach, people-only actions, confidential items.
  - Small, honest celebrations of progress.

## Per-screen audits

Add one section per screen as it is designed or built, with its four parts: checkpoints, concepts, implementation, mapping. The overview's is above.

### App shell (sidebar, top bar, empty places)

The frame every place and every record sits in. It has no content of its own yet: each place shows an empty state until its ticket builds it.

**1. Checkpoints**

1. **Vision and attention.** The anchor is the place being shown: the active sidebar item and the page title agree. Counts are quiet figures. An empty place shows one sentence and no button, so nothing competes with the sidebar. One reserved accent: the active item.
2. **Wayfinding.** The sidebar lists the eight places in the order people work (Overview, Leads, Funding, Investors, Organisations, Decisions, Playbook), with Settings at the foot. The top bar breadcrumb repeats the current place. Opening a record keeps the sidebar in view; picking a place closes the record and returns to it.
3. **Memory and semantics.** Notion's layout: sidebar left, search top-right with ⌘K, gear for Settings, save state beside search. The search trigger is shown but disabled, with a title that says when it arrives, rather than a control that does nothing.
4. **Language.** Place names and counts only, from the lexicon. Folders and singleton records the app creates on first open are never named in the UI. The empty states say what the place will hold ("Leads will appear here"), never how it is stored.
5. **Decision making.** No decisions in the shell. The only choice is where to go, and the sidebar is the only way to make it.
6. **Emotion.** The save state always shows: "Setting up" while the first-open set-up runs, "Up to date" after, "Offline" when the connection drops, "Can't reach the server" when a shared drive's server did not answer the last read. Opening the app twice changes nothing, so nothing can be lost or doubled.

**2. Concepts weighed**

- **A · Task-oriented:** no sidebar, one queue. Rejected for the shell: the team lead also needs to move between places freely.
- **B · Conventional (Notion-like sidebar and top bar):** familiar, and matches the design system's mock-ups.
- **C · Immersive:** a home with large cards per place. Rejected: slower than a sidebar for daily use.

**Chosen:** B, with A's single anchor (the active place and its title). Evidence: the stakeholder-approved mock-ups use B, and risk R13 (the team stays in Notion if this is more work) rules out anything less familiar.

**3. Implementation:** `.pb-root`, `.pb-app`, `.pb-sidebar`, `.pb-nav`, `.pb-topbar`, `.pb-crumbs`, `.pb-search-trigger`, `.pb-save-state`, `.pb-empty`, `.pb-page`. Icons and labels from the design system's sets. Light and dark follow Connect's `.dark` class with no theme code in the app.

**4. Mapping**

- **Vision:** the active place is the only emphasised item; counts are quiet.
- **Wayfinding:** sidebar place, breadcrumb, the sidebar stays when a record opens.
- **Memory:** Notion layout, search top-right with ⌘K, gear at the foot, visible save state.
- **Language:** BD place names only; no storage words.
- **Decision:** nothing to decide; one way to navigate.
- **Emotion:** the save state shows; first-open set-up is silent and never doubles.

### Playbook (place and thin editor)

The positioning we may state, the proof cases behind it, and the claims we must never make. One component serves the Playbook place and the playbook's own page.

**1. Checkpoints**

1. **Vision and attention.** The anchor is the positioning card: its status tag and, for a draft, the one primary action (Approve). Proof cases and never-claims are quieter lists below it.
2. **Wayfinding.** Three sections in the order a writer needs them: Positioning, Proof cases, Never claim. The sidebar and breadcrumb show Playbook.
3. **Memory and semantics.** Notion-like lists and inline forms; vault notes appear as a title with a link icon, as in the rest of the app.
4. **Language.** Positioning, proof case, evidence, comparable, never-claim, approve, retire, draft. Never "reference", "PHID" or status codes.
5. **Decision making.** Approve is people-only and carries the mark and a reassurance line. Before editing approved positioning, a line says it returns to draft. Retire says it is final.
6. **Emotion.** Reassurance beside approve and retire; a rejected action shows its reason beside the control that caused it.

**2. Concepts weighed**

- **A · Task-oriented:** a review queue of drafts. Rejected: the playbook is reference material, mostly read.
- **B · Conventional:** sectioned page of lists and cards. Matches the app.
- **C · Immersive:** a writing canvas. Rejected: too heavy for short statements.

**Chosen:** B with A's single anchor (the draft awaiting approval). Evidence: R13, the team stays in Notion if this is more work than Notion.

**3. Implementation:** `.pb-section`, `.pb-card`, `.pb-tag`, `.pb-list`, `.pb-field`, `.pb-input`, `.pb-textarea`, `.pb-btn`, `.pb-btn__people`, `.pb-reassure`, `.pb-field__error`. Statuses from `positioningStatus`.

**4. Mapping**

- **Vision:** the positioning card and its status are the anchor.
- **Wayfinding:** three ordered sections under the place title.
- **Memory:** lists and inline forms as elsewhere; vault notes as linked titles.
- **Language:** BD words only.
- **Decision:** approve people-only with reassurance; the draft-return warning sits beside the edit control.
- **Emotion:** reassurance lines; errors beside their control.

### Settings

The team's one settings page: who is on the team, our time zone, and three rules (due window, vault, retention). Used rarely, by the team lead, so it must be calm and obvious rather than fast.

**1. Checkpoints**

1. **Vision and attention.** No alarm on this page. The anchor is the team list, the only part that grows; the other settings are quiet rows below it. An inactive member shows greyed with an "Inactive" tag, never hidden.
2. **Wayfinding.** Reached from the gear at the foot of the sidebar; the breadcrumb says Settings. Sections run in the order people think: who, when, then the rules.
3. **Memory and semantics.** Settings as people know it: labelled fields that save where they are edited, a switch-free list with one button per row.
4. **Language.** "Team", "Our time zone", "Due window", "Vault", "Keep personal data for". Never "address" without saying whose ("Vault address"), never document, drive or node.
5. **Decision making.** Each setting is one choice with its consequence beside it. Deactivating is reversible and says so.
6. **Emotion.** Reassurance lines: a deactivated member keeps their name on past work; the time zone changes how dates read, not the dates; the retention period is applied the same way everywhere. A refused change shows its reason beside the field.

**2. Concepts weighed**

- **A · Task-oriented:** a first-run checklist (add team, pick zone). Rejected: used once, then in the way.
- **B · Conventional:** stacked labelled sections, edit in place. Familiar and quiet.
- **C · Immersive:** a settings wizard. Rejected: nothing here is sequential.

**Chosen:** B, with A's single anchor (the team list first). Evidence: settings are rarely visited, so convention wins; the stakeholder mock-ups use the same stacked sections.

**3. Implementation:** `.pb-page`, `.pb-section`, `.pb-list`, `.pb-avatar`, `.pb-tag`, `.pb-field`, `.pb-input`, `.pb-field__error`, `.pb-btn`, `.pb-reassure`. Fields save on leaving them or pressing Enter; the top bar's save state shows the result.

**4. Mapping**

- **Vision:** the team list is the anchor; inactive members are greyed and tagged.
- **Wayfinding:** the gear and breadcrumb; sections in thinking order.
- **Memory:** familiar labelled fields that save in place.
- **Language:** BD words; the lexicon's "owner (a name)" is fed from this list.
- **Decision:** one setting, one choice, consequence beside it.
- **Emotion:** reassurance beside deactivate, time zone and retention; errors beside the field.

### Investors (the investor list)

One list per team: the regional map of investor organisations, from import to the first conversation. Rows are organisations only; people join as contacts once the team engages.

**1. Checkpoints**

1. **Vision and attention.** The anchor is the shortlist: the tab strip leads with All and shows the Shortlisted count, and the one primary action on a shortlisted row is "Start relationship". Excluded rows are muted and carry their reason beneath the name, so nothing needs to be opened to understand them. No coloured edges: an investor row is not slipping.
2. **Wayfinding.** Investors in the sidebar and breadcrumb; tabs for All, Shortlisted, Excluded and Engaged, each with a count; a list filter appears once more than one source list exists. An engaged row shows two links (the organisation and the investor lead) instead of an action.
3. **Memory and semantics.** A Notion-style table with state tags, and an import box that takes what people already have: lines pasted from a spreadsheet. Saving is automatic and the save state stays in the top bar.
4. **Language.** "Investor", "list it came from", "Shortlist", "Exclude", "Put back on the list", "Start relationship", "Thesis", "Funded comparables". Never row, state code, PHID or document. The note links say "note in the vault".
5. **Decision making.** Shortlisting is one click. Excluding asks for a reason first, because the reason is what stops the team from re-asking later. "Start relationship" lists what it will create (an organisation and an investor lead) before it runs.
6. **Emotion.** Reassurance beside each risky step: importing ("Nothing is added twice: lines without a name are skipped and listed"), excluding ("You can put it back on the list"), starting a relationship ("Creates an organisation and an investor lead. Nobody is contacted"). If a step fails, the screen says which step and what already exists, so nothing is lost or doubled.

**2. Concepts weighed**

- **A · Task-oriented:** a triage queue, one investor at a time, to shortlist or exclude. Fast for 130 rows, but hides the map the team wants to scan.
- **B · Conventional:** a filterable table with tabs by state, as the mock-up shows. Familiar from Notion and CRM lists.
- **C · Immersive:** a board with a column per state. Rejected: 130 rows in four columns is harder to scan than a table.

**Chosen:** B, with A's single primary action per row (Shortlist, then Start relationship). Evidence: the approved mock-up is a table; the work is scanning a long list and acting on a few rows.

**3. Implementation:** `.pb-page`, `.pb-tabs`, `.pb-count`, `.pb-filter`, `.pb-table`, `.pb-tag`, `.pb-ref`, `.pb-btn`, `.pb-field`, `.pb-input`, `.pb-textarea`, `.pb-callout`, `.pb-reassure`, `.pb-checks`, `.pb-empty`. State tags from the `investorRow` vocabulary. Parsing the pasted lines and the three-step "Start relationship" run live in the kit and are tested.

**4. Mapping**

- **Vision:** the shortlist and its one primary action; excluded rows muted with their reason.
- **Wayfinding:** sidebar place, tabs with counts, list filter, links from an engaged row.
- **Memory:** a table like Notion's; pasting lines from a spreadsheet; visible save state.
- **Language:** investor words only; notes are "in the vault".
- **Decision:** a reason before excluding; what will be created is listed before it is.
- **Emotion:** reassurance beside import, exclude and start; a failed step names itself and what exists.

### Leads and the lead detail

The Leads place lists every relationship; the lead page says where one stands and what to do next, then holds its plan, outreach and history.

**1. Checkpoints**

1. **Vision and attention.** On the list the anchor is the "New lead" button; rows are quiet (name, kind, status tag, owner, proposal badge, next step). On a lead the anchor is the Next bar (`.pb-next`), the one thing to do now; while the lead is at "proposal" the Next bar names the proposal's next action and its button opens the proposal (changed on 2026-11-17, see *Proposals: the place, the lead's cards and the badge*). A draft that breaks the never-claim list gets the only red callout, beside the message; the phrase itself is underlined in its line (`.pb-mark`).
2. **Wayfinding.** Path (`.pb-path`) shows where the lead is and what follows. Top bar repeats Leads / lead name; the sidebar stays. Sections follow the order people ask: the proposals (cards right under the Next bar, since at "proposal" they are the work), who and why, what is planned, outreach, what happened, people and notes, confidential. The top bar shows the lead's name as the page has it, never an older entry name.
3. **Memory and semantics.** Notion-like page: properties block, then sections with counts, checkbox next steps, a timeline for history. Same pieces the opportunity page will use (shared relationship parts).
4. **Language.** "Next step", "History", "Confidential" with the lock, "Mark sent", "Approve"; never addresses, ids or stored codes. Owner shows a name when the team list exists, else the address in a plain box; the word "Owner" appears once, as the row's label.
5. **Decision making.** Approval is offered only when the draft has no findings; each finding says the phrase and the rule it breaks. Approve and Mark sent are people-only, each with a reassurance line. Lost asks for a reason first.
6. **Emotion.** "Nothing is sent from Power BD" beside every send-related action; the confidential callout says who can see it; the save state is in the top bar; a rejected action shows its reason beside the control that caused it.

**2. Concepts weighed**

- **A · Task-oriented:** the page is only the Next bar and a queue of drafts. Rejected: the team also needs history and context on the page.
- **B · Conventional (Notion-like record page):** familiar; matches the approved lead mock-up.
- **C · Immersive:** a conversation-style timeline as the whole page. Rejected: next steps and outreach would be buried.

**Chosen:** B with A's single anchor (the Next bar). Evidence: the stakeholder mock-up and the requirement that next steps and outreach are reachable without scrolling past history.

**3. Implementation:** `.pb-page`, `.pb-path`, `.pb-next`, `.pb-props`, `.pb-section`, `.pb-list`, `.pb-todo`, `.pb-message`, `.pb-timeline`, `.pb-callout`, `.pb-reassure`, `.pb-btn__people`, `.pb-table`, `.pb-tag`. Labels from `vocabulary.ts`.

**4. Mapping**

- **Vision:** one anchor per screen (New lead; Next bar); red only for a blocked approval.
- **Wayfinding:** status path, breadcrumb, fixed section order.
- **Memory:** Notion record layout, checkbox next steps, timeline history.
- **Language:** lexicon words; no stored codes or addresses where names exist.
- **Decision:** approval gated by the sensitivity check with reasons; people-only marks.
- **Emotion:** reassurance lines, confidential callout, errors beside the control.

### Funding and the funding opportunity detail

The Funding place lists opportunities by deadline; the opportunity page answers, in order: where does it stand, what now, can we apply, by when, what has gone in.

**1. Checkpoints**

1. **Vision and attention.** On the list the anchor is "New opportunity"; rows are quiet, with the deadline as the first column. On a page the anchor is the Next bar; blocked turns it orange. The go-or-no-go panel is the only dialog-weight element, and shows only when it is the next thing to do.
2. **Wayfinding.** The status path has the go decision as its own gate; a blocked preparing step carries a flag. Sections follow the questions: Can we apply? By when? Attempts, Submissions, Consortium, then the shared relationship parts.
3. **Memory and semantics.** Both time zones side by side with the funder's zone named; the cut-off we aim for is tagged; every condition shows its state, source and checked day; a condition waiting on a decision links to it.
4. **Language.** "Can we apply?", "By when?", "Attempts left", "Mark a submission", "Decide go or no-go"; never stored codes, never "submit". The app never submits.
5. **Decision making.** Before go or no-go, a checks list shows conditions met, attempts left and the cut-off. Go and mark-submission are people-only, with the mark. A rejected action explains itself beside its control.
6. **Emotion.** "Power BD never submits" beside every submission action; "Only you can decide" beside go or no-go; the attempt count shows before a risky step.

**2. Concepts weighed**

- **A · Task-oriented:** only the Next bar and the go decision. Rejected: conditions and dates need to be seen together.
- **B · Conventional record page:** matches the approved mock-up.
- **C · Immersive timeline:** the whole page as a dated line. Rejected: conditions would be buried.

**Chosen:** B with A's single anchor. Evidence: the stakeholder mock-up (`screen-opportunity`) and the people-only rule for go or no-go.

**3. Implementation:** `.pb-path` (gate step), `.pb-next` (blocked), `.pb-props`, `.pb-section`, `.pb-table--compact`, `.pb-tag`, `.pb-when`, `.pb-readiness` with `.pb-ring`, `.pb-dialog`, `.pb-checks`, `.pb-reassure`, `.pb-btn__people`. Labels from `vocabulary.ts`.

**4. Mapping**

- **Vision:** New opportunity; the Next bar; go panel only when due.
- **Wayfinding:** path with gate and blocked flag; question-ordered sections.
- **Memory:** two time zones, sources and checked days, linked decisions.
- **Language:** BD words, no codes, "mark a submission".
- **Decision:** checks before go or no-go; people-only marks.
- **Emotion:** reassurance lines; attempts left shown early; errors beside controls.

### Organisations, the contact detail and the retention list

The Organisations place lists the organisations we know; the page answers: who are they, who do we know there, what do we have going with them. A second tab lists people due for removal.

**1. Checkpoints**

1. **Vision and attention.** On the list the anchor is "New organisation"; rows are quiet. On the page the anchor is the organisation's name; the people and the gathered records are plain sections. On "Due for deletion" the anchor is each row's "Remove this person", shown only per person who is due.
2. **Wayfinding.** Two tabs, "Organisations" and "Due for deletion", with the count of people due on the second. The page runs: details, address, tags, notes, people, then "Everything with this organisation", each item a link that opens the record.
3. **Memory and semantics.** Records are gathered by what they are (leads, funding, investors, proposals, research), not by how they were found. Due rows say since when and on which closed records.
4. **Language.** "Organisation", "people", "Remove this person", "Due for deletion", "Archive". Never contact, document, node or stored codes. Kind, VAT id and registration number are not shown.
5. **Decision making.** Removing a person asks for a confirmation that names the person and what is held; the app removes nothing by itself.
6. **Emotion.** A reassurance line says the app only removes the person from the organisation and that files on proposals must be erased by an administrator; errors show beside the control.

**2. Concepts weighed**

- **A · Task-oriented:** only the retention queue. Rejected: the list of organisations is the place's main job.
- **B · Conventional list and record page:** matches the other places.
- **C · Immersive relationship map:** rejected: no evidence it beats a plain list for this volume.

**Chosen:** B with A as the second tab. Evidence: the other places' pattern and the spec's retention rule (K2).

**3. Implementation:** `.pb-table`, `.pb-tabs`, `.pb-section`, `.pb-props`, `.pb-tag`, `.pb-tags`, `.pb-field`, `.pb-reassure`, `.pb-btn`, `.pb-btn--primary`, `.pb-link`. The confirmation is an inline panel from tokens (the design system has no inline confirm).

**4. Mapping**

- **Vision:** New organisation; the name on the page; one remove button per due person.
- **Wayfinding:** two tabs with a count; fixed section order.
- **Memory:** records grouped by what they are, each a link.
- **Language:** lexicon words; no kind, VAT or registration number.
- **Decision:** confirm names the person; the app never deletes.
- **Emotion:** reassurance about files; errors beside controls.

### Decisions and the decision page

The Decisions place lists company decisions, open ones first; the decision page shows the question, what it gates, and the answer only a person can give.

**1. Checkpoints**

1. **Vision and attention.** On the list the anchor is "New decision"; overdue rows carry a red signal line, answered ones recede. On a page the anchor is the answer box, placed after "What this decides".
2. **Wayfinding.** Place, then decision; the sections follow the questions: what is asked, who owns it, by when, what does it decide, what is the answer. Each gated record is a link that opens it.
3. **Memory and semantics.** The question is the title; the decide-by day says how many days overdue; the list shows how many records each decision gates.
4. **Language.** "Decide by", "What this decides", "Answer the decision", "Reopen", "Withdraw"; never "answered by hash" or stored codes.
5. **Decision making.** What the answer will affect is listed before the answer box. Answering is people-only, with the mark. Reopen and withdraw each need a reason.
6. **Emotion.** "Only a person can answer" beside the answer; "Reopening clears the answer from this page; it stays in the history" beside reopen.

**2. Concepts weighed**

- **A · Task-oriented:** only the question and the answer box. Rejected: the weight of the choice (what it gates) must be visible first.
- **B · Conventional record page:** matches the approved mock-up (`screen-decision`).
- **C · Immersive impact map:** gated records drawn as a graph. Rejected: a list is quicker to scan and to open.

**Chosen:** B with A's single anchor (the answer box). Evidence: the stakeholder mock-up and the people-only rule for answers.

**3. Implementation:** `.pb-props`, `.pb-section`, `.pb-list`, `.pb-tag`, `.pb-when`, `.pb-person`, `.pb-table`, `.pb-reassure`, `.pb-btn__people`, `.pb-textarea`. Labels from `vocabulary.ts`.

**4. Mapping**

- **Vision:** New decision; overdue red line; answer box as the anchor.
- **Wayfinding:** question-ordered sections; gated records open on click.
- **Memory:** days overdue, gated count in the list.
- **Language:** BD words, no codes.
- **Decision:** gated list before the answer; people-only; reasons for reopen and withdraw.
- **Emotion:** reassurance beside answer and reopen; errors beside controls.

### Overview (built, `views/overview/`)

The overview audit at the top of this document stands. The first build was judged to work but to look basic; this audit covers the richer build the stakeholder approved: summary tiles, rich cards, a real menu, folded empty stages, a strip of the days coming up, and owner colours.

**1. Checkpoints**

1. **Vision and attention.** The attention panel stays the one anchor: it holds the only large coloured figure on the screen. The four summary tiles sit above it but stay quiet: neutral figures at 20 px against the panel's 32 px red count, a hairline, no fill. Risk: tiles and richer cards add weight. Answer: a card has one coloured element when nothing slips (its status tag) and the red or orange signal line when something does; kind, organisation, next step and "changed" are grey text. Owner marks never use red or orange, which mean slipping here. No component has a coloured edge.
2. **Wayfinding.** A tile takes the reader where its figure lives: Relationships resets the board, Due goes to "Coming up", Open decisions opens the table on the open decisions (decisions have no stage, so no board column), Open funding narrows to funding. The strip lays the days of the due window side by side, today first, weeks set apart, so closeness reads as distance. An empty stage folds to a strip, so the eye does not cross a blank column.
3. **Memory and semantics.** Tiles that filter are what dashboards taught people; the on state is the same soft blue as the "Mine" filter. The filter pills drop a menu as in Notion and work from the keyboard as a native select did (arrows, Home, End, Enter, Escape, a letter). The strip is a calendar's week row; diamonds for deadlines are a project-plan habit. An owner keeps one colour everywhere on the screen.
4. **Language.** Kinds read as the team says them: "Sales lead", "Partnership lead", "Exchange lead", "Investor lead", "Funding opportunity", "Shortlisted investor". "Next step", never "task". "Changed 3 days ago"; for a shortlisted investor "List changed", because only its list records a change. "Deadline, Meeting, Next step" in the strip's legend. Amounts keep their currency and are never added across currencies.
5. **Decision making.** Lead: what is slipping, then who and how big. The card answers "whose, what next, by when, worth what, how stale" without opening it (FR-21.1). Member: "what is close" is answered by the strip before reading the list. Filters narrow before any opening; a tile is the one-click form of the filter people use most.
6. **Emotion.** The strip answers the fear of a missed deadline at a glance: an empty stretch is visibly empty, and a diamond is a date that will not move. "Changed" shows nothing was forgotten silently. When nothing slips, "All caught up" stays.

**2. Concepts weighed**

- **A · Task-oriented:** keep the first build, a text line of figures and name-only cards. Fastest to scan, but the lead must open each record to learn the next step, the value and how stale it is; this is what read as basic.
- **B · Conventional:** a CRM dashboard: stat tiles, deal cards with organisation, value, next activity and owner colour, dropdown filters. Familiar, and answers FR-21.1 on the card. Risk: equal tiles divide attention.
- **C · Immersive:** a full calendar runway and coloured cards by kind. Strong on closeness in time, but colour by kind would compete with the slipping signals and break the no-coloured-edge rule.

**Chosen:** B's tiles, cards and menus, made quiet enough that A's single anchor holds, with C's runway reduced to a one-row strip of marks. Evidence: FR-21.1 lists what every item must show (kind, organisation, owner, status, next step and its date, last change); the stakeholder asked for richer and approved these six changes; the main audit's deadline anxieties ask for closeness to be visible; the standing rule forbids coloured edges, so kind and state are told by icon, word and signal line.

**3. Implementation:** `pb-tiles` and `pb-tile`, `pb-attention`, `pb-strip`, `pb-mark`, `pb-list` (with `pb-list__lead--deadline` and `--meeting`), `pb-menu` (trigger is a `pb-filter`, list is a `pb-popover`), `pb-board--fit`, `pb-board__col--empty`, `pb-card` with `pb-card__kind`, `pb-card__row`, `pb-card__value`, `pb-card__end` and `pb-card__meta`, `pb-avatar--<tone>` from the member's place on the team list, `pb-signal`, `pb-segmented`, `pb-table`, `pb-disclosure`. The pure parts are in `kit/overview-view/` (cards, strip, board-view, menu-keys, owner-tone, when).

**4. Mapping**

- **Vision:** the attention count is the only large coloured figure; tiles and cards are neutral; red and orange appear only on what slips.
- **Wayfinding:** each tile goes where its figure lives; the strip turns time into distance; empty stages fold away; every card, row and fix opens its record.
- **Memory:** dashboard tiles that filter, Notion-style filter menus with the usual keys, a calendar's week row, one colour per person.
- **Language:** kinds, "next step", "changed" and the legend in the team's words; no stored values; amounts keep their currency.
- **Decision:** the card answers whose, what next, by when, worth what and how stale before any click; tiles and menus narrow first.
- **Emotion:** closeness of every deadline is visible, a stale record says so, and "All caught up" rewards a clean board.

### Proposal (built, `records/proposal/`)

Reworked on 2026-11-17: the split screen (tabs on the left, findings and markdown source on the right) became two views with a switch.

**1. Checkpoints**

1. **Vision and attention.** One anchor: the Next bar ("Fix 2 findings", "Approve the proposal", "Send it yourself, then mark it sent", "Record the client's answer"). Below it, one actions panel and one findings list; nothing competes beside the work area, because the page shows one view at a time. In the Preview the eye goes to the page on its desk; text still to be filled in pops out as an orange mark.
2. **Wayfinding.** Links back to the lead and the organisation sit above the title. The status path says where the proposal stands. A switch (Edit, Preview) says which of the two views is shown; tabs split the Edit view (Details, Packages, Options and payment, Scope, Content, References). A finding names its tab ("Fix in Content") and takes the person there: the tab opens, the item shows itself once and the cursor is in the field. The contents of the document jump to its sections.
3. **Memory and semantics.** Edit and Preview is the switch people know from every writing tool; it looks like the Overview's Board and Table switch. The preview is a page as a client reads it (headings, numbered contents, price tables with a total line, tick boxes, lines to sign), not source text. Every figure comes from one place: the export and the preview are made from the same blocks.
4. **Language.** "Proposal", "package", "deliverable", "option", "payment step", "mark sent", "the client's answer", "Withdraw", "Export"; "Edit" and "Preview" for the views; "things to fix", never "errors" or "validation". Lapsed is shown as "Past its valid until day". No stored codes.
5. **Decision making.** Prerequisites first: findings sit above the views and approval opens only when nothing is left to fix. Each status has its actions in one panel, in the order they are taken. Withdraw asks for its reason only once it is pressed, with a way back ("Keep it"). A sent or answered proposal opens on Preview, because reading is all that is left to do with its text.
6. **Emotion.** A reassurance line beside every risky step: "Only a person approves" beside Approve, "Nothing is sent from Power BD" beside Mark sent and Export, "Withdrawing keeps the proposal and your reason in the history" beside Withdraw, "Nothing is sent to the client" beside the answer. "Each field saves when you leave it" in the Edit view. Seeing the finished page before sending answers the fear of a leftover placeholder reaching a client.

**2. Concepts weighed**

- **A · Task-oriented:** one long form, the document only on export. Fast to build and to scan, but the person never sees what the client gets.
- **B · Conventional:** a record page with tabs and an Edit and Preview switch, as in writing tools. Familiar, and each view gets the full width.
- **C · Immersive:** edit inside the rendered page. Rejected: the tables and totals must stay derived, and typing into a page invites typing figures.

**Chosen:** B, with A's single anchor (the Next bar and findings above both views) and C's page-on-a-desk for the Preview only. Evidence: the user asked for one view to edit and one to preview instead of the split screen; the split left the tabs 520 px, which wrapped a tab label and cut the Title field; the old preview showed markdown source, which no client reads.

**3. Implementation:** `pb-backlinks`, `pb-path`, `pb-next`, `pb-actions`, `pb-findings` and `pb-finding`, `pb-viewbar` with `pb-segmented--lg`, `pb-tabs`, `pb-cell--*`, `pb-doc-desk`, `pb-doc`, `pb-doc-table`, `pb-doc__gap`, `pb-reassure`, `pb-btn__people`. Pure logic in `kit/proposal-render` (blocks, markdown from the blocks, prose), `kit/proposal-view` (views, tabs, where a finding is fixed) and `kit/proposal-check` (placeholder marks).

**4. Mapping**

- **Vision:** the Next bar is the anchor; one view at a time; placeholders marked on the page.
- **Wayfinding:** links back to lead and organisation; path; view switch; tabs; findings that lead to their place; contents that jump.
- **Memory:** Edit and Preview as in writing tools; a page that looks like the document sent.
- **Language:** BD words from the lexicon; "things to fix".
- **Decision:** findings before approval; actions in one panel in the order taken; Withdraw asks its reason when pressed.
- **Emotion:** a reassurance line beside every risky step; the saved state said in the Edit view; the finished page seen before it is sent.

### Proposal Preview: a wide page, Document or Markdown, Copy markdown (built, `records/proposal/`)

The Proposal audit stands. This covers three changes the user asked for on 2026-11-17: the page fills the column instead of lying on a grey desk, the Preview shows the page as the client reads it or as its markdown, and the markdown can be copied as well as exported.

**1. Checkpoints**

1. **Vision and attention.** The page is the one surface under the view bar. The grey desk was a second background competing with the page's own edge, and it cost 260 px of a 1062 px column at 1440. The page now fills the column and keeps its card edge; its margins are a share of its width, so a wide screen gets wide margins and a narrow one keeps room for the text. The Document and Markdown switch is smaller than Edit and Preview, so it reads as a choice inside Preview.
2. **Wayfinding.** Left to right, the bar goes from the big choice to the small one (Edit or Preview, then Document or Markdown), with the actions opposite. The choice is kept per proposal while the app is open, like Edit and Preview, so coming back finds the page as it was left.
3. **Memory and semantics.** A rendered and source switch is what people know from writing tools and previews. A copy button that reads "Copied" for a moment is the convention; it keeps its width, so nothing beside it jumps.
4. **Language.** "Document", "Markdown", "Copy markdown", "Copied", "Export". A refusal says what happened and the way round it: "The browser refused to copy. Export saves the same text as a file." Never "clipboard API" or "permission".
5. **Decision making.** The markdown shown is exactly the text Export saves and Copy markdown copies, so a person sees what they will paste before pasting it. When a copy fails, the alternative is named on the same line.
6. **Emotion.** Fear: "did copying or exporting send it?" The reassurance line beside both buttons: "Copy and Export stay on your computer. Nothing is sent from Power BD." A failed copy is never silent.

**2. Concepts weighed**

- **A · Task-oriented:** no Markdown view, only Copy markdown beside Export. Fewest parts, but the person copies text they have not seen.
- **B · Conventional:** a Document and Markdown switch inside Preview, with Copy markdown beside Export. Familiar; one more small control.
- **C · Immersive:** the page and its markdown side by side. Rejected: the user asked for one view at a time, and a split is what this page left behind.

**Chosen:** B, with A's single row of actions. Evidence: the user asked for the switch and the button by name, and for the desk to go; at 1440 the desk left the page 800 px of a 1062 px column.

**3. Implementation:** `pb-doc` (fills the column; its padding a `clamp()` of its width), `pb-doc__source`, a second `pb-segmented` in `pb-viewbar`, `pb-btn--swap` with `.is-off`, `pb-viewbar > .pb-field__error`, `pb-reassure`. `pb-doc-desk` is gone. The copy and its refusal are in `kit/clipboard` (tested); the choice is kept in `records/proposal/usePageView.ts`.

**4. Mapping**

- **Vision:** one page surface at full width; the small switch reads as part of Preview.
- **Wayfinding:** the big choice, then the small one, left to right; the choice remembered per proposal.
- **Memory:** a rendered and source switch, and a copy button that says "Copied", as people know them.
- **Language:** Document, Markdown, Copy markdown, Copied; a refusal in plain words with its way round.
- **Decision:** the text shown is the text copied and saved; the alternative named when a copy fails.
- **Emotion:** nothing leaves Power BD, said beside both buttons; no silent failure.

### Proposal Export and Copy with their pictures (built, `records/proposal/`, `kit/proposal-render/pictures.ts`)

The Proposal Preview audit stands. This covers ticket 10, asked on 2026-11-17 ("if I export or copy the markdown, it also has the images included"), and the blank band at the top of the Markdown view left from ticket 09.

**1. Checkpoints**

1. **Vision and attention.** The page stays the one surface. In the Markdown view the pictures' data would be 99.5 % of the text (1,046,472 of 1,051,898 characters for the Brisa Labs pilot's two screenshots), so each picture's data is folded to one filled chip with its type and size, and the eye passes over it. The view opens on a head (the file's name, and how many pictures it carries) and the text starts under it, without the document's wide top margin that read as a blank band. A picture that can't be read is the one orange chip.
2. **Wayfinding.** Reference-style images leave a short label where each picture stands (`![caption][figure-1]`) and gather the data at the end, so the body reads in order and the definitions are where markdown readers look for them. The head names the file Export saves (`BRI-26-01.md`).
3. **Memory and semantics.** Reference links are a markdown convention; folding long content behind a chip is what code editors do; a code viewer names the file above its text. A renderer that allows data URLs shows the pictures in place (checked with marked in Chromium); one that strips them shows the captions.
4. **Language.** "Preparing pictures…", "Export and Copy carry 2 pictures inside the text. Their data is folded here, one line each.", "PNG picture, 239 KB", "can't be read", "Couldn't read the picture "…", so nothing was exported. Try again in a moment, or replace the picture under Content." Picture, as the Content tab says; never attachment, base64, blob or reference.
5. **Decision making.** The person sees what the export carries before pressing: the count, each picture's type and size, an unreadable one marked. Pressing reads the pictures afresh; a picture that can't be read stops the export or the copy, is named, and both ways round are given. Nothing half-done is saved or copied.
6. **Emotion.** Fears: "will the client see broken images?" (the pictures travel inside the text); "did half a file get saved?" (the line says nothing was exported or copied); "did pressing send something?" (the reassurance line beside both buttons stands; the pictures are read from the space, nothing leaves Power BD).

**2. Concepts weighed**

- **A · Task-oriented:** embed the pictures and show the export verbatim in the Markdown view. Fewest parts, but the view becomes a megabyte of base64 and the end of the document is lost in it.
- **B · Conventional:** reference-style images with data URLs at the end; the Markdown view folds each one to a chip with its type and size, under a head that names the file and counts the pictures; a status line while the pictures are read; the reason on the error line when one can't be.
- **C · Immersive:** export a zip of the markdown and its picture files, with a strip of thumbnails over the Markdown view. Rejected: a zip can't go on the clipboard (the ticket says so), and thumbnails repeat the Document view.

**Chosen:** B. Evidence: the ticket names reference-style images, data definitions at the end, folds with type and size, a count and "Preparing pictures…"; the measured share of the pictures in the Brisa Labs export (99.5 %).

**3. Implementation:** `pb-doc--source` (the markdown page's tighter padding, which removes the blank band), `pb-doc__head`, `pb-doc__file`, `pb-doc__count`, `pb-doc__fold` with `.is-unread`, `pb-busy` on a line of its own in `pb-viewbar`, the reason through `pb-field__error`. The text, the folds and the words are in `kit/proposal-render/pictures.ts` (tested); the pictures are read in `records/proposal/useWithPictures.ts` (`getAttachmentClient().downloadBlob`), and each fold's size through `useAttachmentPreview` in `PictureFold` (`records/proposal/Files.tsx`), as the Document view reads its pictures.

**4. Mapping**

- **Vision:** one page; the data folded to quiet chips, one orange chip for a picture that can't be read; the text starts under the head.
- **Wayfinding:** a label where each picture stands, the data at the end; the head names the file.
- **Memory:** reference links, folded content, a file name over the text.
- **Language:** picture, Preparing pictures…, can't be read; the reason with its two ways round.
- **Decision:** what the export carries shown before pressing; a stop that names the picture; nothing half-done.
- **Emotion:** the client sees the pictures; nothing half-saved; nothing sent from Power BD.

### Moving a card on the board (built, `views/overview/`)

The Overview audit stands. This covers one change: a person picks a card up and puts it on another stage, "with questions".

**1. Checkpoints**

1. **Vision and attention.** While a card is in the hand, the stages are the only thing to look at: those that take it turn into tinted surfaces, the one under the card deeper; those that refuse it fade. The card looks lifted as it leaves and its place fades, so the eye follows the hand. Risk: a tint could read as a status colour. Answer: the tint is the accent blue of "on" filters, never red or orange, and no stage or card gets a coloured edge.
2. **Wayfinding.** A stage is a place and a status is a point in it, so a drop on a stage with several statuses asks which one, in that stage, where the card will land. A folded stage takes a drop and opens to hold its question. Go or no-go is not on the board: the question says where it is taken and opens that page. Escape or Cancel puts the focus back on the card, which never left its place.
3. **Memory and semantics.** Dragging cards between columns is what Trello, Notion and every CRM board taught; the not-allowed pointer on a stage that refuses is the system's own. People also expect a board to do what the record page does, so every move sends the same action as the page and follows the same rules.
4. **Language.** Stages and statuses by their names. One short line per stage: "Becomes To contact", "Pick: Meeting set, Met or Proposal", "Becomes Parked · asks why", "Go or no-go is decided on its page". A refusal says what to do first ("Give the lead an owner first", "Start a relationship from the investor's row first"), never a rule number or a stored value.
5. **Decision making.** Before letting go the person sees what a drop will do. One possible status is set at once. Several are offered as a short list. A reason is asked for at the moment it is needed (lost, parked, rejected, withdrawn), and the move waits for it. What the record needs first (an owner, an organisation, a submission) is said on the stage instead of failing after the drop. The same four stages with the same lines are on every card's "Move to…" list, for the keyboard and for touch.
6. **Emotion.** Fears: "did I just close it by accident?", "did I decide go for the team lead?", "is it lost?". Closing always passes a list or a reason and carries "Nothing is deleted: a closed lead keeps its history. Closing is final." Parking says it returns to where it was. A drop never decides go or no-go. If the record refuses a move, the reason shows beside the card and the card is where it was.

**2. Concepts weighed**

- **A · Task-oriented:** no dragging, only a status list on each card. Fast and exact, but ignores what a board invites people to do, and the stage a status belongs to stays implicit.
- **B · Conventional:** free drag and drop as in Trello, statuses guessed (the first of the stage), errors as toasts. Familiar, but a guess is wrong three times out of four on Active, a toast is far from the card, and a careless drop could close a lead.
- **C · Immersive:** the board transforms while dragging: every stage splits into one lane per status with animated previews. Exact, but the layout moves under the pointer and the lanes differ per kind of card.

**Chosen:** B's drag and drop with A's list as the second way in and as the question after a drop, and from C only the calm part: stages that show, in one line, what they will do. Evidence: FR-21.2 makes stages groups of statuses, so a stage alone cannot name a status; FR-13.6 gives go or no-go to the team lead alone; the reducers refuse a lost, parked, rejected or withdrawn move without a reason and anything past "to contact" without an owner; the stakeholder approved "with questions".

**3. Implementation:** `pb-card.is-lifted` and `.is-away`, `pb-board__col.is-target`, `.is-over` and `.is-refused`, `pb-board__hint`, `pb-ask`, `pb-card__move`, `pb-card__moves` and `pb-move`, `pb-reassure`, `pb-field__error` (the `ErrorLine`). The rules are pure, in `kit/overview-view/move.ts`, and are tested against the lead and opportunity reducers.

**4. Mapping**

- **Vision:** tinted stages take the card, faded ones do not; the lifted card and its faded place show what is moving.
- **Wayfinding:** the question stands in the stage the card was put on; the decision is pointed to, and opened, where it lives; Escape returns to the card.
- **Memory:** drag between columns as on every board; the same rules and actions as the record pages.
- **Language:** one short line per stage in stage and status names; refusals say what to do first.
- **Decision:** what a drop does is shown before it; one status is set, several are offered, reasons are asked for when needed.
- **Emotion:** closing is never one careless drop, go or no-go is never decided by a drop, and a refused move leaves the card where it was with the reason beside it.

### Three fixes: a long breadcrumb, a folded stage's line, the question's shadow (built, `components/TopBar.tsx`, `views/overview/`)

The App shell and Moving a card audits stand. These are three faults the user reported, fixed on 2026-11-17.

**1. Checkpoints**

1. **Vision and attention.** A long record name ran under the centred search, and a folded stage's line hung under its strip over the next column's cards. Both covered what the person was looking at. The crumbs now end in an ellipsis before the field, and the line stands inside its strip. The question's shadow no longer stops in a hard edge at the board's side.
2. **Wayfinding.** The place's crumb stays whole; the record's gives way first, and its full name is the crumb's tooltip. With no room for any of it, only the place shows, because the name is the page's title just below. The strip grows down, never sideways, so no stage moves under the card in the hand.
3. **Memory and semantics.** An ellipsis with a tooltip is how apps shorten a breadcrumb. The strip's line is set vertically, like the stage's name on it, so it reads as part of the strip.
4. **Language.** Unchanged: the stage lines and refusals of the board audit.
5. **Decision making.** A folded stage that refuses now says why at once, as an open stage does, instead of only once the card is over it. The reason is there before the person tries.
6. **Emotion.** Nothing covers the cards a person is aiming at, and nothing slides sideways during a drag.

**2. Concepts weighed**

- **A · Task-oriented:** drop the line on folded stages. Clean, but the person loses what a drop does.
- **B · Conventional:** open a folded stage to a full column while the card is over it, with the line inside. Seen on some boards, but the stages beside it move under the pointer: leaving Parked for Closed would slide Closed away from the pointer.
- **C · Immersive:** keep the line in the strip, set vertically like the stage's name. No overlap and no sideways movement.

**Chosen:** C for the line; for the breadcrumb, an ellipsis that ends before the field, keeping the field centred and its width as it is. Evidence: the overlaps the user reported at 1440, and B's layout worked through for the Parked and Closed strips side by side.

**3. Implementation:** `pb-crumbs` (clips; the record's crumb shrinks first, with an ellipsis; a `pb-crumbs` container query hides the separator and the record's crumb under 200 px), `title` on the record's crumb; `pb-board__col--collapsed > .pb-board__hint` (in the strip, `writing-mode: vertical-rl`); `pb-board--fit` with room inside its scrolling edges, given back outside.

**4. Mapping**

- **Vision:** nothing covers the cards or the search.
- **Wayfinding:** the place first, the record's name in the tooltip; the strip grows down only.
- **Memory:** an ellipsis with a tooltip; a vertical line like the strip's name.
- **Language:** the board's lines unchanged.
- **Decision:** a folded stage's refusal shown at once.
- **Emotion:** no covering and no sideways jump during a drag.

### First run (the set-up guide on the Overview, `views/overview/first-run/`)

What a BD person sees on opening an empty space, until the team, the time zone, an organisation and a first lead or funding opportunity exist. The pattern follows the Sektar app's guided set-up (a numbered steps strip, one panel per step with a title and one line, a hint under each field); none of its code or classes is used.

**1. Checkpoints**

1. **Vision and attention.** The first thing to look at is the current step's primary button: the only charcoal button on the screen. The guide stands in for the summary tiles, the attention panel and the board, because on an empty space those are four zeros and four empty columns that divide attention and say nothing. The steps strip is quiet: grey numbers, a tick when done, the open step pressed. Once the board shows, the guide shrinks to one grey row above it, so the attention panel is the anchor again.
2. **Wayfinding.** The person is on the Overview, where they landed; the sidebar and the title do not change. The strip says where they are in set-up (the open step), what is behind (ticks) and ahead (numbers), and "2 of 5 done" with a ring repeats it. Any step can be opened from the strip, so nobody is trapped in an order. The row form names what is left ("Left: choose the vault") and opens in place.
3. **Memory and semantics.** A numbered checklist with a progress count is what project tools and app set-ups taught people (and what the team's Sektar app does). Steps tick themselves from the records, as a checklist that knows the truth should: a space that already has a team opens with step 1 ticked. "Skip for now" and "Hide" are where people expect them; Settings is where a hidden guide is brought back.
4. **Language.** "Team", "time zone", "vault", "organisation", "lead", "funding opportunity", "owner", "next step": the lexicon. Never "drive", "document", "address format" or a stored value: the vault is chosen by its name from a list, the kind of lead by its label. The hints carry the expert detail a novice lacks, with the value to imitate set apart: a zone reads `Europe/Zurich`, a vault address starts `0x` and has 40 more letters and digits, an amount is `250000` with `EUR`.
5. **Decision making.** The micro-decisions, in the order they depend on each other: who is on the team (owners need it), which time zone and how far ahead "due" looks (every date needs it), which vault (optional, so it can be skipped), which organisation (a lead belongs to one), then the first lead or opportunity with its owner and next step. Each panel gives one line on why before the fields, and each field its hint at the moment of typing. The time zone is pre-filled from the browser, so that step is one click. What the model would refuse is checked before a record is created and shown beside the field it concerns, so no half-filled lead is left behind.
6. **Emotion.** Appeal: an empty space that says what to do first instead of showing zeros. Enhance: five short forms replace hunting through Settings and three places; the result is a board with a real card on it. Awaken: the fear is "this is more work than Notion" and "I will break something". Each step has one reassurance line for its own worry: people can be renamed or deactivated later; changing the zone never moves a deadline; choosing a vault changes nothing in it; adding a lead sends nothing to anyone. The tick pops and the ring fills as steps complete.

**2. Concepts weighed**

- **A · Task-oriented:** one question per screen, nothing else, no way to jump. Fastest for a brand-new space, but a space that already has a team would be walked through steps it has done, and a person who wants to add the organisation first cannot.
- **B · Conventional:** a numbered checklist strip with one panel per step and hints under fields, as in the Sektar app and most set-ups. Familiar, shows the whole path, lets steps tick from the data.
- **C · Immersive:** a welcome screen with an illustration, a tour of the places and a celebration at the end. Appealing once, but it delays the first real record and adds weight the calm workspace avoids.

**Chosen:** B, with A's one form and one primary button at a time, and C reduced to the tick's pop and the filling ring. Evidence: the stakeholder asked for guidance "just like in the Sektar app"; risk R13 (the team stays in Notion if this is more work) asks for the shortest path to a first real card; the requirement that a space with data is never pushed back into the guide rules out A's forced order.

**3. Implementation:** `pb-guide` (head, progress with `pb-ring`, panel, form, actions), `pb-guide--strip` (the one-row form), `pb-steps`, `pb-field__help` with `pb-eg` for the example value, `pb-field__error` through `ErrorLine`, `pb-reassure` under every step, `pb-segmented` for lead or funding opportunity. The step logic is pure, in `kit/first-run/` (`setupProgress`: which steps are done, which is next, "n of 5", and whether the Overview shows the guide, the row or nothing; `firstRefusal`: runs the model's own reducer on a new record before it is created). Hidden and skipped are the viewer's choices, kept in the browser per space; Settings shows the progress and brings the guide back.

**4. Mapping**

- **Vision:** one primary button per step is the anchor; the guide replaces the zeros and empty columns; after the first lead it is one grey row and the attention panel leads again.
- **Wayfinding:** the Overview stays the place; the numbered strip and "n of 5 done" say where set-up stands; any step opens from the strip; the row names what is left.
- **Memory:** a self-ticking checklist with progress, skip and hide where people expect them, the guide brought back from Settings.
- **Language:** team, time zone, vault, organisation, lead, owner, next step; hints show the value to imitate; no stored values or system terms.
- **Decision:** steps in the order they depend on each other; why before the fields; hints at the field; the browser's zone pre-filled; refusals beside the field before anything is created.
- **Emotion:** a first screen that says what to do; one reassurance line per step for that step's worry; ticks and a filling ring for progress.

### Empty places (Leads, Funding, Investors, Organisations, Decisions, Playbook)

What each place shows before it holds anything. It replaces the shell's first rule ("one sentence and no button"), which was written when the places were not built.

**1. Checkpoints**

1. **Vision and attention.** The one thing to look at is the button that adds the first record. While a place is empty, the header's own "New" button is not shown, so the page has exactly one primary button. The example sits in a dashed, grey box: visibly not a record, quieter than the button.
2. **Wayfinding.** The sidebar and the page title already say where the person is; the empty state says what this place is for, so they can tell whether they are in the right one before adding anything.
3. **Memory and semantics.** The empty state every Notion database and CRM list has: an icon, a sentence, one button. The example is labelled "For example", as documentation does.
4. **Language.** One sentence in the team's words on what belongs ("A lead is one organisation you are talking to, or want to"). The example is written as the place will show it: name, kind, owner, next step and day; an amount with its currency. Invented organisations and people only.
5. **Decision making.** The question is "what goes here, and what does one look like?". The sentence answers the first, the example the second, the button acts on it. On Investors the button opens the list import, because investors arrive as a list; in the Playbook it goes to the positioning form already on the page.
6. **Emotion.** An empty table reads as "nothing works yet"; an example reads as "this is what yours will look like". The button says "first", which makes the step feel small.

**2. Concepts weighed**

- **A · Task-oriented:** no empty state, open the new record's form at once. Fast, but it creates a record nobody asked for and explains nothing.
- **B · Conventional:** icon, sentence, example, one button. Familiar and self-explaining.
- **C · Immersive:** a full sample board with ghost cards. Shows the most, but ghost records are easily mistaken for real ones and compete with the button.

**Chosen:** B, with C reduced to a single dashed example. Evidence: the stakeholder asked for one sentence, a concrete invented example and the one button in every place; the rule that examples are invented and marked comes from K1 (no real organisations or people).

**3. Implementation:** `pb-empty pb-empty--start` with `pb-empty__example` (`pb-empty__eg-label`, `-title`, `-detail`) and one `pb-btn--primary`; the `EmptyStart` component. Non-empty places are unchanged.

**4. Mapping**

- **Vision:** one primary button per empty place; the example is dashed and grey.
- **Wayfinding:** the sentence confirms what the place is for.
- **Memory:** the familiar icon, sentence and button; "For example" marks the sample.
- **Language:** one sentence in BD words; the example reads as a real row would, amounts with their currency.
- **Decision:** what goes here, what one looks like, then the button; Investors starts with an import, the Playbook with its positioning form.
- **Emotion:** an example instead of a blank; "first" makes the start small.


### Proposals: the place, the lead's cards and the badge (built, `views/proposals/`, `records/proposal/ProposalsSection.tsx`, `components/shared/ProposalBadge.tsx`)

Added on 2026-11-17, after a team member could not find proposals: they were one line far down the lead page. A proposal is now reachable from the sidebar, from the top of its lead, and from every list that shows the lead.

**1. Checkpoints**

1. **Vision and attention.** In the place, the one thing to read is the "Waits on" column: the team's own moves are set in the text colour and medium weight, the client's in grey, "Nothing" faint, and an answer past its valid-until day is the only red signal (`.pb-signal`, with the hourglass). Rows that wait on the team come first, so the top of the table is the work. On a lead the anchor stays the Next bar; the proposal cards sit directly under it and carry no button of their own colour. A draft's value is quieter than a counted one.
2. **Wayfinding.** "Proposals" sits after "Leads" in the sidebar with the count of proposals still open. Each row links to its lead; the lead's cards and Next bar open the proposal; the proposal page links back to its lead. The badge on the Overview card and in the Leads list tells that a proposal exists before anything is opened. The top bar's crumb shows the record's own title.
3. **Memory and semantics.** A table like the other places (Decisions, Funding): title first, status as a tag, a status filter that drops a menu. Cards like the board's. "Draft" beside an amount is how quotes and invoices mark what is not final.
4. **Language.** "Waits on": "Writing", "2 findings to fix", "Approval", "Sending", "The client's answer, until Fri 4 Dec", "Nothing". Next actions start with a verb: "Write the proposal", "Fix 2 findings", "Approve the proposal", "Send the proposal", "Waiting for an answer until Fri 4 Dec", "Record the client's answer". Statuses from `vocabulary.ts`. No ids, no stored codes.
5. **Decision making.** The question in the place is "which proposal needs me?"; the order and the column answer it. On the lead it is "what do I do about the proposal now?"; the Next bar says it and its button goes there. A proposal starts from a lead, so the place has no "New" form: the button goes to Leads and says so, and the empty state explains why.
6. **Emotion.** The fear is a forgotten offer: one that lapsed unanswered, or a draft nobody finished. Both rise to the top. The other fear is a draft's figure taken for revenue: the "Draft" mark and its tooltip ("Not counted in the lead's value or any total until the proposal is sent") answer it wherever the figure shows. "Nothing is sent from Power BD" stays in the send step's reason.

**2. Concepts weighed**

- **A · Task-oriented:** no place; only a "proposals that need you" queue on the Overview. Fast, but a sent or accepted proposal could still not be found, which was the complaint.
- **B · Conventional:** a sidebar place with a table and a status filter, cards on the lead, a badge in the lists. Findable where people look first.
- **C · Immersive:** a board of proposals by status with big value figures. Shows the pipeline, but the spec keeps proposals off boards (the board shows relationships), and large draft figures invite counting them.

**Chosen:** B, with A's ordering (what waits on the team first, the lead's Next bar naming the proposal's action). Evidence: the stakeholder looked for proposals in the sidebar and on the lead and found neither; story 27 forbids counting drafts; the spec says proposals are not board items.

**3. Implementation:** `pb-table` with `pb-waits` (`--ours`, `--theirs`, `--none`) and `pb-signal`; `pb-menu` for the status filter; `pb-pulse` for the two quiet counts; `pb-empty--start` with a button that goes to Leads; `pb-proposal-cards` and `pb-proposal-card` under `pb-next`; `pb-proposal-badge` and `pb-draft-value` on `pb-card` and in the Leads table. Logic in `kit/proposal-list/` (rows, what a proposal waits on, the lead's proposal action, badges) and `kit/record-name/` (the crumb's title). No part has a coloured edge.

**4. Mapping**

- **Vision:** "Waits on" is the column to read; one red signal for a lapsed offer; draft values are quiet.
- **Wayfinding:** sidebar place with a count, links both ways between proposal and lead, a badge wherever the lead shows, the crumb in the record's own words.
- **Memory:** table, tag, filter menu and cards as elsewhere in the app; "Draft" beside an amount.
- **Language:** the step's own words for what a proposal waits on; verbs for next actions.
- **Decision:** the team's moves first; the lead's Next bar opens the proposal; a new proposal is started where it belongs, from a lead.
- **Emotion:** lapsed and unfinished offers cannot hide; a draft's figure is never mistaken for a counted one.

### Chat: one conversation, in full view or beside, with approval or auto-approve, on the server's key or your own (built, `components/chat/`; tickets 32, 34, 35, 36, 38)

The agent reads BD records and the vault's notes, and proposes changes to records that a person approves. It runs on the server's assistant service with a key an admin enters once; it never handles the key and never sees a confidential item. The hosted server runs no assistant service yet, so the user decided on 2026-11-17 ("let's do option B for now"): where the server's service isn't the person's to use, they can use their own OpenRouter key, kept in this browser for them only, which the agent never sees either. Asked on 2026-11-17: "an actual chat view interface and not a sidebar chat … I want it the same" as Sektar, then "an option … so he can have a full chat view or switch back to the side panel … so he can always have the chat alongside". So one conversation has two presentations: the full view, which is the Agent place, and the side panel of the spike, with a switch between them. Then: "the agent should do the steps by himself, if I approve him", and an option "where I allow him to do all the steps automatically". So every write, the eight people-only steps included, asks on the approval card, and Auto-approve, each person's own choice, lets writes run without asking.

**1. Checkpoints**

1. **Vision and attention.** In the full view the anchor is the composer at the foot of the conversation; before a key it is "No key yet" with the key form's "Save and test" beside it, and while an approval waits, the approval card. Where the server doesn't run the agent for the person, the anchor is "Use your own key in this browser" in the conversation pane, with "Save and test" in Set-up's card (in the side panel, the card sits under the checks). Set-up is a quieter pane on the sidebar's surface, its cards in the card style. "Ready" is a small green dot with the model's name in faint text. In the side panel the place being shown keeps its own anchor and the panel has one at a time. The entry is a quiet "Ask the agent" button in the top bar, with the agent's gradient mark, the one thing the gradient is for; the Agent place in the sidebar has a plain icon like every place, so the sidebar draws no eye.
2. **Wayfinding.** "Agent" is a place at the sidebar's foot, beside Settings and away from the places people work in, and the crumb says "Agent". The side panel docks on the right, sliding in from the right like the side peek, and stays open while people move between places. The switch in the conversation's header moves the same conversation: "Open full view" goes to the Agent place and closes the panel; "Open beside" goes back to the place (or record) the person came from, the Overview if none, with the panel open. "Ask the agent" opens the presentation each person chose last and is pressed while the chat shows; pressed again it closes the panel, or leaves the full view for where the person came from. Where two panes don't fit, Set-up is a sheet sliding in from the right, opened from ⋯ and closed with × or Esc.
3. **Memory and semantics.** Sektar's assistant page, the team's own app: two panes, "Ready" with the model, Clear, the sheet behind ⋯, "No key yet". Notion AI, the team's reference, opens its agent in a sidebar or as a full page with a switch in its header. Chat conventions: messages above, the composer at the foot, Enter to send and Shift+Enter for a new line, suggestions while empty, Stop while it answers, Clear to start again. The choice of presentation is remembered for each person, like any view preference. The key form behaves like every key field: hidden as typed, tested before it is kept, shown masked afterwards. The person's own key follows the server key card exactly (same card, same steps, same words), as bring-your-own-key fields do in the AI tools the team already uses.
4. **Language.** "Agent", "Ask the agent", "Open beside", "Open full view", "Set-up", "What the agent reads", "Set-up steps left", "No key yet", "Add the key", "Ready", "Replace key", "Remove key", "Auto-approve"; for the person's own key, "Use your own key in this browser", "Your OpenRouter key", "Your own key", "Add your key", "in this browser", "Change model", "Use this model". Never "BYOK", "API key", "client-side" or "local storage". The agent names a person's step in the team's words ("approving an outreach message") before it asks. No model, gateway, token or tool names in our own words; the model's name shows only as a quiet detail. The stack's panel still says "assistant" in its composer and names its tool steps (for example `getDocument`): a known gap.
5. **Decision making.** The microgoals, in order: can I use it here, and why not; give the key once; ask; approve or reject what it wants to change; read the answer and where it came from; keep it beside the work, or give it the screen. Prerequisites come first (`.pb-checks`): being one of the service's admins, then a key. Where the server doesn't run the agent for the person, "On for you on this server" shows as not here, neutral rather than red since their own key stands in, then "Your own key". The trade-off is said where the choice is made, as a plain note: "An admin can set a server key instead, which is safer." The key is tested with OpenRouter before it is kept: a refusal and an unreachable OpenRouter each say what happened and keep the typed key to correct, and a replacement leaves the current key in use until it passes. Set-up also lists what the agent reads and the space's set-up steps left, each with the way to fix it (Open Settings, Continue on the Overview). A change is shown in full before Approve. The eight people-only steps are taken only when the person asks for one, and the agent names the step and the record before the call: with Auto-approve off the approval card is the person's approval, with it on their request is. The space's permissions still apply, since the agent signs with the person's key; go or no-go stays the team lead's.
6. **Emotion.** The fears: losing the conversation when moving around or switching; that it changes records or takes a person's step behind one's back; that it repeats a confidential judgement or leaks the key. The conversation belongs to the tab: an answer keeps coming, an approval keeps waiting and the composer keeps its text across places and both presentations; only Clear, signing out or another person signing in end it. Auto-approve is off until each person turns it on, and the opening line and the line under the composer say which mode is on. Each other fear has its line (`.pb-reassure`) where it arises: under the composer ("Anything that changes a record asks you first, the steps that are yours included.", or with Auto-approve on: "Auto-approve is on: changes run without asking. Turn it off in Set-up."), beside the switch ("When on, the agent changes records and takes the steps you ask for without asking you first. It is yours alone, in this browser."), in the empty state ("Confidential items stay out of the chat."), under the key field ("Stored encrypted on your server and never shown again. The agent never sees it."), beside Remove key ("Removing it stops the agent until a new key is set."). For the person's own key the fears are that it leaks or reaches the agent, that testing it costs money, and that removing it deletes it at OpenRouter: one line under the field and the actions ("Your key stays in this browser, for you only, and goes only to OpenRouter. The agent never sees it."), the field's help ("Tested with OpenRouter before it is kept. The test spends nothing."), and the confirm ("The agent stops until you add a key again. The key itself stays valid at OpenRouter.").

**2. Concepts weighed**

- **A · Task-oriented:** a ⌘J bar that answers in a popover and forgets. Fast for one question, but it cannot hold an approval or a follow-up, and it covers the record being asked about.
- **B · Conventional:** a side panel docked on the right, kept open across places, with the composer at its foot (the spike's choice; Notion AI's sidebar).
- **C · Immersive:** a place of its own, the conversation filling the main area with Set-up beside it (Sektar's assistant page).

**Chosen:** C as the full view, with B kept as the second presentation and a switch between them; A's single anchor in both. Evidence: the user asked for "an actual chat view … the same" as Sektar, which is C; then for a way to switch back to the side panel "so he can always have the chat alongside", which is B; Notion pairs the two with a switch in the agent's header. The spike's objection to C, that it takes the screen from the records the questions are about, is answered by the switch. The Overview stays the landing view: the Agent place sits at the sidebar's foot rather than replacing it, as Sektar's assistant replaces its welcome page.

For the person's own key (ticket 38): **A** a bare key field in the dead end, fast but with no room for the model, Auto-approve, Remove or the trade-off; **B** the server key card's pattern, one card in Set-up with the conversation pane's empty state pointing to it; **C** a guided "Connect OpenRouter" flow that signs in at OpenRouter and returns with a key, less typing but a round trip out of Connect and more to build. **Chosen:** B, with A's directness in the side panel, where the card sits right under the checks. Evidence: the server key card already teaches the steps, so the own key costs no new learning; the user's decision keeps the key per person in this browser; and the trade-off needs a visible place, which a card has and a bare field doesn't.

**3. Implementation:** the full view `.pb-chat-view` (`__main`, `__head`, `__ready`, `__model`, `__body`, `__side`, `__side-head`, `__more`, `__empty`, `__add-key`) in `.pb-scroll--fill`, a container query making Set-up a sheet (`.is-open`) where two panes don't fit; Set-up `.pb-chat-setup` with the key card `.pb-key` (Auto-approve in `__auto`, a `.pb-switch`) and `.pb-chat-setup__card` (`__title`, `__reads`); the side panel `.pb-chat` (`__head`, `__title`, `__reads`, `__body`, `__foot`) beside `.pb-main` in `.pb-app--chat`; the held conversation `.pb-chat__held` in a `.pb-chat__slot` and Clear in a `.pb-chat__slot-clear`; `.pb-chat-entry` on the top bar's button (`aria-pressed`); `.pb-chat__state` for the states before the conversation, with `.pb-checks`; the stack's `ChatPanel` themed through its `ph-chat-*` hooks, with `.pb-chat__welcome` as its empty state. Tokens only, light and dark; no part has a coloured edge, and the stack's blockquote edge is a tint. The Shell holds the conversation (`ChatHolder`), as Sektar's `AssistantChatHolder` does. Logic in `kit/chat/`, tested first: the withholding of confidential items, where the vault's tools read, the instructions (a person's step only when asked and named first; whether Auto-approve is on), and each person's choices (`personChoice`: the presentation and Auto-approve, in this browser, in memory when storage fails). The spike's guard that refused the eight steps is gone. The person's own key: `OwnKeyCard` on the same `.pb-key` parts plus `.pb-key__note` (the plain trade-off, a neutral icon so it informs without warning), `NoOwnKeyYet` (the full view's `__empty` with `__add-key`) and `OwnKeyNeeded` (the side panel: checks, then the card); in the kit, tested first, `browserKeyStore` (per person, in this browser, in memory when storage fails), `keyHint`, `openRouterConnection` (its fetch adds the key, the page and "Power BD", and only on requests to OpenRouter), `testOpenRouterKey` (accepted, refused, unreachable) and `chatWay` (the server's service when it is the person's to use, their own key otherwise). The key field is uncontrolled, so the key is never copied into the page's HTML.

**4. Mapping**

- **Vision:** one anchor per presentation (the composer, or the one step before it: the server's key, or "Use your own key in this browser"); Set-up quieter beside it; only the agent's mark carries the gradient.
- **Wayfinding:** a place at the sidebar's foot and a panel docked on the right; the switch says where the chat goes, and "Open beside" returns to where the person was.
- **Memory:** Sektar's assistant page and Notion's full page or sidebar; chat conventions; each person's choice remembered; the own key on the server key card's pattern.
- **Language:** BD words and the lexicon's "Agent", "space" and "the vault"; system terms only as quiet detail, the stack's tool names a known gap.
- **Decision:** prerequisites as checks before the key, the trade-off of an own key said where it is chosen, and a key tested before it is kept; the key before the conversation; set-up steps left with their way to fix them; every change approved before it is made, a person's step only when asked and named first, unless the person chose Auto-approve.
- **Emotion:** the conversation survives places and switching; Auto-approve off until turned on, and the mode always said; one reassurance line at each other fear, the own key's "stays in this browser, for you only, and goes only to OpenRouter" among them.

### Linking a vault note (built, `components/vault/`, `components/shared/VaultNotes.tsx`, `records/settings/VaultField.tsx`)

Added on 2026-11-17 (ticket 30). Research, programme rules, company facts and comparables stay in the vault, and BD records link to them. A link stores the note's id with the title it had when it was linked; the page shows the vault's title today, opens the note in the vault app, and says why when the note can't be read. BD only reads the vault, and nothing in the vault points back.

**1. Checkpoints**

1. **Vision and attention.** The note's title is the thing to read, in the text colour, with a small arrow that says it leaves for the vault; its kind and what it says sit beneath, quieter. A note that can't be read is grey, never red: it is not slipping, and the page keeps its own anchor (the Next bar). In the picker the filled row is where Enter goes, the first note that can be linked; a note already linked is listed in grey with "Linked", so it is recognised and not offered twice.
2. **Wayfinding.** A title opens the note in the vault app, in the same tab, the way links move between spaces in Connect; Back returns to the record. When the note can't be opened from here (the vault is not open in this browser), the line under it says so, so a click is never left unanswered. Settings names the vault the links point at, chosen by its name from the vaults open in this browser.
3. **Memory and semantics.** Notion's page mentions and its "link to page" search: type a few words, results with a title and a line of text, arrows and Enter, Escape to close. ⌘K finds notes too, in a group of their own after the records ("Notes in the vault"), so a note is never taken for a BD record.
4. **Language.** "Note in the vault", "Search notes in the vault…", "Linked", "Link note", "Unavailable", and the reason in a few words: "No longer in the vault", "You don't have access to it", "Sign in to read it", "The vault can't be reached", "No vault is chosen in Settings". A note's kind in the vault's own words (Reference, Map, Observation, Source). The id appears only in the fallback, as "the note's id in the vault", for the person who has one when search can't run; never PHID, document or drive.
5. **Decision making.** The microgoals: find the note that backs this; check it is the right one; link it; later, open it. Every result carries what the note says and its kind, so two similar notes are told apart before linking. When search can't run, the reason comes first and then the id and title fields, so nobody waits at a field that never answers. A note that can no longer be read keeps the title it was linked with, so the page still says what it pointed at.
6. **Emotion.** The fears: that linking changes or exposes something in the vault, and that a broken link breaks the page or loses what it pointed at. The picker's foot says "Linking a note changes nothing in the vault."; Settings says "Choosing a vault changes nothing in it. Links already made keep the titles they were made with."; an unreadable note stays on the page with its title and a calm reason. Reading the vault's title never writes it back to the record.

**2. Concepts weighed**

- **A · Task-oriented:** one field that takes a note's id and shows the title once found. Fast for someone holding an id, but nobody holds ids: it was the whole interface before this ticket.
- **B · Conventional:** links with titles, as in Notion; a type-ahead picker under the field with each note's title, description and kind; ⌘K finds notes too; an unreadable note keeps its title and says why.
- **C · Immersive:** a vault browser in a side panel, its maps and notes as a tree with previews, dragged onto the record. Rich, but it rebuilds the vault app inside BD, and a second tree competes with the sidebar.

**Chosen:** B, with A kept as the fallback: the id and title fields, offered with the reason when search can't run, and on request under the results. Evidence: the spec asks for note pickers that search the vault named in Settings, through the vault's own search, with the reader's access, and for a linked note that shows its title and shows as unavailable when it can't be read, so a link never breaks the page (story 34); the team works in Notion, whose page links and link search this mirrors; the vault app already gives every note a full page, so BD opens it there rather than rebuilding it.

**3. Implementation:** `.pb-note` (a `.pb-list` row whose title, `.pb-note__title` with `.pb-note__open`, is the link out; `.pb-note__wait` while the vault is asked; `.is-unavailable` with `.pb-note__why`) and the `.pb-ref` chip (`.pb-ref__title`, `.pb-ref__why`) for tables and rows of references; `.pb-picker` (`__field`, `__list` in a `.pb-popover`, `__option` with `__title`, `__desc`, `__kind` and `.is-linked`, a sticky `__foot` with `.pb-reassure` and `__switch`, `__status`, `__typed` with `__why`); the palette's own group for notes; Settings' vault as a `.pb-input` select with `.pb-field__help` and `.pb-reassure`. Logic in `kit/vault/` (the client over the vault's knowledge-graph GraphQL, network handed in; the shared lookup store; how a link shows; the picker's rules, including where Enter goes; the palette provider; the Settings choice), tested first; the React layer in `components/vault/`. Tokens only, light and dark; no part has a coloured edge.

**4. Mapping**

- **Vision:** the title is the target; an unreadable note is grey, not red; the filled row is where Enter goes.
- **Wayfinding:** a title opens the note in the vault app and Back returns; when it can't, the line under it says why; Settings names the vault by name.
- **Memory:** Notion's page links and link search; ⌘K finds notes in a group of their own.
- **Language:** "note in the vault" and the vault's own kinds; short reasons; the id only in the fallback.
- **Decision:** what each note says, before it is linked; the reason before the fallback fields.
- **Emotion:** "Linking a note changes nothing in the vault"; an unreadable link keeps its title and a calm reason.

### Access in Settings, and the sign-in gate (built, `components/access/`, `kit/access/`; ticket 40)

Asked for so that access is managed in the app "instead of terminal commands, just like the knowledge vault app". The concepts weighed: a separate Access page (task-oriented), a section in Settings beside the team (conventional), and inline grants on each team member (immersive). Chosen: the Settings section, because the team list is already there and the vault's own Access is reached from its settings; grants on team rows were set aside because grants are by wallet and not everyone with access is on the team.

- **Vision:** in Settings, the list is the anchor; the add row sits under it. On the gate, one card with one action: sign in, or copy your address.
- **Wayfinding:** Access sits in Settings, after the team and the rules. The gate replaces the app only when the space can't be opened, and never because the server is slow or down.
- **Memory:** the shape of sharing dialogs (person, level, remove) and the vault's Access; a team name where the address is on the team.
- **Language:** View, Edit, Manage, each with one line on what it allows; "Give access"; the wallet address only here and on the gate.
- **Decision:** a level change and a removal each wait for one confirm that says what changes; a mistyped address says what an address looks like; the only manager is guarded, with the reason on the row.
- **Emotion:** "Access covers every record in it"; the confirm says what the person will no longer do; the gate says that signing in again won't help, and why.

### Three fixes: places open in place, Coming up scrolls, the conversation stays (built, `components/useDriveDocuments.ts`, `views/overview/ComingUp.tsx`, `components/chat/`; tickets 41, 42, 43)

The App shell, Overview and Chat audits stand. These are three faults the user reported on the deployed 1.0.3, fixed on 2026-11-17.

**1. Checkpoints**

1. **Vision and attention.** Every click on a place, a tab or a record blanked the whole app for about a third of a second behind Connect's loader, so the eye lost its place each time. Places, tabs and records now open in place, and the sidebar and top bar never go. A long Coming up list pushed the board below the fold; the list now scrolls inside its section, and the board starts where it did.
2. **Wayfinding.** In a scrolled Coming up list, the day's heading stays pinned, so the person knows which day they are reading. A soft shade along the bottom says there is more below, and it goes at the end. The day strip and its legend stay put above the list.
3. **Memory and semantics.** Leaving the app and coming back finds the conversation as it was, as in any chat product, and so does a reload. The person no longer has to remember what the agent said.
4. **Language.** For an answer a reload cut off: "The last answer stopped when the page closed. Ask again to go on." and, on its step, "Stopped: the page closed before this step finished." In a step whose long result was not kept: "Too long to keep once the page closed. Ask again to see it." Where an image was: "An image was attached here. Images are not kept once the page closes." No system terms.
5. **Decision making.** Unchanged.
6. **Emotion.** No flash that reads as a crash or a reload, no conversation that vanishes, and an answer the page cut off says so instead of looking finished.

**2. Concepts weighed** (for Coming up)

- **A · Task-oriented:** the first five items and a "more" disclosure, as What needs attention has. Short, but the page grows again once it is opened.
- **B · Conventional:** a list of fixed height that scrolls inside its section, with the day headings pinned, as in a calendar's agenda panel.
- **C · Immersive:** the day strip as a selector, showing one day's items at a time. Short, but the list stops being a glance at the days ahead.

**Chosen:** B. Evidence: the user asked for it ("add a scrolling feature on this card so I can scroll"), and it keeps the glance at the days ahead that A and C trade away.

**3. Implementation:** `.pb-list--scroll` (at most 400 px or 55 % of the window; the shade a `local` background, so it goes at the end; `.pb-list__group` sticky on `--pb-bg`), a focusable region named "Items coming up"; demo on the Overview screen. Places: the loading check is shared by every view (`kit/drive/loadable.ts`), and a changed record list loads in the background. Chat: `kit/chat/kept-conversation.ts`.

**4. Mapping**

- **Vision:** the app never blanks on a click; the board stays in reach.
- **Wayfinding:** the pinned day; the shade at the bottom.
- **Memory:** the conversation is there when the person comes back.
- **Language:** the stopped-answer and not-kept lines.
- **Decision:** unchanged.
- **Emotion:** no flash, no lost conversation, no answer that looks finished when it was cut off.

### Opening fast, and each place's address (built, `components/Shell.tsx`, `components/PlaceLoading.tsx`, `components/access/AccessGate.tsx`, `kit/drive/loadable.ts`, `kit/places.ts`; tickets 44, 45)

The App shell audit stands. Asked on 2026-11-17, against Sektar: "are we having the most efficient way to load and navigate across the views? I want it to be impeccable."

**1. Checkpoints**

1. **Vision and attention.** Opening the app showed nothing of ours, then "Opening the space…", then everything at once; for a moment the Overview said "Setting up your space" on a space set up long ago. Now the frame comes first, the place's title and quiet lines stand where its content will be, and the place and the sidebar's counts fill in together the moment the records are there.
2. **Wayfinding.** Each place has its address (`#leads`). Back and Forward move between places and through records opened from them; a reload stays where it was; a link opens a place. The sidebar's current place always matches the address.
3. **Memory and semantics.** Back works as on any website: the person no longer has to remember that it leaves the app.
4. **Language.** No new words. "Setting up" shows in the top bar only when something is really being set up, and "Setting up your space" only on a new space.
5. **Decision making.** Unchanged.
6. **Emotion.** No blank wait before the space, no false set-up message, no lost place on reload.

**2. Concepts weighed** (for loading)

- **A · Task-oriented:** no loading state at all; the frame waits for the records, as before. Simple, but the person stares at Connect's loader.
- **B · Conventional:** the frame at once and a skeleton in the pane, as Sektar's frame does with its page skeleton.
- **C · Immersive:** each view draws its own rows and fills them in as records arrive. Smooth, but every view needs its own loading design, and lists reshuffle as records land.

**Chosen:** B, filled in one go (not committed as a fallback, so React's 300 ms reveal throttle never holds the content back). Evidence: measured on the local Vetra. Requests on opening went from 46 to 14 (19 single reads became one batched read), there is no round trip before the frame, the content follows the batched read by the Overview's own render time, and returning to the app paints at once.

**3. Implementation:** `PlaceLoading` (`.pb-page__title`, `.pb-skeleton`, `role="status"`); the first load in a background render (`useDeferredValue`) gated on the drive's records being listed; the access gate up only on a refusal; the set-up skipped when the records known show nothing missing; `hashOf` / `placeFromHash`, with the place added to Connect's own entries and never written over an address that names one.

**4. Mapping**

- **Vision:** frame first, the place in one go.
- **Wayfinding:** an address per place; Back, Forward, reload and links.
- **Memory:** Back behaves as everywhere else.
- **Language:** "Setting up" only when true.
- **Decision:** unchanged.
- **Emotion:** no blank wait, no false message, no lost place.

### Dates that stay true: the clock moves, today stands out, overdue says so (built, `kit/clock/`, `components/shared/useNow.ts`, `components/shared/useToday.ts`, `views/overview/`, `views/leads/NextStep.tsx`, `components/shared/relationship/NextStepsSection.tsx`; ticket 46)

The Overview audit stands. Asked on 2026-11-17: "make sure that this coming up card works correctly with the date. so, if there's a date that is already overdue, it's displayed correctly. and also, it's displayed the current day in the calendar and so on".

**1. Checkpoints**

1. **Vision and attention.** Today in the strip was one shade darker than any day with something due, so in a busy fortnight it did not stand out. Now its date sits in a filled circle, the one solid spot in the strip. An overdue next step reads in red with its age on record pages and in the Leads table; on a card, the red signal line ends the card, as on the Overview.
2. **Wayfinding.** The strip always starts at today: at midnight in the team's time zone it rolls over by itself, and Coming up's headings ("today", "tomorrow") move with it.
3. **Memory and semantics.** The person no longer works out how late something is: "7 days overdue" says it.
4. **Language.** One wording for a passed date: "1 day overdue", "7 days overdue". Signals keep the lexicon's names ("Next step overdue · 7 days", "Meeting not recorded").
5. **Decision making.** The Open decisions tile names the overdue ones ("1 overdue"); it said "None overdue" whatever the dates.
6. **Emotion.** A view left open no longer misleads: no meeting that has passed still listed as coming up, no yesterday called today.

**2. Concepts weighed** (for today in the strip)

- **A · Task-oriented:** a "Today" label over the first day. Unmistakable, but the strip's columns are 22 px wide: a word does not fit without widening one day.
- **B · Conventional:** the date in a filled circle, as calendars mark today.
- **C · Immersive:** a "now" line across the strip and the list. Striking, but the list is grouped by day, not laid out on a timeline; the line would mean nothing there.

**Chosen:** B, in the primary colour (charcoal in light, near-white in dark): colour still marks meaning only, and blue stays for links and focus. The cell carries `aria-current="date"`. Evidence, measured on the local Vetra with the page's clock set: at 23:58:53 the strip's today was Tue 17 with two steps due; at 00:00:09, by the clock alone, it was Wed 18, and the two steps were in Needs attention as "Next step overdue · 1 day". A 09:30 meeting left Coming up at 09:31 and showed as "Meeting not recorded". After a 24-hour jump the page caught up 0.4 s after being seen again. A browser in New York saw the team's day.

**3. Implementation:** one clock for the app (`kit/clock`), read on each minute boundary while a view listens and at once when the page is seen again, stopped when none listens; `useNow` for the Overview and Funding, `useToday` drawing again only when the day changes; the overview model counts overdue decisions with the Decisions place's rule; `daysLate` and `overdueText` in the kit; `.pb-relative.is-overdue` for a passed date, `.pb-card__date` and `.pb-signal` on cards; the strip's dates in one round box, today's filled.

**4. Mapping**

- **Vision:** today is the strip's one solid spot; overdue is red with its age.
- **Wayfinding:** the strip starts at today, whatever the hour the page was opened.
- **Memory:** the age is written, not worked out.
- **Language:** "1 day overdue", one wording everywhere.
- **Decision:** the tile names the overdue decisions.
- **Emotion:** the view stays true while it is left open.

### Editing what was recorded: next steps, meetings, partners, funding dates (built, `components/shared/relationship/`, `records/opportunity/`; ticket 47)

The Lead and Opportunity audits stand. Found while testing every editor's controls on 2026-11-17.

**1. Checkpoints**

1. **Vision and attention.** Edit sits beside Remove on each open next step and history entry, as a quiet icon; a meeting whose time has passed shows "Record how it went" in words, the one action that row needs.
2. **Wayfinding.** "Update the next step" and "Record how it went" in Needs attention now lead to a control that does it, on the record they open.
3. **Memory and semantics.** An edit opens in place with what was stored, so nothing is retyped.
4. **Language.** The panel's words reused ("Record how it went"); "Decide by" and "Expected opening" as in Coming up; partner statuses from the vocabulary.
5. **Decision making.** A funding opportunity's decide-by date can be set while it is evaluated, so the decision has its date.
6. **Emotion.** No more removing and re-adding a meeting to say it happened.

**2. Concepts weighed:** a side peek per entry (heavy for a line of text), a modal (breaks the page), editing in place (chosen: the pattern People and Settings already use).

**3. Implementation:** inline edit with Save and Cancel in the shared sections; status as an inline select (`.pb-select--inline`), as conditions do; dates as date fields shown by status.

**4. Mapping**

- **Vision:** one worded action on the row that needs it.
- **Wayfinding:** the panel's fixes reach a control.
- **Memory:** edits start from what is stored.
- **Language:** the panel's and Coming up's words.
- **Decision:** decide-by dates can be set.
- **Emotion:** no remove-and-re-add.

### A shared space reads from its server (built, `components/data/`, `kit/live-drive/`, `components/serverWrites.ts`; tickets 48, 49)

**1. Checkpoints.** *Vision:* nothing moves on screen; records come from the space's server, so a member's first visit shows the space as it is instead of an empty one. *Wayfinding:* unchanged. *Memory:* the same controls; a change made by a colleague appears within seconds without reloading. *Language:* one new save state, "Can't reach the server", in the save state's place and look. *Decision:* a refused change says why beside the control, as before, instead of waiting unsent. *Emotion:* nothing a member does can leave changes stuck; a member's record is accepted like the owner's.

**2. Concepts weighed:** swapping Connect's client for the whole page as the vault does (two packages would fight over it), syncing through Connect and repairing refusals (the server refuses whole batches), and the app keeping its own live copy of a shared space (chosen).

**3. Implementation:** a live copy per space read from its server and kept current by the server's change feed, with a slow re-read as a safety net; writes go to the server and the reply updates the copy at once. A space kept only in the browser stays on Connect.

**4. Mapping**

- **Vision:** the place shows the space's content on a member's first visit.
- **Wayfinding:** no change.
- **Memory:** colleagues' changes appear without a reload.
- **Language:** "Can't reach the server" joins the save states.
- **Decision:** refusals are named where the change was made.
- **Emotion:** no change waits unsent.

### Moving a lead on the Leads board (built, `views/leads/LeadsBoard.tsx`, `components/shared/board/`)

The Leads audit and *Moving a card on the board* stand. This covers one change: the Leads board, one column per status, takes a dragged card the way the Overview's stages do.

**1. Checkpoints**

1. **Vision and attention.** While a card is in the hand the columns are the only thing to look at, as on the Overview: those that take it tint in the accent blue, the one under the card deeper, those that refuse it fade, and each shows its one line. The card lifts and its place fades. No coloured edge on any column or card.
2. **Wayfinding.** On this board a column is a status, so a drop names its status and nothing is picked after it. The question, when there is one, stands in the column the card was put on; Escape or Cancel gives the focus back to the card, which never left its place.
3. **Memory and semantics.** The same drag as the Overview and every CRM board, and the same "Move to…" list on each card for the keyboard and touch. A move sends the lead page's own action and follows its rules, so the board and the page never disagree.
4. **Language.** Status names from the vocabulary. One line per column: "Becomes Met", "Becomes Lost · asks why", "Becomes Won · asks to confirm", "Comes off hold · returns to Met". Refusals say what to do first: "Give the lead an owner first", "Take it off hold first: it returns to Met", "An investor lead goes no further than met".
5. **Decision making.** What a drop does shows before letting go. An active status is set at once. Lost and Parked ask why, and the move waits for the reason. Won has no reason to give but is final, so it asks once: the focus starts on Cancel and the button says "Mark won". A parked lead goes back only to the status it came from. An owner and an organisation are asked for on the column, not after a failed drop.
6. **Emotion.** Fear: "I dropped it on Won by accident". No final status is one careless drop: Lost needs a reason, Won needs a click on "Mark won", and both carry "Nothing is deleted: a closed lead keeps its history. Closing is final." Parking says it returns to where it was. A refused move leaves the card where it was with the reason beside it.

**2. Concepts weighed**

- **A · Task-oriented:** only the "Move to…" list. Exact, but the board already invites dragging, and the Overview does it.
- **B · Conventional:** free drag, the status set on drop with no question, errors as toasts. Familiar, but Won would close a lead in one drop, and a toast is far from the card.
- **C · Immersive:** columns that widen and preview the card's new look while dragging. The layout would move under the pointer on an eight-column board that already scrolls.

**Chosen:** the Overview's blend, unchanged: B's drag, A's list as the second way in, C's calm one-line hints. One addition for a status board: Won, final without a reason, is confirmed (`confirm`, a new move outcome). Evidence: the lead reducer refuses Lost and Parked without a reason, anything past "to contact" without an owner and an organisation, a status change while parked, and Proposal or Won for an investor lead; the Overview audit's rule that closing is never one careless drop.

**3. Implementation:** the Overview's parts (`pb-card.is-lifted`, `.is-away`, `pb-board__col.is-target`, `.is-over`, `.is-refused`, `pb-board__hint`, `pb-ask`, `pb-card__move`, `pb-card__moves`, `pb-move`, `pb-reassure`, `ErrorLine`) a confirm variant of `pb-ask`, shown on the showcase, and `pb-board--drop`: every column runs the board's full height and the board keeps room under its cards (`--pb-board-drop-h`), so a card can be let go anywhere under a column's head. Without it a column was only as tall as its cards, and a drop in the empty space under a head was refused. The rules are pure, in `kit/overview-view/move.ts` (`leadStatusMove`, `leadStatusTargets`), and a test runs every status, kind, owner and organisation against the lead reducer. The drag itself is `useBoardMove`, shared with the boards to come.

**4. Mapping**

- **Vision:** tinted columns take the card, faded ones do not; the lifted card shows what moves.
- **Wayfinding:** a column is a status; the question stands where the card was put; Escape returns to the card.
- **Memory:** the Overview's drag and "Move to…" list; the lead page's rules and actions.
- **Language:** status names; refusals say what to do first.
- **Decision:** what a drop does shows before it; reasons are asked for when needed; Won is confirmed.
- **Emotion:** no final status in one careless drop; a refused move leaves the card in place with the reason.


### Moving a funding opportunity on the Funding board (built, `views/funding/FundingBoard.tsx`)

The Funding audit and *Moving a lead on the Leads board* stand. This covers one change: Funding gets a board, one column per status in deadline order, beside today's list (Board and List, as on Leads), and its cards move the way the Leads board's do.

**1. Checkpoints**

1. **Vision and attention.** While a card is in the hand the columns are the only thing to look at: those that take it tint, the one under the card deeper, those that refuse it fade, each with its one line. A card shows the funder, the name, the next deadline and its day, the owner and the amount; the deadline stays the line people scan for.
2. **Wayfinding.** Ten columns in the order an opportunity lives: Watching, To evaluate, Deciding, Preparing, Submitted, Next stage, then the four closed ones. The board scrolls sideways and keeps the order of the status path on the opportunity's page. Inside a column the cards keep the list's deadline order.
3. **Memory and semantics.** The Leads board's drag and "Move to…" list; the opportunity page's own moves (`allowedMoves`) and actions, so the board offers only what the page offers by hand.
4. **Language.** Status names from the vocabulary. One line per column: "Becomes To evaluate", "Becomes Rejected · asks why", "Becomes Awarded · asks to confirm", "Go or no-go is decided on its page". Refusals say what to do first: "Give it an owner first", "Mark a submission on its page first", "Move it to To evaluate first: a watched opportunity is evaluated before anything else", "Go or no-go comes first: it is decided on the opportunity's page", "After the go decision a funding opportunity moves on or closes".
5. **Decision making.** Go or no-go is the team lead's decision (FR-13.6): a drop on Preparing or No-go from To evaluate or Deciding changes nothing and offers "Open to decide", with the people mark. Rejected and Withdrawn ask why; Awarded, final without a reason, asks once, with the focus on Cancel. What the opportunity lacks (an owner, a submission with no outcome) is said on the column before the drop.
6. **Emotion.** Fears: "did I close it by accident?", "did I decide go for the team lead?". Closing always passes a reason or a confirmation with "Nothing is deleted: a closed funding opportunity keeps its history. Closing is final."; a drop never decides go or no-go; a refused move leaves the card where it was with the reason beside it.

**2. Concepts weighed**

- **A · Task-oriented:** keep the deadline list only and add a status menu per row. Exact, but the user asked for a board, and a list hides where the work piles up.
- **B · Conventional:** a board of the Overview's four stages. Familiar, but Funding's statuses matter on their own (Submitted is not Preparing), and a stage would ask which status after every drop.
- **C · Immersive:** a timeline of deadlines with cards on it. Strong for dates, but status moves would have no place to land.

**Chosen:** the Leads board's pattern with one column per status, the list kept one click away. Evidence: the opportunity reducer's moves by hand (`MOVES`), its refusal of preparing for the first time and no-go outside the decision, its owner and submission rules, and the reasons it requires for Rejected and Withdrawn.

**3. Implementation:** the Leads board's parts (`pb-board--drop`, `pb-board__hint`, `pb-ask` with its confirm and decision variants, `pb-card__move`, `MoveList`, `ErrorLine`). The rules are pure, in `kit/overview-view/status-moves.ts` (`opportunityStatusMove`, `opportunityStatusTargets`); a test runs every status, owner and submission against the opportunity reducer. The decision question now carries its own line and button (`hint`, `open`, `people`), so the same box opens go or no-go here, approval on the Proposals board and "Start relationship" on the Investors board.

**4. Mapping**

- **Vision:** tinted columns take the card; the deadline stays on every card.
- **Wayfinding:** columns in the order of the status path; the list one click away.
- **Memory:** the Leads board's drag and list; the page's moves by hand.
- **Language:** status names; refusals say what to do first.
- **Decision:** go or no-go stays a person's decision; reasons and confirmation where the reducer and the stakes need them.
- **Emotion:** no close in one careless drop; a refused move leaves the card in place with the reason.

### Moving an investor on the Investors board (built, `views/investors/InvestorsBoard.tsx`, `records/investor-list/`)

The Investors audit and *Moving a lead on the Leads board* stand. This covers one change: the investor list gets a board, one column per state (Listed, Shortlisted, Excluded, Engaged), beside today's list with its tabs (Board and List, as on Leads), and its cards are the list's rows.

**1. Checkpoints**

1. **Vision and attention.** The columns are the narrowing the list exists for: a long Listed column, a short Shortlisted one, the few Engaged. A card shows the list it came from, the name, the website, why it was excluded, and how many funded comparables it has. While a card is in the hand, columns tint or fade with their one line, as on Leads.
2. **Wayfinding.** On the board the tabs give way to the columns, which say the same thing; the list filter stays. Opening a card goes to where its details are: its row in the list, opened, or for an engaged investor its lead. A row asked for from search opens in the list, on that row.
3. **Memory and semantics.** The Leads board's drag and "Move to…" list; the list page's own buttons and actions (Shortlist, Exclude, Put back on the list, Start relationship), each sent to the list document for that row.
4. **Language.** State names from the vocabulary. One line per column: "Becomes Shortlisted", "Becomes Excluded · asks why", "Starts a relationship · opens its panel". Refusals say what to do first: "Shortlist it first: a relationship starts from the shortlist", "An engaged investor is a relationship now: open its lead".
5. **Decision making.** Shortlisting and putting back on the list happen at once. Excluding asks why ("Why exclude it?") with the list's own reassurance, "You can put it back on the list later." Engaging is never done by a drop: it creates the organisation and the investor lead, so the drop changes nothing and offers "Start relationship", which opens the same panel as the list, in the Engaged column, listing what it will create before anything is created.
6. **Emotion.** Fears: "did I just create a lead by dragging?", "did I lose why we excluded them?". A drop creates nothing; the panel says "Nobody is contacted"; an exclusion keeps its reason on the card; a refused move leaves the card where it was with the reason beside it.

**2. Concepts weighed**

- **A · Task-oriented:** keep the tabs and buttons only. Exact, but the user asked for a board, and the narrowing is easier to see as columns.
- **B · Conventional:** free drag, Engaged set on drop. Familiar, but engaging needs an organisation and a lead that must exist first; a drop cannot make them silently.
- **C · Immersive:** a funnel graphic with counts. Appealing, but moving one investor would have no place to land.

**Chosen:** the Leads board's pattern with one column per state, the list one click away, and Start relationship opened, not done, by a drop on Engaged. Evidence: the investor list reducer refuses any change to an engaged row and an exclusion without a reason; engaging needs an organisation and a lead id; the list offers Start relationship from the shortlist only.

**3. Implementation:** the Leads board's parts (`pb-board--drop`, `pb-board__hint`, `pb-ask` with its decision variant, now without the people mark since starting a relationship is not a person-only step, `MoveList`, `ErrorLine`); the Start relationship panel inside a `pb-ask` box in the Engaged column. The rules are pure, in `kit/overview-view/status-moves.ts` (`investorRowMove`, `investorRowTargets`); a test runs every state against the investor list reducer. `useBoardMove` takes a `send` so a row's move goes to its list document.

**4. Mapping**

- **Vision:** the narrowing as columns; the exclusion reason on the card.
- **Wayfinding:** columns for tabs; a card opens its details or its lead.
- **Memory:** the Leads board's drag; the list's own buttons and actions.
- **Language:** state names; refusals say what to do first.
- **Decision:** excluding asks why; engaging opens the panel that says what it creates.
- **Emotion:** a drop creates nothing and contacts nobody; reasons are kept.
