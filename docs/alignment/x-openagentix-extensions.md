# The `x-openagentix-*` extension namespace

| | |
| --- | --- |
| **Status** | Informative for AWP. Directions decided on 2026-10-10 ([decision log](decisions.md): D3 required extensions, D12 neutral prefix list, D13 transition). The prefix is listed in the neutral [extension prefix list](../registry/extension-prefixes.md); this field-level description moves to the OpenAgentix repository with its extension schema. |
| **Applies to** | AWP `v1alpha1` manifests written by OpenAgentix (`agents.md` front matter under strategy A) |
| **AWP rules used** | Extension fields ([spec 3.3](../../spec/v1alpha1/README.md#33-unknown-fields-and-extensions)), digest ([spec 9.1](../../spec/v1alpha1/README.md#91-manifest-digest)) |
| **Related** | [Alignment matrix v2](openagentix-matrix.md), [AEP-0011 required extensions](../../aep/0011-required-extensions.md) |

> AWP is vendor neutral. This page describes how **one** implementation (OpenAgentix, in progress,
> not conformant) intends to use the generic `x-` mechanism that every implementation has. It
> creates no AWP requirement and gives OpenAgentix no special status. Any other implementation can
> document its own prefix the same way and list it in the neutral, informative
> [extension prefix list](../registry/extension-prefixes.md) (decision D12).

## 1. Goals

- Keep AWP core neutral: OpenAgentix-specific runtime concepts (runners, toolboxes, harnesses,
  simulation fixtures, dark-factory mode, development guidelines) never become core fields by
  default.
- Make every OpenAgentix field that **restricts** behaviour either an AWP core field (through an
  AEP) or a **required** extension (AEP-0011), so that no runtime silently runs an OpenAgentix
  manifest with fewer restrictions.
- Give each interim extension a planned successor in core, so the namespace shrinks over time.

## 2. Naming and placement rules

1. Every OpenAgentix extension field is named `x-openagentix-<name>`, where `<name>` is
   lowerCamelCase (`x-openagentix-maxCallsPerRun`). No other prefix is used, and OpenAgentix does
   not use un-prefixed `x-` names.
2. An extension field is placed on the **object it modifies** (a step field on the step, a tool
   grant field on the `permissions.tools` entry), never collected in one global bag. This keeps
   the field next to the core field that would replace it.
3. Extension values are plain JSON values. They MUST NOT contain secret values (spec 7.9 does not
   scan extension subtrees, so OpenAgentix's own validator does).
4. Extensions are part of the manifest digest: JCS covers them like any other field
   ([AEP-0010](../../aep/0010-digest-canonicalization.md)). Changing an extension value changes the
   digest and therefore needs a new `metadata.version`.
5. OpenAgentix validates the content of its extensions with its own JSON Schema
   (`openagentix-extensions.v1alpha1.json`, to be kept in the OpenAgentix repository, not here).
6. An extension MUST NOT weaken a core requirement (spec 3.3). An extension that restricts
   behaviour is **critical**: until AEP-0011 exists OpenAgentix treats a manifest with critical
   extensions as not portable and does not export it as an AWP manifest; after AEP-0011 it lists
   them in `metadata.requiredExtensions`.

## 3. Registry of fields

### 3.1 Operational extensions (safe to ignore)

A runtime that ignores these runs the manifest with the same or stricter restrictions.

| Field | Location | Value | Meaning in OpenAgentix | Planned successor |
| --- | --- | --- | --- | --- |
| `x-openagentix-description` | `spec.agents[]` | string | Description of an agent | Possible core field `description` on agents (editorial AEP) |
| `x-openagentix-model` | `spec.agents[]` | `{temperature?, maxTokensPerCall?}` | Model call parameters | None: model API parameters are an AWP non-goal (spec 1.3) |
| `x-openagentix-outputs` | `spec.agents[]` | `[{format, target?}]` | Output format and delivery target | `format`: AEP-0003 output schema; `target`: an explicit action |
| `x-openagentix-simulation` | `spec.agents[]` | `{responses: [...]}` | Scripted model responses for the `simulated` provider (tests, demos) | None (test fixture); `awp simulate` has no fixture format |
| `x-openagentix-credentialEnv` | `spec.agents[]` | map secret name -> env variable name | Environment variable of a brokered credential | Possible core field on `permissions.secrets` |
| `x-openagentix-mode` | `spec` | `standard` or `dark-factory` | Opt-in mode with minimal human touch; approval gates still apply | `spec.environments` autonomy levels are related but not equivalent; stays an extension |
| `x-openagentix-runtime.harness` | `spec.agents[]` | `claude-code` or `opencode` | Executes the step through an external harness via the model proxy | None (executor choice) |

### 3.2 Critical extensions (interim, must not be ignored)

A runtime that ignores these would allow more than OpenAgentix allows. They exist only until the
named AEP is accepted and implemented; then OpenAgentix writes the core field instead.

| Field | Location | Value | Meaning in OpenAgentix | Successor |
| --- | --- | --- | --- | --- |
| `x-openagentix-when` | `spec.workflow[]` | condition string ([`when` grammar](https://github.com/open-agentix/open-agentix/blob/main/docs/agents-md.md#when-grammar)) | Step is skipped when false | Step `when` (AEP-0001) |
| `x-openagentix-input` | `spec.workflow[]` | `{schema?, from?}` | Input validation and source isolation | Step `input` (AEP-0003, AEP-0004) |
| `x-openagentix-output` | `spec.workflow[]` | `{schema, onInvalid}` | Output validation, one retry | Step output `schema`, `onInvalid` (AEP-0003) |
| `x-openagentix-schemas` | `spec` | map name -> JSON Schema | Named schemas for handoffs | `spec.schemas` (AEP-0003) |
| `x-openagentix-access` | `spec.workflow[]` | `read-only` or `write` | Step may only call tools classified `read` | Tool access classes in the MCP catalog (AEP-0007) plus a step `access` field |
| `x-openagentix-args` | `permissions.tools.<key>` | map argument -> constraint | Argument constraints | `args` (AEP-0002) |
| `x-openagentix-allowAdditionalArgs` | `permissions.tools.<key>` | boolean | Unknown arguments denied when `false` (default) | `allowAdditionalArgs` (AEP-0002) |
| `x-openagentix-maxCallsPerRun` | `permissions.tools.<key>` | integer | Per-action call limit | `maxCalls` (AEP-0002) |
| `x-openagentix-classification` | `permissions.tools.<key>` | data class | Highest class the tool may receive | `Policy` rule (`when: {action, data.classification: {gt}}`, effect `deny`) |
| `x-openagentix-runtime.runner`, `.toolbox` | `spec`, `spec.agents[]` | runner kind, toolbox name | Execution placement and isolation | None planned; stays an extension, therefore listed in `metadata.requiredExtensions` |
| `x-openagentix-guidelines` | `spec` | `[name@x.y.z]` | Development guideline sets, enforced as policy bundles | Enforceable parts as `Policy` manifests in `spec.policies.include` |

`x-openagentix-runtime` mixes an operational member (`harness`) and critical members (`runner`,
`toolbox`). It is listed as required whenever `runner` or `toolbox` is set.

### 3.3 Not extensions

These OpenAgentix concepts map to AWP core fields and must not be duplicated as extensions:
`runtime.egress` (to `permissions.network`), `credentials` (to `spec.secrets` and
`permissions.secrets`), approvals (to `spec.approval`), budgets, triggers, tool grants (to
`tools` and `permissions.tools`), profile grants (to `actionGroups`; members from publish context).

## 4. The Markdown wrapper

Under strategy A an `agents.md` file is a Markdown document whose YAML front matter is an AWP
manifest. Proposed rules, to be specified in the OpenAgentix repository:

1. The front matter is one YAML 1.2 document with the AWP YAML restrictions (spec 3.1). Its
   `apiVersion` is an AWP API version that OpenAgentix supports.
2. `## Agent: <id>` sections provide `spec.agents[<id>].instructions`. The front matter MUST NOT
   set `instructions` or `promptRef` for an agent that has such a section; a section without a
   matching agent is an error (as today).
3. The **effective manifest** is the front matter with the section texts injected (trimmed, line
   endings normalised to `\n`). Validation, the AWP digest (`metadata.integrity.digest`), signing
   and every export use the effective manifest. A JSON export of an `agents.md` file is its
   effective manifest.
4. Title, overview and other sections are documentation. They are not part of the effective
   manifest; OpenAgentix keeps its source digest (SHA-256 of the normalised file) as a second,
   implementation-specific identifier and does not write it into the file.
5. A file with `apiVersion: openagentix.io/v1alpha1` remains readable for one OpenAgentix minor
   release after the first release that writes AWP manifests, with a deprecation warning on every
   read; the next minor release rejects it ([decision D13](decisions.md#d13-transition-for-openagentixiov1alpha1-files-rule-chosen-by-the-agent-as-delegated)).
   During the transition OpenAgentix converts it into an effective AWP manifest with the converter
   rules of the [matrix](openagentix-matrix.md#4-field-by-field-matrix) and refuses the conversion
   when a critical finding cannot be carried. Published legacy versions are converted once and
   stored next to their unchanged source.

## 5. Lifecycle

| Step | When |
| --- | --- |
| Add a field to this registry | An OpenAgentix change needs a field that AWP core does not have. The pull request in OpenAgentix states operational or critical and the planned successor. |
| Propose a successor | For every critical field: an AEP in this repository (or a reason why it stays an extension). |
| Switch to the core field | When the AEP is part of an AWP API version OpenAgentix supports. OpenAgentix writes the core field and accepts the extension for one more minor release with a deprecation warning. |
| Remove | Next OpenAgentix minor release after the deprecation. |

## 6. Example

```yaml
---
apiVersion: awp.agenticworkflowprotocol.org/v1alpha1
kind: Workflow
metadata:
  name: ticket-updater
  version: 2.0.0
  owner:
    team: team-security
  classification: internal
spec:
  triggers:
    - type: event
      source: jira
      eventType: webhook.received
  agents:
    - id: updater
      model:
        provider: simulated
        name: sim-1
      tools:
        - type: mcp
          server: tickets
          tools: [get_ticket, update_ticket]
      permissions:
        default: deny
        tools:
          tickets.get_ticket:
            allow: true
            x-openagentix-args:
              key: { type: string, required: true, pattern: "^SEC-\\d+$" }
            x-openagentix-allowAdditionalArgs: false
          tickets.update_ticket:
            allow: true
            x-openagentix-maxCallsPerRun: 1
            x-openagentix-args:
              key: { type: string, required: true, pattern: "^SEC-\\d+$" }
              status: { type: string, enum: [triaged, in-progress, done] }
            x-openagentix-allowAdditionalArgs: false
      x-openagentix-outputs:
        - format: ticket-update
  approval:
    requiredFor: [tickets.update_ticket]
    approvers:
      - role: operator
    timeout: 1h
    onTimeout: fail
  workflow:
    - id: updater
      agent: updater
---

# Ticket updater

## Agent: updater

Read the ticket from the event, then set its status to `triaged`.
```

Today this front matter validates against the AWP schema (extensions are allowed), but it is **not
portable**: a runtime other than OpenAgentix ignores the argument constraints and the call limit.
With AEP-0011 it would carry
`metadata.requiredExtensions: [x-openagentix-args, x-openagentix-allowAdditionalArgs, x-openagentix-maxCallsPerRun]`
and other runtimes would reject it; with AEP-0002 the three fields would become core fields.
