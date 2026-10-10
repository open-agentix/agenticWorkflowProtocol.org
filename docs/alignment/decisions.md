# AWP and OpenAgentix alignment: decision log

| | |
| --- | --- |
| **Status** | Record of the project owner's decisions on the questions of [plan section 5](plan.md#5-decisions-for-the-owner). Decisions D1 and D2 change how this repository works and take effect when the pull request that adds this log is merged (see D1). All other decisions set the direction of AEPs that are still in `Review`; they do not accept any AEP and do not change `v1alpha1`. |
| **Decided** | 2026-10-10 by the project lead (owner of the AWP and OpenAgentix projects) |
| **Recorded by** | @agentix-zero (agent account, no decision rights, see [GOVERNANCE.md](../../GOVERNANCE.md#transparency-written-with-an-agent)) |
| **Related** | [Plan](plan.md), [alignment matrix v2](openagentix-matrix.md), [single source of truth](single-source-of-truth.md), [x-openagentix namespace](x-openagentix-extensions.md), [extension prefix list](../registry/extension-prefixes.md), [AEP process](../aep-process.md) |

> Context. Both AWP and OpenAgentix are alpha and are developed in parallel by the same people;
> today the project's own implementation is the only user of either. The owner therefore allows
> the schema to change where practice shows a gap, and fields that are missing to be added. This
> does not shortcut the AEP process: every change still goes through an AEP and is reviewed as
> described in D16. OpenAgentix keeps no special rights over AWP.
>
> Nothing in this log is a conformance claim or a compliance promise. AWP provides
> machine-readable governance primitives that can help organizations implement and enforce their
> own compliance requirements; compliance depends on the implementation, organizational controls
> and applicable regulatory requirements.

## Contents

1. [Decisions](#1-decisions)
2. [Resulting scope of `v1alpha2`](#2-resulting-scope-of-v1alpha2)
3. [Conflicts and how they are resolved](#3-conflicts-and-how-they-are-resolved)
4. [Path to a conformance statement for OpenAgentix](#4-path-to-a-conformance-statement-for-openagentix)
5. [Changes made in this pull request](#5-changes-made-in-this-pull-request)

## 1. Decisions

Each entry gives the question (plan section 5), the decision and its consequence. "Applied in"
names the files changed in the same pull request.

### D1. AEP process adopted

- **Question 1**: adopt `docs/aep-process.md` before the AEPs move beyond `Draft`? Numbering
  0001-0011 acceptable?
- **Decision**: adopt [docs/aep-process.md](../aep-process.md) for AEPs so that changes stay
  traceable. The numbering 0001-0011 is kept.
- **Consequence**: the process is the change process for larger changes from the merge of this pull
  request on. Adopting it is itself a substantive change under the process in force when this pull
  request was opened ([GOVERNANCE.md, decision process](../../GOVERNANCE.md#decision-process)): it
  needs at least 5 working days of public discussion before the merge. Opened on 2026-10-10 (a
  Saturday), the earliest merge is 2026-10-17. The numbers 0001-0011 count as assigned; the
  "pending maintainer assignment" notes are removed. All eleven AEPs move from `Draft` to `Review`
  (template sections are complete). None is `Accepted`: see D16.
- **Applied in**: `docs/aep-process.md` (status, section 5.1, section 7.0, open questions),
  `GOVERNANCE.md` (decision process), `aep/0000-template.md`, `aep/0001` to `aep/0011` (headers).

### D2. JSON Schema is normative for structure

- **Question 2**: make the schema normative for structure?
- **Decision**: yes. For document structure (field names, types, required fields, closed objects,
  enumerations, patterns) the JSON Schema of an API version is normative. Whether a manifest is
  written as JSON or YAML does not matter: YAML is parsed into the JSON data model (spec 3.1) and
  that value is validated.
- **Consequence**: the specification text stays normative for semantics and runtime behaviour. A
  discrepancy between the two is a defect, fixed by an erratum in whichever artefact is wrong;
  until it is fixed, validators follow the schema for structure. Implementations derive their
  types from the schema (single source of truth), never the other way round. Handled together
  with D1 as a substantive change in this pull request rather than as a separate `Process` AEP,
  because the AEP process is only adopted by the same pull request.
- **Applied in**: `schema/README.md`, `spec/v1alpha1/README.md` (section 2), `single-source-of-truth.md`.

### D3. Required extensions are a prerequisite of strategy A

- **Question 3**: AEP-0011 (`metadata.requiredExtensions`) as a prerequisite of strategy A?
- **Decision**: yes.
- **Consequence**: OpenAgentix does not export a manifest that carries a critical
  `x-openagentix-*` extension until AEP-0011 is part of an API version it targets; from then on
  every critical extension is listed in `metadata.requiredExtensions`. AEP-0011 is on the critical
  path of the plan, together with AEP-0010 (digest).
- **Applied in**: `aep/0011-required-extensions.md`, `plan.md`.

### D4. No prefix wildcards in permissions

- **Question 4**: confirm "no in-segment wildcards; action groups and publish-time enumeration
  instead" (AEP-0002)?
- **Decision**: confirmed.
- **Consequence**: `jira.get_*` stays invalid. Families of tools are granted through action groups
  that are written out explicitly or enumerated at publish time from a reviewed tool list (with
  AEP-0007: the profiles of an MCP catalog). The open question about prefix wildcards is closed.
- **Applied in**: `aep/0002-tool-argument-constraints.md`.

### D5. `when` uses the OpenAgentix expression grammar

- **Question 5**: base `when` on the existing OpenAgentix grammar rather than CEL or JSONPath? Bare
  expression or `${{ }}`?
- **Decision**: base `when` on the existing OpenAgentix grammar (AEP-0001), not CEL.
- **Consequence**: the grammar of AEP-0001 section 3.10 is the starting point; roots are the AWP
  roots (`inputs`, `steps.<id>.outputs.<name>`, `event`, `execution.environment`). The field holds
  a bare expression without `${{ }}`, as AEP-0001 proposes (not asked separately; the owner did not
  object). OpenAgentix's own roots (`steps.<id>.output`) are mapped by the exporter.
- **Applied in**: `aep/0001-conditional-steps.md`.

### D6. Executions may succeed with condition skips

- **Question 6**: may an execution succeed when steps are skipped by a condition?
- **Decision**: yes.
- **Consequence**: success rule of AEP-0001 (every step `succeeded` or `skipped` with reason
  `condition`). A step skipped because a dependency failed still fails the execution.
- **Applied in**: `aep/0001-conditional-steps.md`.

### D7. Own `event` root

- **Question 7**: `${{ event.* }}` as a new root, or always map events to inputs?
- **Decision**: own root `${{ event.* }}` (AEP-0004).
- **Consequence**: the `Expression` pattern gains the `event` root; converters stop mapping events
  to a workflow input.
- **Applied in**: `aep/0004-event-references.md`.

### D8 (and question 17). `Prompt` and `Playbook` are in `v1alpha2`

- **Questions 8 and 17**: `Prompt` and `Playbook` in `v1alpha2` or later; `v1alpha2` scope?
- **Decision**: both kinds are in `v1alpha2`. Question 17 is answered by this decision together
  with D9: see [section 2](#2-resulting-scope-of-v1alpha2).
- **Consequence**: AEP-0005 and AEP-0006 target `v1alpha2`; the examples in AEP-0006 use
  `v1alpha2`. `v1alpha2` grows from six to nine AEPs, which makes the version later and larger
  (see [conflict C2](#c2-a-larger-v1alpha2-depends-on-more-reviews)).
- **Applied in**: `aep/0005-prompt-kind.md`, `aep/0006-playbook-kind.md`, `spec/README.md`, `plan.md`.

### D9. MCP catalog in the `mcp` profile, aligned with the MCP specification

- **Question 9**: catalog as part of the `mcp` profile or a separate profile?
- **Decision**: part of the `mcp` profile, and it must follow the Model Context Protocol
  specification: use the MCP terms for tools, tool annotations, resources and authorization
  (OAuth 2.1, as in OpenAgentix ADR 0016), define tool definition digests, and align field names
  with the MCP specification. The public MCP specification is read as reference data only.
- **Consequence**: AEP-0007 targets `v1alpha2` and is rewritten around MCP terms: catalog entries
  are keyed by the MCP tool `name`; the governance fields (access class, data clearance, well-known
  actions) are AWP fields next to a pinned copy of the MCP tool definition (`name`, `title`,
  `description`, `inputSchema`, `outputSchema`, `annotations`); MCP annotations such as
  `readOnlyHint` are recorded but never decide the access class; a `toolsDigest` pins the
  definitions; MCP resources get their own (read-only) catalog entries; `auth` on an MCP server
  follows the MCP authorization model (protected resource metadata, resource indicators, scopes).
  The MCP specification revision that the field names were checked against is named in the AEP
  and must be re-checked by the reviewer (D16).
- **Applied in**: `aep/0007-mcp-connection-catalog.md`.

### D10. Model catalog prices in an own kind, referenced by digest

- **Question 10**: prices inside manifests or runtime-only?
- **Decision**: own kind `ModelCatalog`, referenced by digest.
- **Consequence**: AEP-0008 keeps the separate kind; the reference from `modelPolicy.catalog`
  carries a **required** `digest` (not optional as drafted), so a workflow names exactly which prices
  and approvals it was reviewed against. Not part of the `v1alpha2` scope named in D8; target
  `v1alpha3` (see [conflict C3](#c3-d10-and-d11-decide-details-but-not-the-target-version)).
- **Applied in**: `aep/0008-model-provider-catalog.md`.

### D11. `contentRetention` is mandatory, with a documented default

- **Question 11**: retention for audit content?
- **Decision**: `contentRetention` becomes a mandatory field with a documented default value when
  content capture is used.
- **Consequence**: when `audit.payload` is not `metadata`, `contentRetention` MUST be present in
  the manifest (validators reject its absence). The specification documents `7d` as the default
  value: authoring tools, converters and exporters MUST write `contentRetention: 7d` explicitly
  when the author did not choose a value, and MUST show it to the author. A runtime never applies
  an implicit retention (see [conflict C4](#c4-mandatory-field-with-a-default-value)). Target
  `v1alpha3` (conflict C3).
- **Applied in**: `aep/0009-audit-payload-levels.md`.

### D12. Neutral list of extension prefixes

- **Question 12**: where does the namespace page live?
- **Decision**: a neutral, informative list of extension prefixes, open to every implementation,
  hosted in this repository and not specific to OpenAgentix.
- **Consequence**: new page [docs/registry/extension-prefixes.md](../registry/extension-prefixes.md)
  with listing rules. OpenAgentix is one entry; its field-level description stays in
  [x-openagentix-extensions.md](x-openagentix-extensions.md) as an alignment document and moves to
  the OpenAgentix repository when OpenAgentix publishes its extension schema there.
- **Applied in**: `docs/registry/extension-prefixes.md`, `x-openagentix-extensions.md`.

### D13. Transition for `openagentix.io/v1alpha1` files (rule chosen by the agent, as delegated)

- **Question 13**: how long OpenAgentix keeps reading `openagentix.io/v1alpha1` files.
- **Decision** (delegated by the owner; both formats are alpha and developed in parallel):
  1. Release **N** is the first OpenAgentix minor release whose publish path writes AWP manifests.
     In release N, legacy files are still accepted for validate, publish and import; every read
     returns a deprecation warning (`legacy_format`) in the API response, the CLI output and an
     audit event, and the file is converted on read with the converter's strict rules.
  2. Release N contains a one-time migration: every published legacy version is converted to its
     effective AWP manifest, which is stored next to the unchanged original source and its source
     digest (published versions stay immutable; nothing is rewritten). Versions that cannot be
     converted strictly are marked `legacy-unconvertible` and listed.
  3. Release **N+1** (the next minor release) rejects legacy files on every write path with an
     error that names the converter (`oax awp convert`). `legacy-unconvertible` versions are
     refused at run time with the same error; they must be republished in AWP form.
  4. No longer support window: alpha versions get none ([aep-process 6.1](../aep-process.md#61-api-versions)),
     and the project's own deployments are the only users.
- **Consequence**: OpenAgentix issue for the importer and migration (see the pull request).
- **Applied in**: this log, `x-openagentix-extensions.md` (section 4, item 5).

### D14. Pinning by vendored copy with `PROVENANCE.json`

- **Question 14**: vendored copy or submodule?
- **Decision**: vendored copy with `PROVENANCE.json`.
- **Consequence**: as in [single source of truth section 3](single-source-of-truth.md#3-pinning-in-openagentix).
  The pin starts with `v1alpha1` at a commit of this repository and moves to a release tag once
  releases with assets exist.
- **Applied in**: `single-source-of-truth.md`.

### D15. `owner` is a team

- **Question 15**: may an OpenAgentix owner be a user?
- **Decision**: `owner` is a team.
- **Consequence**: OpenAgentix exports `metadata.owner.team` (already required by the AWP schema);
  an agent owned by a single user must be assigned to a team before export. No AWP change.
- **Applied in**: this log.

### D16. External reviewer before `Accepted`

- **Question 16**: seek an external reviewer before an AEP becomes `Accepted`?
- **Decision**: yes. The shepherd or reviewer must not be the author; the process lists who or
  which role is needed; no people are invented.
- **Consequence**: new [aep-process section 5.1](../aep-process.md#51-review-before-acceptance). An
  AEP cannot be accepted by its author or by the project lead alone, also not during alpha (no
  self-acceptance). Each AEP lists the reviewer roles it needs in its header. Today no external
  reviewer is identified; a call for reviewers goes to GitHub Discussions. Until reviews exist,
  every AEP stays in `Review`.
- **Applied in**: `docs/aep-process.md`, `aep/0000-template.md`, `aep/0001` to `aep/0011`.

### R1. Conformance wording for OpenAgentix (owner request, same date)

- **Request**: OpenAgentix should be able to say "AWP schema conformant" (alpha).
- **Rule kept**: a conformance claim appears on websites, in READMEs or release notes **only** when
  the AWP conformance suite passes against OpenAgentix's real exports in OpenAgentix's public CI.
  Until then the wording is: "Built to the AWP schema, conformance in progress (alpha)."
- **Consequence**: [aep-process section 7.0](../aep-process.md#70-self-declared-schema-conformance-during-alpha)
  defines what "AWP schema conformant (alpha)" means and the evidence it needs; the OpenAgentix
  implementation page uses the agreed wording. [Section 4](#4-path-to-a-conformance-statement-for-openagentix)
  gives the path.
- **Applied in**: `docs/aep-process.md`, `site/src/content/docs/implementations/*.md`, `README.md`.

Question 17 has no entry of its own: it is answered by D8. R1 is a rule the owner confirmed in the same session; it answers no question of the plan.

## 2. Resulting scope of `v1alpha2`

| AEP | Title | Target | Reason |
| --- | --- | --- | --- |
| 0001 | Conditional steps (`when`) | `v1alpha2` | D5, D6 |
| 0002 | Argument constraints, call limits, no prefix wildcards | `v1alpha2` | D4 |
| 0003 | Typed handoffs | `v1alpha2` | plan |
| 0004 | Event references | `v1alpha2` | D7 |
| 0005 | Kind `Prompt` | `v1alpha2` | D8 |
| 0006 | Kind `Playbook` | `v1alpha2` | D8 |
| 0007 | MCP catalog (in `mcp`, aligned with MCP) | `v1alpha2` | D8 + D9 |
| 0008 | `ModelCatalog` kind, referenced by digest | `v1alpha3` | D10 (not in the D8 list) |
| 0009 | Audit payload levels, mandatory `contentRetention` | `v1alpha3` | D11 (not in the D8 list) |
| 0010 | Digest canonicalisation | `v1alpha2` | plan |
| 0011 | Required extensions | `v1alpha2` | D3 |

`v1alpha2` is cut when every AEP in its scope is `Accepted` or explicitly moved to a later version
by an amendment to this table (an AEP that does not find a reviewer must not block the others).

## 3. Conflicts and how they are resolved

### C1. Adoption of the process versus the current decision rules

D1 and D2 change how decisions are made. The process in force when the pull request was opened
(GOVERNANCE.md) requires at least 5 working days of public discussion for substantive changes.
Resolution: the pull request stays open for that period (earliest merge 2026-10-17); the owner's
decision is the maintainer consensus at its end. No AEP changes status beyond `Review` in the
meantime.

### C2. A larger `v1alpha2` depends on more reviews

D8 and D9 add AEP-0005, 0006 and 0007 to `v1alpha2`; D16 requires an external review before any of
them is accepted. `v1alpha2` therefore needs reviews for nine AEPs, including two large ones
(0006 `Playbook`, 0007 MCP catalog), before it can be cut. Resolution: the scope table above allows
moving a single AEP to `v1alpha3` by an amendment, so that `v1alpha2` is not blocked by the AEP
with the slowest review. OpenAgentix's conformance path ([section 4](#4-path-to-a-conformance-statement-for-openagentix))
starts on `v1alpha1` so that it is not blocked by `v1alpha2` either.

### C3. D10 and D11 decide details, but not the target version

D8 lists the `v1alpha2` scope without AEP-0008 and AEP-0009, while D10 and D11 decide their
content. Resolution: both target `v1alpha3`; their content follows D10 and D11. If the owner wants
them in `v1alpha2`, it is an amendment of the scope table, not a new decision. AEP-0009's
deprecation of `payload: full` moves to `v1alpha3` accordingly.

### C4. Mandatory field with a default value

A field that is mandatory has no default in the usual sense. Resolution (D11): the field is
required in the manifest; the specification documents `7d` as the value that tools write
explicitly when the author does not choose one. Runtimes never assume a retention. This keeps the
author's decision visible in the reviewed and digested manifest.

### C5. Self-acceptance versus the external reviewer

The plan asked whether AEPs could be accepted by the project lead during alpha. D16 requires an
external reviewer, and aep-process requires a Final Comment Period of at least 10 working days.
Resolution: no self-acceptance; AEPs are in `Review` and record the needed reviewer roles. The
term "Proposed" used in discussions corresponds to the `Review` status of the lifecycle.

### C6. "Schema conformant" versus `requiredExtensions`

The owner wants OpenAgentix to be able to say "AWP schema conformant (alpha)" soon, but D3 forbids
exporting manifests with critical extensions before AEP-0011 is in an API version, and AEP-0011
cannot be accepted before an external review (D16). Resolution: the first statement targets
`v1alpha1` and covers only what OpenAgentix really exports: manifests without critical extensions
(the exporter refuses the others with a documented reason, listed as a limitation). The statement
extends to `v1alpha2` once AEP-0011 and the other AEPs are part of it.

### C7. MCP terms are external reference data

D9 asks to align names with the MCP specification. The MCP specification is maintained elsewhere
and changes by revision. Resolution: AEP-0007 names the MCP revision its terms were checked against
(the revision ADR 0016 of OpenAgentix reads), copies no normative MCP text, and treats a later MCP
revision as a reason for an erratum or a new AEP, never as an automatic change.

## 4. Path to a conformance statement for OpenAgentix

Statements are made by the OpenAgentix maintainers in the OpenAgentix repository; AWP lists them
under the rules of [aep-process section 7](../aep-process.md#7-conformance-mark-proposal). Steps,
each tracked as an issue with the label `awp` in OpenAgentix (numbers in the pull request):

1. **Pin**: vendored copy of `schema/awp.v1alpha1.json` and `conformance/` with `PROVENANCE.json`;
   CI step that verifies the hashes (D14).
2. **Exporter**: `agents.md` to effective AWP manifest (`v1alpha1`), JCS digest, `x-openagentix-*`
   extensions; manifests with critical extensions are refused until AEP-0011 is available, then
   listed in `metadata.requiredExtensions` (D3).
3. **Import and validation**: AWP manifests (JSON or YAML) are validated against the pinned schema
   plus the semantic rules; legacy files follow D13.
4. **Harness**: CI job that runs the vendored AWP suite against (a) OpenAgentix's validator (all
   suite cases, accept/reject plus path) and (b) OpenAgentix's real exports (golden examples and
   every shipped example that exports). Report as an artefact.
5. **Statement**: when the job in step 4 passes on `main`, the OpenAgentix maintainers may publish
   "AWP `v1alpha1` schema conformant (alpha)" with suite version, scope and limitations
   ([aep-process 7.0](../aep-process.md#70-self-declared-schema-conformance-during-alpha)). Until
   then: "Built to the AWP schema, conformance in progress (alpha)."
6. **Feature slices** per AEP (`when`, `args`, typed handoffs, `event`, `Prompt`, `Playbook`, MCP
   catalog, `ModelCatalog`, audit retention), each first behind its `x-openagentix-*` extension,
   then switched to the core field when the AEP is in an API version OpenAgentix pins.
7. **Runtime conformance** (profiles `core`, `mcp`, `audit`, ...) needs a runtime test suite on the
   AWP side, which does not exist yet; schema conformance says nothing about runtime behaviour.

## 5. Changes made in this pull request

| File | Change |
| --- | --- |
| `docs/alignment/decisions.md` | This log (new) |
| `docs/alignment/plan.md` | Status, decided questions, updated phases and scope |
| `docs/aep-process.md` | Adopted; section 5.1 (review before acceptance); section 7.0 (schema conformance during alpha); resolved open questions |
| `GOVERNANCE.md` | AEP process adopted; schema normative for structure |
| `aep/0000-template.md` | Reviewer fields |
| `aep/0001`-`0011` | Status `Review`, reviewer requirements, texts consistent with D3-D11 |
| `schema/README.md`, `spec/v1alpha1/README.md` (section 2) | D2 |
| `spec/README.md` | Roadmap table |
| `docs/registry/extension-prefixes.md` | Neutral extension prefix list (new, D12) |
| `docs/alignment/x-openagentix-extensions.md`, `single-source-of-truth.md` | Status lines and references to the decisions |
| `site/src/content/docs/implementations/*.md`, `README.md` | Agreed wording for OpenAgentix |
| `CHANGELOG.md` | `[Unreleased]` entries |
