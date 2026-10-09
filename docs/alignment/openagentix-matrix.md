# OpenAgentix `agents.md` and AWP: alignment matrix v2 and converter evaluation

| | |
| --- | --- |
| **Status** | Draft, informative (non-normative) |
| **AWP version** | `awp.agenticworkflowprotocol.org/v1alpha1` ([specification](../../spec/v1alpha1/README.md), [JSON Schema](../../schema/awp.v1alpha1.json), [conformance suite](../../conformance/README.md)) |
| **OpenAgentix syntax** | `agents.md`, `apiVersion: openagentix.io/v1alpha1` |
| **Source revision read** | open-agentix `main` at commit `245fbc6` (2026-10-09): `packages/core/src/agents/{schema,parser,validate,when}.ts`, `packages/core/src/policy/engine.ts`, `packages/runners/src/executor.ts`, `packages/core/src/control/controller.ts`, `packages/events/src/cron.ts`, `apps/api/src/services/control-plane.ts`, `packages/core/src/canonical.ts`, `docs/agents-md.md`, `docs/mcp.md`, `docs/providers.md`, `docs/budgets.md`, `docs/harnesses.md`, `docs/runners.md`, `examples/` |
| **Previous version** | [docs/mapping-agents-md.md](../mapping-agents-md.md) (v1, revision `57775e2`) |
| **Related** | [x-openagentix extension namespace](x-openagentix-extensions.md), [single source of truth](single-source-of-truth.md), [phased plan and owner decisions](plan.md), AEP drafts [0001](../../aep/0001-conditional-steps.md) to [0011](../../aep/0011-required-extensions.md) |

> **Conformance status.** OpenAgentix is **not** conformant to AWP `v1alpha1`. It implements no
> AWP conformance profile, it does not read AWP manifests today, and it has published no
> conformance statement. Nothing in this document is a conformance claim, and nothing in it may be
> used as one. OpenAgentix work on AWP is in progress; it can only be described as conformant to a
> profile after the public conformance suite passes for that profile and a conformance statement
> with all limitations is published ([spec 11.3](../../spec/v1alpha1/README.md#113-conformance-statement)).

> **Compliance.** AWP provides machine-readable governance primitives that can help organizations
> implement and enforce their own compliance requirements. Neither AWP nor OpenAgentix makes a
> system compliant with any law, regulation or standard.

## Contents

1. [Context: strategy A](#1-context-strategy-a)
2. [What changed since v1](#2-what-changed-since-v1)
3. [Legend](#3-legend)
4. [Field-by-field matrix](#4-field-by-field-matrix)
5. [Behaviour verified in the source](#5-behaviour-verified-in-the-source)
6. [Prototype converter evaluation](#6-prototype-converter-evaluation)
7. [Findings for AWP](#7-findings-for-awp)

## 1. Context: strategy A

The OpenAgentix project decided (2026-10-09) that OpenAgentix will use the AWP manifest natively
("strategy A"): an `agents.md` file becomes a Markdown wrapper whose YAML front matter **is** an AWP
manifest, plus OpenAgentix extension fields named `x-openagentix-*`
([namespace description](x-openagentix-extensions.md)). Both formats are alpha, so gaps found here
are proposed as changes to AWP through the AEP process ([docs/aep-process.md](../aep-process.md),
draft), not added as private fields where they would weaken governance.

This is a decision of the OpenAgentix project about its own syntax. AWP stays vendor neutral: the
proposals in `aep/` are written for any runtime, OpenAgentix has no veto and no fast track
([GOVERNANCE.md](../../GOVERNANCE.md)), and every AEP can be rejected.

The matrix therefore answers, for every `agents.md` field: where does it live in an AWP manifest
under strategy A, is anything lost, and which AEP (if any) would close the gap.

## 2. What changed since v1

| # | Change | Evidence |
| --- | --- | --- |
| 1 | The `agents.md` schema did not change between `57775e2` and `245fbc6`; one example was added (`examples/agents/code-quality-reviewer.md`). It is the first example with profile grants, `maxTokensPerCall`, per-step budgets, two triggers, `runtime.egress` and a `when` over `event`. | `git diff 57775e2 245fbc6` |
| 2 | **Approval timeout is `fail`, not `reject`.** On timeout the executor aborts the run with `approval_timeout`; on rejection it prevents the action, tells the agent and continues. AWP `onTimeout: fail` is the matching value. The v1 sketch used `reject`. | `packages/runners/src/executor.ts` (approval branch) |
| 3 | **`maxSteps` has two meanings in OpenAgentix.** Per agent: model turns of the step loop (and harness turns). Per run (control agent): model calls plus tool calls. AWP counts model invocations plus command executions. Stays `lossy`. | `executor.ts`, `control/controller.ts` (`recordModelCall`, `recordToolCall`), `docs/harnesses.md` |
| 4 | **Cron**: OpenAgentix uses croner, which also accepts a seconds field; the schema only checks a minimum length. Without `timezone` croner uses the process time zone, AWP defaults to `UTC`. | `packages/events/src/cron.ts`, `schema.ts` |
| 5 | **`maxCallsPerRun` is reclassified as security-relevant.** A runtime that ignores it lets an agent repeat a write action (for example "add one comment") up to the run-wide tool call limit. | `policy/engine.ts` (`call_limit`) |
| 6 | **`allowAdditionalArgs: false` is the default and also applies to grants without `args`**: such a grant only allows calls without arguments. A converter has to carry this explicitly. | `policy/engine.ts` (`arg_unknown`) |
| 7 | **`access: read-only`** is a second wall over the tool access classes of the connection. With enumerated grants it adds defence in depth; with profile or wildcard grants it is the actual guarantee. Classified accordingly. | `docs/mcp.md`, `engine.ts` (`profile_write_denied`) |
| 8 | **Schema references** (`$ref: "#/schemas/<name>"`) resolve against the `agents.md` front matter root. Inside an AWP manifest the same pointer would resolve to a non-existent `/schemas`. A native AWP field needs its own reference rule (AEP-0003). | `json-schema.ts`, converter output |
| 9 | **Digest**: OpenAgentix `canonicalJson` sorts keys by UTF-16 code units and serialises strings and numbers with `JSON.stringify`, like JCS (RFC 8785), for values that come from a JSON or YAML parser. Differences exist only for values a parser does not produce (`bigint`, `Date`) and lone surrogates (JCS: invalid). It is used today over the normalised Markdown source, not over a manifest. | `packages/core/src/canonical.ts`, `parser.ts` |
| 10 | The open questions of v1 section 9 now have AEP drafts: 0001 (conditions), 0002 (arguments, wildcards), 0003 (typed handoffs), 0004 (event root), 0008 (provider identifiers), 0002 (per-tool call limits). | `aep/` |

## 3. Legend

| Category | Meaning |
| --- | --- |
| **core** | Carried by an AWP `v1alpha1` core field without loss. A mechanical rename may be needed. |
| **core, lossy** | An AWP field exists, but meaning changes or the converter needs context outside the file (publish context). Not security-relevant. |
| **ext** | No AWP field; carried in an `x-openagentix-*` extension. Another runtime that ignores it does **not** allow more than OpenAgentix allows. |
| **ext, critical** | No AWP field; an extension is the only interim home, and a runtime that ignores it **would allow more** than OpenAgentix (security-relevant). Must not be exported as a portable manifest until the gap is closed (AEP) or the manifest can declare the extension as required (AEP-0011). |
| **context** | The value is defined outside the file (connection, tenant configuration) and cannot be converted without publish context. |
| **AWP only** | AWP feature without an `agents.md` equivalent (see v1 section 4; unchanged). |

"Home under strategy A" is the place in the AWP front matter where the field would be written.

## 4. Field-by-field matrix

AWP paths are relative to the generated `Workflow` manifest. `<a>` is an `agents[]` entry, `<t>` one
of its `tools[]` entries, `<s>` the AWP step generated for `<a>`.

### 4.1 Document, identity and triggers

| `agents.md` field | Home under strategy A | Category | AEP | Notes (verified) |
| --- | --- | --- | --- | --- |
| Markdown container, `# title`, overview, other `## ` sections | stays in the wrapper; not part of the manifest | ext | - | Prose is documentation. The manifest digest does not cover it; the wrapper source digest (OpenAgentix) does ([namespace, section 4](x-openagentix-extensions.md#4-the-markdown-wrapper)). |
| `## Agent: <id>` section | `spec.agents[].instructions` of the **effective manifest** | core | - | The wrapper injects the section text before validation and digest; front matter MUST NOT also set `instructions` for that agent. |
| `apiVersion: openagentix.io/v1alpha1` | `apiVersion: awp.agenticworkflowprotocol.org/v1alpha1` | core | - | Fixed rewrite. |
| `kind: Agent` / `AgentPipeline` | `kind: Workflow` | core | - | A single-agent `Agent` is a one-step `Workflow` (an AWP `Agent` cannot run alone). |
| `name`, `version`, `description` | `metadata.name`, `.version`, `.description` | core | - | Slug is a subset of AWP names; both use SemVer 2.0.0. |
| `owner` (slug) | `metadata.owner.team` | core, lossy | - | Owner may denote a user; unresolved (owner decision 15 in [plan](plan.md#5-decisions-for-the-owner)). |
| `classification` (default `internal`) | `metadata.classification` | core | - | Written explicitly (AWP has no default). |
| `labels` | `metadata.labels` | core, lossy | - | Keys outside `^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,127}$` cannot be converted. All examples comply. |
| source digest | `metadata.annotations["openagentix.io/source-digest"]` in exports; `metadata.integrity.digest` = JCS digest of the effective manifest | core, lossy | 0010 | Two digests over two byte sequences; see change 9 and AEP-0010. |
| `triggers: manual` | `spec.triggers[].type: manual` (or absent) | core | - | |
| `triggers: cron` | `{type: schedule, cron, timezone}` | core, lossy | - | Only 5-field expressions; `timezone` written explicitly (change 4). |
| `triggers: webhook`, `mail` | `{type: event, source, eventType}` | core, lossy | 0004 | `eventType` is a convention (`webhook.received`, `mail.received`). The event payload has no expression root today; the converter declares an `object` input `event`. |
| `triggers: kafka` | `{type: event, source: kafka, eventType: message, filter: {topic}}` | core, lossy | 0004 | `filter` semantics are implementation-defined. |

### 4.2 Budgets and approvals

| `agents.md` field | Home under strategy A | Category | AEP | Notes (verified) |
| --- | --- | --- | --- | --- |
| `budget.maxCostUsd` | `spec.budget.maxCostUsd` | core | - | |
| `budget.maxTokens` | `spec.budget.resources.maxTokens` | core | - | |
| `budget.maxToolCalls` | `spec.budget.resources.maxToolCalls` | core | - | Equal while OpenAgentix has no command steps or remote agents. |
| `budget.maxSteps` | `spec.budget.maxSteps` | core, lossy | - | Change 3. |
| `budget.timeoutSeconds` | `spec.budget.maxDuration` (`<n>s`) | core | - | |
| `<a>.budget` | `spec.agents[].budget` | core | - | Smaller limit wins in both. |
| `<a>.maxTokensPerCall`, `<a>.temperature` | `spec.agents[].x-openagentix-model` | ext | - | Model parameters are an AWP non-goal (spec 1.3). |
| `approvals.approverRoles` | `spec.approval.approvers[].role` | core, lossy | - | OpenAgentix RBAC roles; resolution is runtime-defined in AWP. Needs the `governance` profile. |
| `approvals.timeoutSeconds` | `spec.approval.timeout` | core | - | |
| approval timeout behaviour | `spec.approval.onTimeout: fail` | core | - | Change 2 (verified). |
| `<t>.approval: required` | `spec.approval.requiredFor: [<server>.<tool>]` | core | - | |
| `approvals` without any approval-required tool | dropped | core, lossy | - | No effect in OpenAgentix either. |

### 4.3 Agents, steps and runtime

| `agents.md` field | Home under strategy A | Category | AEP | Notes (verified) |
| --- | --- | --- | --- | --- |
| `agents[]` | `spec.agents[]` (inline agents) | core | - | |
| `pipeline` | `spec.workflow[]`, chain via `dependsOn` | core, lossy | 0001 | Linear chain is expressible. With `when` the success rule differs (AEP-0001). |
| `<a>.id` | `spec.agents[].id` and `spec.workflow[].id` | core | - | |
| `<a>.description` | `spec.agents[].x-openagentix-description` | ext | - | AWP inline agents have no description. |
| `<a>.provider` | `spec.agents[].model.provider` | core, lossy | 0008 | A tenant connection name, not a stable provider identifier. |
| `<a>.model` | `spec.agents[].model.name` | core | - | |
| `<a>.outputs[].format` / `.target` | `spec.agents[].x-openagentix-outputs` | ext | - | `target` is an action in AWP terms; no example uses it. |
| `<a>.simulation` | `spec.agents[].x-openagentix-simulation` | ext | - | `{{...}}` placeholders are inside an extension subtree, which AWP validators do not scan. |
| `runtime.runner`, `runtime.toolbox`, `<a>.toolbox`, `<a>.runtime.runner` | `spec.x-openagentix-runtime`, `spec.agents[].x-openagentix-runtime` | ext, critical | 0011 | Placement and isolation. Ignoring `runner: container` would run the step without isolation. |
| `<a>.runtime.harness` | `spec.agents[].x-openagentix-runtime.harness` | ext | - | A harness only changes the executor; the policy gate stays the only tool source. |
| `runtime.egress`, `<a>.runtime.egress` | `spec.agents[].permissions.network: {egress: deny, allowHosts}` | core, lossy | - | AWP applies network rules to command steps and built-in tools; OpenAgentix to the worker or run node. Written per agent, not at workflow level (a workflow-level `permissions` with `default: deny` would deny every tool, spec 7.5.4). |
| `mode: dark-factory` | `spec.x-openagentix-mode` | ext | - | Ignoring it yields standard mode, which is stricter. |
| `guidelines` | `spec.x-openagentix-guidelines` | ext, critical | 0011 | Guidelines are turned into policy bundles (`guidelinesToPolicyBundle`); ignoring them removes restrictions. Long term: publish enforceable rules as AWP `Policy` manifests. |

### 4.4 Tools and permissions

| `agents.md` field | Home under strategy A | Category | AEP | Notes (verified) |
| --- | --- | --- | --- | --- |
| `<t>.server` | `spec.agents[].tools[]: {type: mcp, server}` | core, lossy | 0007 | Connections are platform objects; `spec.mcpServers` needs publish context, otherwise runtime binding (`mcp.server-unresolved` warning). Needs the `mcp` profile. |
| `<t>.tool` (exact) | `tools[].tools: [<tool>]` + `permissions.tools["<server>.<tool>"]: {allow: true}` with `default: deny` | core | - | `server/tool` becomes `server.tool`. |
| `<t>.tool: "*"` | `permissions.tools["<server>.*"]` | core | - | |
| `<t>.tool: "<prefix>*"` | none | ext, critical | 0002 | Recommendation: enumerate into an action group at publish (AEP-0002, decision against prefix wildcards). |
| `<t>.args` | `permissions.tools.<key>.x-openagentix-args` | ext, critical | 0002 | |
| `<t>.allowAdditionalArgs` (default `false`) | `permissions.tools.<key>.x-openagentix-allowAdditionalArgs` | ext, critical | 0002 | Change 6. |
| `<t>.maxCallsPerRun` | `permissions.tools.<key>.x-openagentix-maxCallsPerRun` | ext, critical | 0002 | Change 5. |
| `<t>.classification` | `permissions.tools.<key>.x-openagentix-classification`; long term a `Policy` rule | ext, critical | - | Expressible today only with a `Policy` manifest (governance profile). No example uses it. |
| `{server, profile}` | `spec.actionGroups["<server>.<profile>"]` + `permissions.tools["<server>.<profile>"]` | context | 0007 | Members live in the connection. Without publish context the group is empty, which grants nothing (fail closed, but the manifest is not equivalent). |
| `<a>.access` | `spec.workflow[].x-openagentix-access` | ext (enumerated grants) / ext, critical (profile or wildcard grants) | 0007 | Change 7. |
| `<a>.credentials[]` | `spec.secrets[]` (`source: openagentix`, `scope: [<agent id>]`, `key` when renamed) + `permissions.secrets`; env names in `spec.agents[].x-openagentix-credentialEnv` | core, lossy | - | AWP secret names are narrower than OpenAgentix references. |

### 4.5 Data flow and conditions (ADR 0008)

| `agents.md` field | Home under strategy A | Category | AEP | Notes (verified) |
| --- | --- | --- | --- | --- |
| `schemas` | `spec.x-openagentix-schemas` | ext, critical | 0003 | Change 8. |
| `<a>.input.schema` | `spec.workflow[].x-openagentix-input.schema` | ext, critical | 0003 | |
| `<a>.input.from` | `dependsOn` + `task` references + `spec.workflow[].x-openagentix-input.from` | ext, critical | 0003, 0004 | The isolation guarantee ("sees exactly these sources") has no AWP field. |
| `<a>.output.schema`, `.onInvalid` | `spec.workflow[].x-openagentix-output` | ext, critical | 0003 | |
| `<a>.when` | `spec.workflow[].x-openagentix-when` | ext, critical | 0001 | Ignoring it runs a write step that OpenAgentix would skip. |
| implicit hand-over (previous step output) | `outputs: [{name: result}]` + `task` with `${{ steps.<prev>.outputs.result }}` | core | - | The converter declares one output per step. |
| event payload for the first step | `spec.inputs: [{name: event, type: object}]` + `${{ inputs.event }}` | core, lossy | 0004 | |

## 5. Behaviour verified in the source

| Question (v1 section 9.7) | Answer at `245fbc6` | Consequence |
| --- | --- | --- |
| Approval timeout outcome | Run fails with `approval_timeout`. Rejection: action not executed, agent informed ("Rejected by a human approver"), run continues. | `onTimeout: fail`; rejection matches AWP section 7.6. |
| Meaning of `budget.maxSteps` | Agent: model turns of the step loop (and harness turns). Run: model calls plus tool calls (control agent). | `lossy`; documented in the converter output. |
| Cron field count, default time zone | croner (5 fields, optional seconds); schema checks only length >= 9; default time zone of the process. | Only 5-field schedules convert; `timezone` written explicitly. |
| Is `owner` always a team? | It is a slug; the schema cannot tell. | Open: owner decision. |
| Argument rules without `args` | `allowAdditionalArgs` defaults to `false`; with no `args` only argument-less calls pass. | AEP-0002 makes absence of `args` mean "unrestricted" for backwards compatibility; OpenAgentix must write `args: {}` explicitly to keep its default. |

## 6. Prototype converter evaluation

### 6.1 Method

A throwaway Node.js script (not committed; it used the pinned `yaml` development dependency of
this repository, so it is not zero-dependency) read each `agents.md` file, applied the defaults of
`packages/core/src/agents/schema.ts`, and wrote one AWP `Workflow` manifest per file following the
homes of [section 4](#4-field-by-field-matrix): AWP core fields where they exist, `x-openagentix-*`
fields otherwise. It computed `metadata.integrity.digest` with the reference implementation
(`manifestDigest` in `conformance/semantic.mjs`) and validated each output with the reference
checker (`validateText` of `conformance/awp-check.mjs`):

1. with the minimal profile set the manifest needs (`core`, plus `mcp` for MCP tool sources, plus
   `governance` for `spec.approval`) and `--verify-digest`;
2. with all six profiles;
3. with `core` only.

Each source field produced one finding with a category of [section 3](#3-legend). A file is
**clean** without findings above `core`, **lossy** with only `core, lossy` or `ext` findings
(strict mode would convert it with warnings), and **fails (strict)** with any `ext, critical` or
`context` finding: strict mode refuses to produce a portable manifest, because another runtime would
run it with fewer restrictions ([v1 section 6.3](../mapping-agents-md.md#63-loss-handling)). The
converter is not the OpenAgentix validator: it assumes its inputs are valid `agents.md` files (all
are in the repository's tests or examples).

Corpus: the four example files in `examples/` (primary), plus the six demo agents in
`apps/api/src/demo/agents.ts` and the editor template in `apps/ui/src/features/agents/template.ts`
(secondary). Two demo agents are byte-identical to examples (same digests). Front matter fragments
in design documents (`docs/showcase-agents.md`, `docs/demo-repo-agent.md`,
`docs/dogfooding-phase-1.md`) were not converted: they have no Markdown body and are drafts.

### 6.2 Results: primary corpus (`examples/`)

| Example | Result | Valid AWP (min. profiles, digest verified) | Valid with `core` only | Critical / context findings | Lossy / ext findings | Blocking gaps (AEP) |
| --- | --- | --- | --- | --- | --- | --- |
| `cve-triage.agents.md` | **fails (strict)** | yes (`core`, `mcp`) | no: MCP tool sources need `mcp` | 5 / 0: argument constraints (2), `allowAdditionalArgs` (2), `maxCallsPerRun` (1) | 5 / 4 | 0002 |
| `ticket-triage.agents.md` | **fails (strict)** | yes (`core`, `mcp`) | no: `mcp` | 12 / 0: arguments (5), `input.from` (2), input/output schemas (3), named schemas (1), `when` (1) | 9 / 4 | 0001, 0002, 0003 |
| `ticket-updater.agents.md` | **fails (strict)** | yes (`core`, `governance`, `mcp`) | no: `mcp`, `governance` (approval) | 5 / 0: arguments (5) | 5 / 2 | 0002 |
| `agents/code-quality-reviewer.md` | **fails (strict)** | yes (`core`, `governance`, `mcp`) | no: `mcp`, `governance` | 14 / 3: profile grants without publish context (3), `maxCallsPerRun` (3), handoffs (8), read-only over profiles (2), `when` (1) | 14 / 6 | 0001, 0002, 0003, 0007 |

**Summary: 0 of 4 examples convert cleanly, 0 of 4 convert in strict mode; 4 of 4 produce AWP
manifests that pass the JSON Schema, the semantic rules and digest verification in lossy mode.**
In lossy mode the critical fields are only carried in extensions, which another runtime ignores;
those manifests must therefore not be published as portable AWP manifests.

Findings that occur in every file and are resolvable by publish context, not by AWP changes:
`owner` (team or user), `provider` (connection name versus provider identifier, AEP-0008 adds a
catalog), `maxSteps` (counting rule). They keep every file out of the **clean** category.

### 6.3 Results: secondary corpus

| Source | Result | Valid AWP | Blocking gaps |
| --- | --- | --- | --- |
| `demo/agents.ts#CVE_TRIAGE` | fails (strict) | yes | 0002 (identical to `examples/cve-triage.agents.md`) |
| `demo/agents.ts#TICKET_UPDATER` | fails (strict) | yes | 0002 (identical to `examples/ticket-updater.agents.md`) |
| `demo/agents.ts#FEATURE_BUILDER` | fails (strict) | yes | 0002 |
| `demo/agents.ts#HARDENING_REVIEW` | lossy | yes, also with `core` only | - |
| `demo/agents.ts#RELEASE_WATCH` | fails (strict) | yes | 0002 |
| `demo/agents.ts#LOG_SUMMARY` | lossy | yes, also with `core` only | - |
| `ui/.../template.ts#AGENT_TEMPLATE` | lossy | yes, also with `core` only | - |

3 of 7 convert in strict mode (with warnings); all three have no tools.

### 6.4 What the AEPs would change

If the AEPs were accepted as drafted (not a prediction that they will be):

| After | Strict mode converts |
| --- | --- |
| AEP-0002 (argument constraints, call limits) | `cve-triage`, `ticket-updater`, and the demo agents `FEATURE_BUILDER`, `RELEASE_WATCH` |
| + AEP-0001 and AEP-0003 | `ticket-triage` |
| + AEP-0007 and publish context for the connection profiles | `code-quality-reviewer` |

The remaining `lossy` findings (`owner`, `provider`, `maxSteps`, trigger `eventType`) are
conventions that the OpenAgentix side has to settle; AEP-0004 and AEP-0008 reduce two of them.

### 6.5 Reproduction

The script is not part of this repository. The procedure is: parse the front matter with a YAML 1.2
parser, apply the defaults of `schema.ts`, build the manifest as in section 4, compute
`manifestDigest`, then run
`node conformance/awp-check.mjs check --profiles core,mcp[,governance] --verify-digest <file>`.
A maintained converter belongs into the OpenAgentix repository, with the example files as golden
tests ([single source of truth](single-source-of-truth.md#4-ci-steps-in-openagentix)).

## 7. Findings for AWP

1. **Conditions, argument constraints, call limits and typed handoffs are the gap.** Every
   security-relevant loss in the corpus falls into AEP-0001, 0002 or 0003.
2. **AWP has no way to make an extension mandatory.** Strategy A needs interim extensions for
   exactly these fields; without a "required extensions" marker another runtime silently ignores
   them, which spec 3.3 is meant to prevent. AEP-0011 proposes the marker.
3. **Workflow-level `permissions` interacts with agent-level ones.** A converter that puts
   `network` restrictions on `spec.permissions` (with the default `default: deny`) denies every
   tool. Spec 7.5.4 is correct but easy to misuse; an informative note or a lint rule would help.
4. **The event payload needs a root** (AEP-0004); mapping it to an input works but hides that the
   value comes from an external, untrusted sender.
5. **Profiles of connections are catalog data** (AEP-0007): tool access classes and named tool sets
   are what makes a read-only guarantee checkable.
