# Mapping OpenAgentix `agents.md` to AWP v1alpha1

| | |
| --- | --- |
| **Status** | Draft, informative (non-normative) |
| **AWP version** | `awp.agenticworkflowprotocol.org/v1alpha1` ([specification](../spec/v1alpha1/README.md), [JSON Schema](../schema/awp.v1alpha1.json), [conformance suite](../conformance/README.md)) |
| **OpenAgentix syntax** | `agents.md`, `apiVersion: openagentix.io/v1alpha1` ([open-agentix/open-agentix](https://github.com/open-agentix/open-agentix): `docs/agents-md.md`, `packages/core/src/agents/schema.ts`, `packages/core/src/agents/validate.ts`) |
| **Source revision read** | open-agentix `main` at commit `57775e2` (2026-10-09) |
| **Newer version** | [docs/alignment/openagentix-matrix.md](alignment/openagentix-matrix.md) (v2: strategy A, verified behaviour, converter evaluation). Where the two differ, v2 applies; notably the approval timeout maps to `onTimeout: fail`, not `reject`. |

> **Conformance status.** OpenAgentix is **not** conformant to AWP `v1alpha1`. It does not
> implement any AWP conformance profile today (not `core`, `governance`, `audit`, `security`,
> `mcp` or `a2a`), it does not read AWP manifests, and it has not published a conformance
> statement ([spec section 11.3](../spec/v1alpha1/README.md#113-conformance-statement)). Nothing in
> this document is a conformance claim. It describes the distance between the two formats and
> what would have to be built before a claim could be made honestly.

> **Compliance.** AWP provides machine-readable governance primitives that can help organizations
> implement and enforce their own compliance requirements. Neither AWP nor OpenAgentix makes a
> system compliant with any law, regulation or standard.

AWP is a specification, not a platform. OpenAgentix is one implementation effort among possible
others and has no special status in the specification process ([GOVERNANCE.md](../GOVERNANCE.md)).
This document exists because OpenAgentix is the first project that intends to implement AWP, and a
precise mapping shows where the specification and an existing syntax disagree. Findings that point
at gaps in AWP are input for future AWP Enhancement Proposals ([AEP process](aep-process.md), adopted 2026-10-10),
not commitments.

## Contents

1. [Overview of the two formats](#1-overview-of-the-two-formats)
2. [Legend](#2-legend)
3. [Field-by-field mapping](#3-field-by-field-mapping)
4. [AWP features without an `agents.md` equivalent](#4-awp-features-without-an-agentsmd-equivalent)
5. [Semantic differences that are not visible in the field tables](#5-semantic-differences-that-are-not-visible-in-the-field-tables)
6. [Migration path: converter design](#6-migration-path-converter-design)
7. [Round-trip expectations](#7-round-trip-expectations)
8. [What OpenAgentix must implement per conformance profile](#8-what-openagentix-must-implement-per-conformance-profile)
9. [Open questions](#9-open-questions)

## 1. Overview of the two formats

| Aspect | `agents.md` (`openagentix.io/v1alpha1`) | AWP manifest (`awp.agenticworkflowprotocol.org/v1alpha1`) |
| --- | --- | --- |
| Container | Markdown file with a YAML front matter block; agent instructions come from `## Agent: <id>` sections | Pure YAML 1.2 or JSON document; several YAML documents per file allowed |
| Kinds | `Agent` (exactly one agent), `AgentPipeline` | `Workflow`, `Agent` (reusable, not executable alone), `Policy` |
| Structure | Flat front matter: identity, triggers, budget, approvals, runtime, `agents[]`, `pipeline` | `metadata` (identity, governance metadata, integrity) and `spec` (kind-specific) |
| Execution model | Linear `pipeline` of agent ids; optional `when` conditions skip steps | Directed acyclic graph of steps (`dependsOn`); step types `agent`, `command`, `approval`; no conditions |
| Data flow | Whole JSON output of earlier steps, optionally typed with JSON Schema (`input`, `output`, `schemas`) | Named step outputs referenced with `${{ steps.<id>.outputs.<name> }}` in expression-enabled fields; typed workflow `inputs` |
| Tools | Grants on platform-managed MCP connections (`server` + `tool`, argument constraints, profiles) | Tool sources (`type: mcp`, `builtin`), optional `mcpServers` declarations, action identifiers, `permissions` |
| Governance | Classification (4 levels), per-tool approval, approver roles, policy bundles managed through the platform API | Ownership, 7 data classes, data residency, model policy, approvals with separation of duties, risk levels, environments, `Policy` manifests |
| Unknown fields | Rejected (zod `strictObject`) | Rejected, except `x-` extension fields ([spec 3.3](../spec/v1alpha1/README.md#33-unknown-fields-and-extensions)) |
| Identity of a version | `name` + SemVer `version`; digest = SHA-256 of the normalized Markdown source | `kind` + `metadata.name` + `metadata.version`; digest = SHA-256 over the RFC 8785 (JCS) serialization without `integrity`, `signature`, `provenance` |

Both formats share important design choices: fail-closed parsing of unknown fields, SemVer
versions with immutable published versions, lowercase slug identifiers, nested budgets where the
smaller limit wins, and approvals by role.

## 2. Legend

| Category | Meaning |
| --- | --- |
| **clean** | The value can be carried over without loss of meaning. A mechanical rename or restructuring may be needed. |
| **lossy** | A mapping exists, but information or semantics are lost or changed, or the converter needs context outside the file. The notes say what is lost. |
| **none** | `agents.md` field without an AWP equivalent. It can only be carried in an `x-openagentix` extension field, which other runtimes ignore ([spec 3.3](../spec/v1alpha1/README.md#33-unknown-fields-and-extensions)). |
| **AWP only** | AWP feature that `agents.md` cannot express ([section 4](#4-awp-features-without-an-agentsmd-equivalent)). |

A **security-relevant** loss is one where a runtime that ignores the `x-openagentix` extension
would allow more than OpenAgentix allows (for example argument constraints or `when`). The
converter treats these as errors by default ([section 6.3](#63-loss-handling)).

## 3. Field-by-field mapping

AWP paths are written relative to the generated `Workflow` manifest. `<a>` stands for an
`agents[]` entry of `agents.md`, `<t>` for one of its `tools[]` entries.

### 3.1 Document and identity

| `agents.md` field | AWP target | Category | Notes |
| --- | --- | --- | --- |
| front matter + Markdown body | one YAML/JSON manifest | lossy | The Markdown container disappears. Instructions move into `spec.agents[].instructions`; title, overview and other `## ` sections have no AWP field (see below). |
| `apiVersion: openagentix.io/v1alpha1` | `apiVersion: awp.agenticworkflowprotocol.org/v1alpha1` | clean | Fixed rewrite. The two `v1alpha1` labels are unrelated; neither format promises stability. |
| `kind: AgentPipeline` | `kind: Workflow` | clean | |
| `kind: Agent` | `kind: Workflow` with one agent and one agent step | clean | An AWP `Agent` manifest cannot run on its own and has no `triggers`, so the executable meaning of an `agents.md` `Agent` is a one-step `Workflow`. A converter MAY additionally emit an AWP `Agent` manifest for reuse ([spec 6](../spec/v1alpha1/README.md#6-kind-agent)). |
| `name` | `metadata.name` | clean | `agents.md` slugs (`^[a-z][a-z0-9-]{0,62}$`) are a subset of AWP names. |
| `version` | `metadata.version` | clean | Both require SemVer 2.0.0. `agents.md` checks it at publish (`checkDefinition`); AWP checks it at validation. |
| `description` | `metadata.description` | clean | |
| `owner` (slug) | `metadata.owner.team` | lossy | AWP requires a team. The `agents.md` owner is a platform slug; if it denotes a user rather than a team, the meaning changes. `contact`, `businessOwner`, `technicalOwner`, `dataOwner` are AWP only. |
| `classification` (default `internal`) | `metadata.classification` | clean | Same four names with the same order and ranks (`public` 0, `internal` 1, `confidential` 2, `restricted` 3). The converter MUST write the value explicitly because the `agents.md` default is implicit and AWP has no default. |
| `labels` | `metadata.labels` | lossy | AWP restricts keys to `^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,127}$`; `agents.md` accepts any string key. Keys outside the AWP pattern cannot be converted. |
| `# title` (Markdown) | none (`metadata.description` or `metadata.annotations`) | none | Free text. Annotations MUST NOT drive governance decisions, which is fine for prose. |
| overview text and other `## ` sections | none | none | Carried as `x-openagentix.markdown` for round trips. |
| digest (SHA-256 of normalized source) | `metadata.integrity.digest` | lossy | Different input (Markdown source vs. JCS of the manifest). The values never match; the converter computes a new AWP digest and MAY record the source digest as an annotation (for example `openagentix.io/source-digest`). |

### 3.2 Triggers

| `agents.md` field | AWP target | Category | Notes |
| --- | --- | --- | --- |
| `triggers` default `[{type: manual}]` | `spec.triggers` absent or `[{type: manual}]` | clean | AWP: absent triggers mean manual start only. |
| `{type: manual}` | `{type: manual}` | clean | |
| `{type: cron, schedule, timezone}` | `{type: schedule, cron, timezone}` | lossy | AWP requires a 5-field cron expression and defaults to `UTC`. `agents.md` only checks a minimum length; 6-field expressions (seconds) cannot be converted, and the default time zone of OpenAgentix must be written explicitly. |
| `{type: webhook, source}` | `{type: event, source, eventType}` | lossy | AWP requires `eventType`; `agents.md` has none. The converter has to choose an implementation-defined value (for example `webhook.received`) and document it. `source` is a platform source slug in OpenAgentix and an opaque string in AWP. |
| `{type: mail, source}` | `{type: event, source, eventType}` | lossy | As webhook, for example `eventType: mail.received`. |
| `{type: kafka, topic}` | `{type: event, source, eventType, filter}` | lossy | No AWP field for a topic. Possible convention: `source: kafka`, `eventType: message`, `filter: {topic: <topic>}`; the semantics of `filter` are implementation-defined. |

### 3.3 Budgets

| `agents.md` field | AWP target | Category | Notes |
| --- | --- | --- | --- |
| `budget.maxCostUsd` | `spec.budget.maxCostUsd` | clean | |
| `budget.maxTokens` | `spec.budget.resources.maxTokens` | clean | |
| `budget.maxToolCalls` | `spec.budget.resources.maxToolCalls` | lossy | AWP counts every action (tool calls, command steps, remote agent messages). Equal for `agents.md`, which has only tool calls. |
| `budget.maxSteps` | `spec.budget.maxSteps` | lossy | AWP: every model invocation and command execution counts as one step. The OpenAgentix meaning (agent loop iterations) must be compared before the mapping is called clean. |
| `budget.timeoutSeconds` | `spec.budget.maxDuration` | clean | `timeoutSeconds: 900` becomes `maxDuration: 900s`. |
| `<a>.budget` | `spec.agents[].budget` | clean | Both formats apply the smaller limit when agent and pipeline disagree. |
| `<a>.maxTokensPerCall` | none | none | Per-call model parameter. AWP has no model API parameters ([spec 1.3](../spec/v1alpha1/README.md#13-non-goals)). |

### 3.4 Approvals

| `agents.md` field | AWP target | Category | Notes |
| --- | --- | --- | --- |
| `approvals.approverRoles` (default `operator`, `admin`) | `spec.approval.approvers[].role` | lossy | Role names are the OpenAgentix RBAC roles (`admin`, `agent-engineer`, `integrator`, `operator`, `auditor`, `viewer`); in AWP they are resolved by the runtime's identity system. `spec.approval` requires the `governance` profile, so the converter emits it only when some tool requires approval. |
| `approvals.timeoutSeconds` (default 3600) | `spec.approval.timeout` | clean | `3600` becomes `1h`. |
| behaviour on timeout | `spec.approval.onTimeout` | lossy | `agents.md` has no field; the converter has to state the OpenAgentix behaviour (`reject` or `fail`) explicitly. |
| `<t>.approval: required` | `spec.approval.requiredFor: [<server>.<tool>]` | clean | Per-call approval of the action. |
| (none) | `minApprovals`, `user` approvers, `message`, `separationOfDuties` | AWP only | |

### 3.5 Agents and steps

| `agents.md` field | AWP target | Category | Notes |
| --- | --- | --- | --- |
| `agents[]` | `spec.agents[]` (inline agents) | clean | One inline agent per entry. |
| `pipeline` (default: order of `agents`) | `spec.workflow[]`, one `type: agent` step per id, each with `dependsOn: [<previous id>]` | lossy | A linear chain is expressible; it serializes steps that AWP could run in parallel, which is the intended `agents.md` behaviour. Agents not listed in `pipeline` stay in `spec.agents` without a step (OpenAgentix warns about them). |
| `<a>.id` | `spec.agents[].id` and `spec.workflow[].id` | clean | Agent and step identifiers are separate lists in AWP; reusing the id is allowed. |
| `<a>.description` | none | none | AWP inline agents have no description field. |
| `<a>.provider` | `spec.agents[].model.provider` | lossy | In OpenAgentix this names a **configured provider instance** of the tenant (for example `bedrock`, `simulated`); in AWP it is an opaque provider identifier used by `modelPolicy` and data residency checks. Instance names must be mapped to stable provider identifiers, otherwise governance rules match the wrong thing. |
| `<a>.model` | `spec.agents[].model.name` | clean | `model.version`, `region`, `approval`, `evaluation`, `riskClassification`, `allowedUseCases` are AWP only. |
| `<a>.temperature` | none | none | Model parameter. |
| `<a>.instructions` / `## Agent: <id>` section | `spec.agents[].instructions` | clean | The Markdown text is copied as a string. `promptRef` is AWP only. |
| `<a>.outputs[].format` | none | none | AWP declares named outputs (`spec.workflow[].outputs[].name`), not formats. |
| `<a>.outputs[].target` | none (would be an action) | none | Delivering output to a connection (for example `chat/post_message`) is an action in AWP terms and would need an explicit tool call or step. |
| `<a>.toolbox`, `runtime.toolbox` | none | none | Container image of the worker; closest AWP concept is the `image` of a command step, which is a different thing. |
| `<a>.simulation` | none | none | Test fixture for the `simulated` provider. AWP has `awp simulate` as an informative CLI name only, without a fixture format. |
| `<a>.runtime.runner`, `runtime.runner` | none | none | Execution placement is an implementation concern in AWP. Isolation requirements exist for command steps only ([spec 5.6.2](../spec/v1alpha1/README.md#562-command-steps)). |
| `<a>.runtime.harness` | none | none | External harnesses (`claude-code`, `opencode`) have no AWP field. |

### 3.6 Tools and permissions

| `agents.md` field | AWP target | Category | Notes |
| --- | --- | --- | --- |
| `<t>.server` | `spec.agents[].tools[]` with `type: mcp`, `server` | lossy | OpenAgentix connections are platform objects, not declared in the file. AWP allows runtime "binding" of undeclared servers ([spec 5.5.1](../spec/v1alpha1/README.md#551-mcp-servers)), but portable manifests SHOULD declare `spec.mcpServers` (transport, `url`, `image`, `auth.secretRef`). The converter needs publish-time connection data to emit them. |
| `<t>.tool` (exact name) | `tools[].tools: [<tool>]` and `permissions.tools.<server>.<tool>: {allow: true}` | clean | The converter emits `permissions` with `default: deny` so that only granted tools are allowed. OpenAgentix writes `server/tool`; AWP action identifiers are `server.tool`. Tool names containing `.` produce additional identifier segments. |
| `<t>.tool: "*"` | `permissions.tools.<server>.*: {allow: true}`, tool filter omitted | clean | |
| `<t>.tool: "<prefix>*"` (for example `get_*`) | none | none, security-relevant | AWP wildcards match whole segments only (`github.*`). A prefix inside a segment cannot be expressed; widening it to `<server>.*` would grant more. The converter must enumerate the matching tools from the connection at conversion time or refuse. |
| `<t>.args` (type, `required`, `pattern`, `enum`, `const`, length and range limits, `deny` regexes) | none | none, security-relevant | AWP has no argument constraints. `permissions.tools.*.resources` restricts the target resource only. A runtime that ignores an `x-openagentix` copy allows any arguments. |
| `<t>.allowAdditionalArgs` | none | none, security-relevant | As above. |
| `<t>.maxCallsPerRun` | none | none | AWP has only `resources.maxToolCalls` for all actions together. |
| `<t>.classification` (highest class the tool may receive) | `Policy` rule: `when: {action: <server>.<tool>, data.classification: {gt: <class>}}`, `effect: deny` | lossy | Expressible as a policy rule in a generated `Policy` manifest or `spec.policies.include`, which requires the `governance` profile. Equivalence depends on how each runtime determines the classification of an operation ([spec 7.2](../spec/v1alpha1/README.md#72-data-classification)). |
| `<t>` with `profile` (`{server, profile}`) | `spec.actionGroups.<server>.<profile>: [...]` + `permissions.tools.<server>.<profile>: {allow: true}` | lossy | Profile membership lives in the connection configuration, not in the file, and is expanded at publish. The converter needs that context. The `read`/`write` access class of a tool has no AWP field. |
| profile grant `approval`, `maxCallsPerRun`, `classification` | as for concrete grants | as above | |
| `<a>.access: read-only` | `permissions.tools` that allows only the read tools | lossy | AWP has no access class. The restriction can be reproduced by listing only read tools, but the guarantee "a read-only step never receives a write tool" is not a portable rule. |
| `runtime.egress` | `spec.permissions.network: {egress: deny, allowHosts: [...]}` | lossy | AWP applies network rules to command steps and built-in tools; OpenAgentix applies them to the worker or run node of the run. An empty OpenAgentix list means "control node only", which has no AWP counterpart. |
| `<a>.runtime.egress` (can only narrow) | `spec.agents[].permissions.network.allowHosts` | lossy | AWP combines network restrictions as an intersection ([spec 7.5.4](../spec/v1alpha1/README.md#754-combining-permissions)), which matches the narrowing rule; the scope difference above remains. |

### 3.7 Data flow, conditions and typed handovers (ADR 0008 fields)

| `agents.md` field | AWP target | Category | Notes |
| --- | --- | --- | --- |
| `schemas` | none | none | AWP has no JSON Schema for step outputs or inputs beyond workflow input types. |
| `<a>.input.schema` | none | none | Validation of step input has no AWP field. |
| `<a>.input.from: [event, <step>...]` | `dependsOn` + `task` with `${{ steps.<id>.outputs.result }}` references; `event` as a workflow input of type `object` | lossy | AWP passes declared named outputs through expressions. The OpenAgentix guarantee "the step sees exactly these sources and nothing else" has no AWP equivalent. The event payload has no AWP reference root; it has to become a workflow input. |
| `<a>.output.schema`, `output.onInvalid` | none | none | No output validation or retry-on-invalid in AWP. Closest field: step `retries`, which retries after any failure. |
| `<a>.when` | none | none, security-relevant | AWP `v1alpha1` has no conditional steps and no operators in expressions; `skipped` only follows a failed dependency. A runtime that ignores an `x-openagentix` copy runs a step that OpenAgentix would skip, for example a write action reserved for high severity findings. |
| `<a>.credentials[]: {secret, env}` | `spec.secrets[]: {name, source, key, scope: [<agent id>]}` + `spec.agents[].permissions.secrets` | lossy | AWP requires `source` (the converter sets an implementation-defined value). AWP secret names (`^[a-zA-Z][a-zA-Z0-9_-]{0,62}$`) are narrower than OpenAgentix references (dots, leading digits, up to 128 chars); such references need `key` with a renamed `name`. AWP has no field for the environment variable of an agent's tool processes (only command step `env`). |
| `mode: dark-factory` | none | none | Closest AWP concept is `spec.environments.<name>.autonomy`, which is not equivalent. |
| `guidelines: [name@x.y.z]` | none | none | Development guidelines are not policy rules. A guideline that contains enforceable rules could be published as an AWP `Policy` and included with `spec.policies.include`. |

## 4. AWP features without an `agents.md` equivalent

An AWP manifest that uses any of these cannot be converted into `agents.md` without loss, and an
OpenAgentix runtime that accepts AWP manifests has to implement them (or reject the manifest) to
be conformant.

| AWP feature | Spec | Profile |
| --- | --- | --- |
| JSON serialization, several YAML documents per file, YAML restrictions (custom tags, non-string keys) | 3.1 | core |
| `x-` extension fields | 3.3 | core |
| Durations, dates, digests as typed strings | 3.6-3.8 | core |
| Expressions `${{ inputs.* }}`, `${{ steps.<id>.outputs.* }}`, `${{ execution.* }}` | 3.9 | core |
| `metadata.purpose`, `annotations`, `owner.contact`/`businessOwner`/`technicalOwner`/`dataOwner` | 4, 7.1 | core |
| `metadata.integrity.digest` (JCS) | 9.1 | core |
| Typed workflow `inputs` with validation before start | 5.3 | core |
| Agent references (`ref` with exact version and digest) and kind `Agent` | 5.4.2, 6 | core |
| `promptRef` | 5.4.1 | core |
| Model metadata: `version`, `region`, `approval`, `riskClassification`, `evaluation`, `allowedUseCases` | 5.4.3 | core (enforced by governance) |
| Built-in tool sources (`type: builtin`, `shell`) | 5.5.2 | core |
| Action groups and well-known actions (`git.push`, `production.deploy`, ...) | 5.5.3, 5.5.4 | core |
| Step graph with `dependsOn`, parallel steps, `maxConcurrency` | 5.6.3, 5.7 | core |
| Command steps (`type: command`, `image`, `env`, `workingDir`) | 5.6.2 | core |
| Approval steps (`type: approval`) | 5.6.1, 7.6 | governance |
| Step `timeout`, `retries`, step `budget`, `maxRetries` | 5.6.1, 5.7 | core |
| Named step outputs with per-output classification | 5.6.1, 7.2 | core / governance |
| `permissions.default`, `resources` scopes, `filesystem`, `environments` | 7.5 | core |
| `spec.secrets` with `source`, `key`, `scope` | 7.9 | core |
| Data classes `personal`, `sensitive`, `secret` | 7.2 | governance |
| `dataPolicy` (per-input/output classes, declassification, `externalTransfer`, residency, providers) | 7.2, 7.3 | governance |
| `modelPolicy` | 7.4 | governance |
| `minApprovals`, `user` approvers, `onTimeout`, `message`, separation of duties | 7.6, 7.8 | governance |
| `metadata.risk` and the risk-level treatment | 7.7 | governance |
| `spec.environment`, `spec.environments` with autonomy levels | 7.10 | governance |
| Policy shorthands, `Policy` manifests, conditions, decision algorithm | 8 | governance |
| `spec.audit` (`payload`, `integrity.mode`, `retention`) | 10.2 | audit |
| `metadata.signature`, `metadata.provenance` | 9.2, 9.3 | security |
| `spec.mcpServers` declarations in the manifest | 5.5.1 | mcp |
| Remote agents (`protocol: a2a`, `endpoint`, `agentCard`, `auth`) | 5.4.4 | a2a |

## 5. Semantic differences that are not visible in the field tables

1. **Failure and skip semantics.** In OpenAgentix a `when` that evaluates to false skips a step
   and the run can still succeed. In AWP `skipped` only results from a failed dependency, and an
   execution succeeds only if every step succeeded ([spec 5.6.3](../spec/v1alpha1/README.md#563-execution-model)).
   A converted pipeline with skipped steps would count as failed under AWP rules even if the
   condition were carried over.
2. **What a step sees.** OpenAgentix hands the previous step's whole output (or the `input.from`
   map) to the model. AWP hands only what the `task` expression references, and only declared
   outputs may be referenced. A converter must declare one output per step (for example
   `result`) and must reference it in the next step's `task` to keep the behaviour.
3. **Action identifiers.** OpenAgentix identifies tool calls as `server/tool` and matches
   wildcards on raw prefixes. AWP uses `server.tool` with segment wildcards and action groups.
   Policy bundles managed through the OpenAgentix API (`forbiddenTools`, `requireApprovalTools`
   globs over `server/tool`) need the same translation.
4. **Approvals.** OpenAgentix defines approver roles once per pipeline and the requirement per
   tool. AWP separates `requiredFor`, approvers, `minApprovals`, separation of duties, and binds an
   approval to exactly one `tool.requested` event id.
5. **Classification.** Same four levels, but AWP additionally requires tracking the class of
   every operation, declassification events and the three additional classes. OpenAgentix
   compares tool clearances against the pipeline classification.
6. **Platform policy vs. manifest policy.** OpenAgentix policy bundles (forbidden tools, forbidden
   argument patterns, approval globs, maximum classification) are managed through the platform API
   per tenant or team. AWP expresses comparable rules as `Policy` manifests and shorthands that are
   part of the versioned, digestible document set. Forbidden argument patterns have no AWP
   equivalent.
7. **Digest and immutability.** Both formats make published versions immutable, but over
   different bytes. A version published in OpenAgentix and its AWP export are two artifacts with
   two digests.
8. **Audit events.** OpenAgentix audit actions (`run.completed`, `tool.call`, `policy.decision`,
   `approval.requested`, `step.skipped`, `handover.invalid`, ...) are not AWP event types, and the
   OpenAgentix hash chain is one chain per audit table (SHA-256 over its own canonical entry
   fields, genesis hash of 64 zeros, Ed25519-signed checkpoints), while AWP chains events per
   execution over the JCS serialization of the event with `prev` set to the empty string for the
   first event ([spec 10.5](../spec/v1alpha1/README.md#105-tamper-evidence)).

## 6. Migration path: converter design

This is a design proposal for a converter in OpenAgentix. It is not implemented.

### 6.1 Direction and placement

- **Export (`agents.md` to AWP)** first. It is the direction that lets OpenAgentix users publish
  portable manifests and lets the AWP conformance suite check the output.
- **Import (AWP to `agents.md`)** only for the expressible subset ([section 7.2](#72-awp-to-agentsmd-to-awp)).
  A runtime that wants to execute AWP manifests natively should not translate them into
  `agents.md`, because `agents.md` cannot express most of [section 4](#4-awp-features-without-an-agentsmd-equivalent).
- A pure function in the OpenAgentix core package (no I/O), with a thin CLI and API wrapper, for
  example `oax awp export <file>` and `GET /v1/agents/<name>/versions/<v>/awp`. Names are
  illustrative.

### 6.2 Inputs and outputs

Inputs:

1. The parsed and validated `AgentDefinition` (never raw text, so all `agents.md` checks have run).
2. A **publish context** with the facts that are not in the file: expanded tool profiles,
   connection details for `spec.mcpServers` (transport, URL or image digest, credential
   reference), the mapping from provider instance names to provider identifiers and regions, the
   secret store identifier for `spec.secrets[].source`, the approval timeout behaviour and the
   default cron time zone.
3. Options: target profiles (default `core`), loss mode (`strict` or `lossy`), whether to emit an
   `Agent` manifest per agent and a `Policy` manifest for tool classifications.

Outputs:

1. One `Workflow` manifest, optionally followed by `Agent` and `Policy` manifests in the same
   multi-document YAML file.
2. `metadata.integrity.digest` computed over JCS ([RFC 8785]) of each manifest.
3. A **loss report**: one diagnostic per unmapped or lossy field with the `agents.md` path, the
   category of [section 2](#2-legend) and the reason, in the diagnostic format of the
   [CLI document](cli.md) where it applies.

### 6.3 Loss handling

| Situation | `strict` (default) | `lossy` |
| --- | --- | --- |
| clean mapping | converted | converted |
| lossy mapping with publish context available | converted, warning | converted, warning |
| lossy mapping without publish context (profiles, connections) | error | error |
| `none`, not security-relevant (`temperature`, `outputs.format`, `toolbox`, `simulation`, Markdown prose, ...) | carried in `x-openagentix`, warning | carried in `x-openagentix`, warning |
| `none`, security-relevant (`when`, `args`, `allowAdditionalArgs`, prefix wildcards that cannot be enumerated, `input.from` isolation) | **error, no output** | carried in `x-openagentix`, error-level diagnostic and an annotation `openagentix.io/lossy-export: "true"` |

Rationale: AWP extension fields MUST NOT weaken requirements, and other runtimes MUST ignore
extension fields they do not interpret. A manifest whose safety depends on an ignored extension
would run with fewer restrictions elsewhere. Strict mode therefore refuses to produce it.

### 6.4 Validation of the output

- Every exported manifest is validated with the AWP JSON Schema and the semantic rules of the
  reference checker (`node conformance/awp-check.mjs check --profiles <target> <file>`), with
  `--verify-digest`.
- The converter test suite contains the OpenAgentix example files (`examples/*.agents.md`) as
  golden tests: expected AWP output plus expected loss report.
- Output is deterministic: stable key order, steps in `pipeline` order, generated identifiers
  derived from `agents.md` identifiers, no timestamps in the manifest.

### 6.5 Conversion sketch (non-normative)

```yaml
# agents.md front matter (excerpt)
apiVersion: openagentix.io/v1alpha1
kind: AgentPipeline
name: ticket-triage
version: 1.0.0
owner: support-team
classification: confidential
budget: { maxCostUsd: 2, timeoutSeconds: 900 }
agents:
  - id: analysis
    provider: bedrock
    model: claude
    tools:
      - { server: jira, tool: get_issue }
  - id: action
    provider: bedrock
    model: claude
    tools:
      - { server: jira, tool: create_comment, approval: required }
pipeline: [analysis, action]
```

```yaml
# AWP export (strict mode succeeds: no security-relevant loss in this excerpt)
apiVersion: awp.agenticworkflowprotocol.org/v1alpha1
kind: Workflow
metadata:
  name: ticket-triage
  version: 1.0.0
  owner:
    team: support-team
  classification: confidential
spec:
  budget:
    maxCostUsd: 2
    maxDuration: 900s
  agents:
    - id: analysis
      model: { provider: bedrock, name: claude }
      instructions: "<text of the '## Agent: analysis' section>"
      tools:
        - { type: mcp, server: jira, tools: [get_issue] }
      permissions:
        default: deny
        tools:
          jira.get_issue: { allow: true }
    - id: action
      model: { provider: bedrock, name: claude }
      instructions: "<text of the '## Agent: action' section>"
      tools:
        - { type: mcp, server: jira, tools: [create_comment] }
      permissions:
        default: deny
        tools:
          jira.create_comment: { allow: true }
  approval:                      # requires the governance profile
    requiredFor: [jira.create_comment]
    approvers:
      - role: operator
      - role: admin
    timeout: 1h
    onTimeout: reject            # must match the actual OpenAgentix behaviour (open question)
  workflow:
    - id: analysis
      agent: analysis
      outputs: [{ name: result }]
    - id: action
      agent: action
      dependsOn: [analysis]
      task: "Previous result: ${{ steps.analysis.outputs.result }}"
```

`spec.mcpServers` is omitted here, so the `jira` server must be resolved by runtime binding
([spec 5.5.1](../spec/v1alpha1/README.md#551-mcp-servers)), which makes the manifest less
portable. The reference checker (`conformance/awp-check.mjs check`) accepts this manifest with all
six profiles and warns about the binding and the missing workflow-level `permissions`. With
`--profiles core,mcp` it is rejected because `spec.approval` needs the `governance` profile, and the
`type: mcp` tool sources need the `mcp` profile: an exported manifest is only as portable as the
profiles of the runtime that reads it.

## 7. Round-trip expectations

### 7.1 `agents.md` to AWP to `agents.md`

- **Equality is semantic, not textual.** Two `agents.md` documents are equal for round-trip
  purposes when their parsed `AgentDefinition` objects are equal after removing `digest` and
  normalizing defaults. Byte equality (and therefore equal `agents.md` digests) is not expected:
  YAML formatting, key order and Markdown whitespace may change.
- **Lossless only with `x-openagentix`.** All `none` fields survive the round trip only when they
  are carried in `x-openagentix` and the importer is the OpenAgentix importer. Through any other
  tool the round trip loses them.
- **Publish context is not restored.** Expanded profile grants come back as concrete tool grants
  unless the original profile grants are carried in `x-openagentix`.
- **Expected stable fields** without extensions: `name`, `version`, `description`, `owner`,
  `classification`, `labels` (within the AWP key pattern), `triggers` of type `manual` and `cron`
  (5-field), budgets, agent `id`, `provider`, `model`, `instructions`, exact tool grants,
  `approval: required`, approver roles, approval timeout, `pipeline` order.

### 7.2 AWP to `agents.md` to AWP

- Only manifests in the **expressible subset** can be imported: kind `Workflow`, only agent
  steps, a dependency graph that is a single chain, only inline agents with `type: mcp` tool
  sources, permissions with `default: deny` and exact or whole-server keys, no `spec.inputs`, no
  `dataPolicy`, `modelPolicy`, `environments`, `policies`, `risk`, `audit`, `signature`, A2A
  agents or command and approval steps.
- Everything else is rejected by the importer with a diagnostic naming the field, consistent
  with AWP's fail-closed principle. The importer never drops an AWP governance field silently.
- For the expressible subset, re-exporting yields a manifest that is equal to the original after
  JCS canonicalization, except for `metadata.integrity` (recomputed) and fields the original did
  not set but the exporter writes explicitly (for example `classification`, `permissions.default`).

## 8. What OpenAgentix must implement per conformance profile

The table "observed today" is based on reading the OpenAgentix source at the revision named
above. It is not a test result and not a claim. A profile can only be claimed after every MUST
requirement of the profile and of `core` is met, the conformance suite passes for the claimed
profiles, and a conformance statement with all limitations is published
([spec 11.3](../spec/v1alpha1/README.md#113-conformance-statement)).

### 8.1 `core`

| Requirement area | Observed today | Needed |
| --- | --- | --- |
| Read AWP manifests | Not supported; only `agents.md` | Parser for YAML 1.2 and JSON with the YAML restrictions of 3.1, multi-document files, `apiVersion`/`kind` rejection rules |
| Fail closed on unknown fields | Yes for `agents.md` (strict schemas) | Same for AWP, plus `x-` extension handling and rejection of fields of unsupported profiles with an error naming field and profile (3.3) |
| Validator | `agents.md` validation | Pass all conformance suite cases for the claimed profiles (`conformance/index.json`), matching accept/reject and path |
| Typed inputs | None (event data only) | `spec.inputs` validation before start (5.3) |
| Expressions | `when` grammar, a different language | `${{ }}` references with the step dependency rule; no substitution into `command` (3.9, 5.6.2) |
| Step graph | Linear `pipeline` | DAG with `dependsOn`, `maxConcurrency`, statuses including `waitingForApproval` and dependent skipping, `timeout`, `retries`, success rule (5.6.3) |
| Command steps | Not in `agents.md` (toolbox images exist) | `type: command` as action `shell.execute`, isolated execution with network and filesystem restrictions (5.6.2) |
| Agent references, kind `Agent`, `promptRef` | None | Resolution with exact versions and digest verification (5.4.2, 6) |
| Budgets | Cost, tokens, steps, tool calls, timeout; pre-call checks exist | `maxDuration`, `maxRetries`, `maxConcurrency`, nested step budgets, `workflow.failed` with `reason: budgetExceeded` and `limit`, documented cost computation, `costKnown` (5.7) |
| Permissions | Tool grants with argument constraints | AWP `permissions` model: `default`, action keys, groups, wildcards, `resources` scopes with documented resource derivation per tool (deny if unknown), `filesystem`, `environments`, combination rule (7.5) |
| Secrets | Secret references and a per-step credential broker | `spec.secrets` with `source`, `key`, `scope`, `secretRef` checks, rejection of literal `token`/`password`/`apiKey`/`secret`/`privateKey` values (7.9) |
| Manifest digest | SHA-256 of normalized Markdown | JCS (RFC 8785) digest with verification of `metadata.integrity.digest` and of reference digests (9.1); the existing canonical JSON function must be shown to be JCS-equivalent or replaced |
| Execution id, events | Run ids; own audit action names | Unique execution id (`awp-exec-<ULID>` recommended), `workflow.*` events to a log (10.1) |
| Manual trigger | Yes | Unchanged |

### 8.2 `governance`

| Requirement area | Observed today | Needed |
| --- | --- | --- |
| Ownership and classification | `owner` and `classification` are present (with a default) | Reject manifests without `owner.team` and `classification`; record name, version and team in `workflow.started` (7.1) |
| Data classes | Four classes, tool clearances | Seven classes, per-operation class tracking, declassification recording in `artifact.created`, `externalTransfer` (7.2) |
| Residency and providers | Provider abstraction and outbound proxies; no residency rules in `agents.md` | Region per model invocation, fail closed when unknown, allowed/forbidden providers, `policy.denied` (7.3) |
| Model policy | None in `agents.md` | Validation before start including approval expiry and evaluation status; fallbacks recorded (7.4) |
| Human approval | Per-tool approval, approver roles, timeout | `requiredFor` over action keys, `user` approvers, `minApprovals`, `onTimeout`, approval bound to one `tool.requested` event id, required request content, approval steps, no agent approvals (7.6) |
| Risk levels | None | `metadata.risk` with the default treatment, execution approval for `critical` (7.7) |
| Separation of duties | Not observed | `actorCannotApproveOwnAction`, `initiatorCannotApprove`, distinct approvers (7.8) |
| Environments | None in `agents.md` | `environment`, `environments` with autonomy levels, rejection of unlisted environments (7.10) |
| Policies | Platform policy bundles via API | Shorthands, `Policy` manifests with `include` and digests, conditions with fail-closed handling of unknown attributes, the decision algorithm of 8.4 (or an external engine with identical decisions) |

### 8.3 `audit`

| Requirement area | Observed today | Needed |
| --- | --- | --- |
| Event envelope | Own entry format (`seq`, `ts`, `actor`, `action`, `target`, `runId`, payload) | AWP envelope with `id`, `type`, `time`, `executionId`, `workflow`, `stepId`, `actor {type, id}`, `environment`, `data`, `integrity` (10.3), natively or as a verified export |
| Event types | Different names and coverage | All types of 10.4 in causal order, including `tool.requested`/`executed`/`denied`, `policy.evaluated` for every decision, `artifact.created`/`modified` |
| Payload modes | Redaction, metadata-only default for new tenants (owner decision) | `payload: metadata` and `full` per manifest; no content under `metadata` (10.2, 10.3) |
| Integrity | Table-wide hash chain with Ed25519 checkpoints | `none` and `hash-chain` with the AWP per-execution chain rule and a verification tool; `signed` optional (10.5) |
| Retention | Platform configuration | Honour `retention.duration` or reject the manifest (10.2) |
| Decision records | Not observed | Attached to `tool.requested` for approval actions, without chain-of-thought (10.6) |
| Reproducibility record | Not observed in AWP form | Produced at the end of every execution with model versions actually used, MCP server versions, image digests, policy digests (10.7) |

### 8.4 `security`

| Requirement area | Observed today | Needed |
| --- | --- | --- |
| Digests | See `core` | JCS digests for manifests and references, mandatory verification (9.1) |
| Signatures | Ed25519 for audit checkpoints only | At least one documented manifest signature format, configuration to reject unsigned or unverifiable manifests (9.2) |
| Image pinning | Toolbox images from a catalog | Reject `mcpServers[].image` and command step `image` not pinned by digest (9.4) |
| Isolation | `container` and `kubernetes-job` runners (opt-in; default `in-process`) | Command steps always isolated with enforced network and filesystem restrictions (5.6.2, 7.5) |
| Secret redaction | Redaction and credential broker exist | Proven: no secret values to models, events, logs, approval requests; redaction of tool output (7.9) |
| Lint | `agents.md` warnings | Warning when no `permissions` apply (7.5.3) |

### 8.5 `mcp`

| Requirement area | Observed today | Needed |
| --- | --- | --- |
| Server declaration | MCP connections managed by the platform (`stdio`/`streamable-http`, secrets by name) | Accept `spec.mcpServers`, require `https` for `streamable-http`, resolve undeclared servers by binding or reject (5.5.1) |
| Tool filtering | Tool grants and profiles | `tools` filter on tool sources; exposure separate from permission (5.5.2) |
| Action identifiers | `server/tool` | `<server>.<tool>` per call, used in permissions, policies, approvals and events (5.5.3) |
| Events | `tool.call` audit action | `tool.requested`, `tool.executed`, `tool.denied` per MCP call (with the audit profile) |

### 8.6 `a2a`

| Requirement area | Observed today | Needed |
| --- | --- | --- |
| Remote agents | No A2A support found in the source | `protocol: a2a` agents, HTTPS only, `agentCard` digest verification before the first message, `auth.secretRef` (5.4.4) |
| Governance of messages | n/a | Every message is the action `a2a.<id>.send` under permissions, policies, approvals and data policy, with the endpoint host as provider identifier |

### 8.7 Suggested order

`core` validator first (it can be measured against the existing conformance suite), then the
export converter, then `mcp` (closest to existing functionality), `audit` (an export layer over
the existing hash chain may be enough to start), `governance`, `security`, and `a2a` last. Each
claim, when it is made, belongs in a published conformance statement with every limitation
listed. Until then, OpenAgentix documentation and websites should describe AWP support as
"planned" or "in progress".

## 9. Open questions

1. **Conditional steps.** Should AWP add conditions (`when`) to steps? Without them, the most
   important ADR 0008 feature of `agents.md` cannot be exported safely. Candidate for an AEP.
2. **Argument constraints.** Should AWP permissions support argument constraints beyond
   `resources`? Today they are the main security-relevant loss. Candidate for an AEP.
3. **Typed handovers.** Should step outputs carry a JSON Schema, and should a step be able to
   declare that it receives only specific sources?
4. **Event payload as reference root.** Triggers of type `event` start executions, but there is no
   expression root for the event payload. Should `${{ event.* }}` exist, or should events always map
   to inputs?
5. **Wildcard granularity.** Is a prefix wildcard within a segment (`jira.get_*`) needed, or is
   enumeration through action groups the intended pattern?
6. **Provider identifiers.** How should runtimes map tenant-specific provider instances to the
   provider identifiers used by `modelPolicy` and data residency? A registry of well-known
   provider identifiers could help.
7. **OpenAgentix behaviour to confirm** before the converter is built: approval timeout outcome
   (`reject` or `fail`), meaning of `budget.maxSteps`, cron field count and default time zone,
   whether `owner` is always a team.
8. **Per-tool call limits** (`maxCallsPerRun`): AWP extension or new budget field?

[RFC 8785]: https://www.rfc-editor.org/rfc/rfc8785
