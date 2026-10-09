# AWP command-line interface: output formats (v1alpha1)

| | |
| --- | --- |
| **Status** | **Draft / alpha.** Follows the status of the [v1alpha1 specification](../spec/v1alpha1/README.md). |
| **Scope** | Output formats and exit codes of `awp validate`, `awp lint`, `awp simulate`, `awp plan`, `awp run` and `awp audit`. This document specifies formats only; it is not an implementation. |
| **License** | [CC BY 4.0](../LICENSE-SPEC) |

Section 11.4 of the specification names the command vocabulary and leaves the output formats to a
separate document. This is that document. It is **not** a conformance profile: an implementation
may provide any subset of the commands, and an implementation that provides a command and wants to
call its output "AWP CLI output format v1alpha1" SHOULD follow the section of this document for that
command. The key words MUST, SHOULD and MAY are used as defined in the specification
([section 2](../spec/v1alpha1/README.md#2-notational-conventions)) and apply only to such
implementations.

The reference checker in [`conformance/`](../conformance/README.md) implements the diagnostics of
`awp validate` (section 4) as `check --json`; it does not implement the full envelope.

## Contents

1. [Conventions](#1-conventions)
2. [Exit codes](#2-exit-codes)
3. [Diagnostics](#3-diagnostics)
4. [`awp validate`](#4-awp-validate)
5. [`awp lint`](#5-awp-lint)
6. [`awp simulate`](#6-awp-simulate)
7. [`awp plan`](#7-awp-plan)
8. [`awp run`](#8-awp-run)
9. [`awp audit`](#9-awp-audit)
10. [Stability](#10-stability)

---

## 1. Conventions

```
awp <command> [options] <manifest>...
```

- `<manifest>` is a path to a YAML or JSON file, or `-` for standard input. A file with several
  documents is processed document by document ([spec 3.1](../spec/v1alpha1/README.md#31-serialization));
  results carry the zero-based `document` index.
- **Streams.** Results are written to standard output. Progress, logging and prompts go to standard
  error. With `--output json` standard output contains exactly one JSON document (`run` and `audit`
  may use `jsonl`, see below) and nothing else.
- **Common options.**

  | Option | Meaning |
  | ------ | ------- |
  | `--output <format>` | `text` (default) or `json`. `run` and `audit` also accept `jsonl` (one JSON object per line). |
  | `--profiles <list>` | Comma-separated conformance profiles the command treats as supported (`core`, `governance`, `audit`, `security`, `mcp`, `a2a`). Default: the profiles the implementation supports. Fields of other profiles are rejected ([spec 3.3](../spec/v1alpha1/README.md#33-unknown-fields-and-extensions)). |
  | `--environment <name>` | Environment of the execution for `simulate`, `plan` and `run`. |
  | `--strict` | Treat warnings as errors (affects the exit code only). |
  | `--no-color`, `--no-unicode` | Disable ANSI colors; use ASCII marks (`[ok]`, `[x]`, `-` instead of the check mark, cross and bullet). Also implied when the output is not a terminal or the `NO_COLOR` environment variable is set. |
  | `--quiet` | Suppress everything except diagnostics of severity `error`. |
  | `--version`, `--help` | Print the CLI version (and the supported AWP API versions) or usage and exit `0`. |

- **JSON envelope.** Every JSON result has the shape

  ```json
  { "awp": "v1alpha1", "command": "plan", "ok": true, "result": { } }
  ```

  `awp` is the API version the manifests were processed as, `command` the command, `ok` is `true`
  when the command's success criterion holds (the same condition as exit code `0`), and `result`
  is specified per command. Field names are `camelCase`. Unknown fields MUST be ignored by
  consumers; implementations MAY add fields prefixed with `x-` anywhere.
- **Text output** is for humans and MAY change between versions of the CLI. Scripts SHOULD use
  JSON. The text formats below are normative for layout and wording of the fixed parts (headings,
  keys, marks); variable parts are marked `<...>`.
- Secret values MUST NOT appear in any output ([spec 7.9](../spec/v1alpha1/README.md#79-secrets)).
  Digests, identifiers and references may.

## 2. Exit codes

| Code | Meaning |
| ---- | ------- |
| `0` | Success: no errors (and no warnings with `--strict`); for `run`, the execution succeeded; for `audit`, verification succeeded. |
| `1` | The input was processed and a check failed: validation errors, lint findings, a denied plan or simulation, a failed audit verification. |
| `2` | Usage error: unknown command or option, missing file argument, unsupported `--profiles` value. |
| `3` | The command could not do its work: unreadable file, unresolvable reference or dependency, internal error. |
| `10` | `run` only: the execution started and failed (`workflow.failed`). |
| `11` | `run` only: the execution was cancelled (`workflow.cancelled`) or an approval was rejected or expired and ended the execution. |

If several documents are processed, the exit code is the highest-priority outcome: `3`, then `2`,
then `10`/`11`, then `1`, then `0`.

## 3. Diagnostics

`validate`, `lint`, `simulate`, `plan` and `audit` report findings as **diagnostics**.

```json
{
  "severity": "error",
  "code": "dependsOn.unknown-step",
  "message": "dependsOn names non-existent step \"ghost\"",
  "path": "/spec/workflow/1/dependsOn/1",
  "section": "5.6.3",
  "document": 0,
  "source": { "file": "workflow.yaml", "line": 31, "column": 11 }
}
```

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `severity` | string | yes | `error`, `warning` or `info`. |
| `code` | string | yes | Stable identifier (below). |
| `message` | string | yes | Human-readable, English. |
| `path` | string | yes | RFC 6901 JSON Pointer into the document; `""` for the whole document. |
| `section` | string | no | Section of the v1alpha1 specification that states the rule (for example `5.6.3`). |
| `document` | integer | no | Index of the document within the file. |
| `source` | object | no | `file`, and `line` and `column` (1-based) when known. |
| `hint` | string | no | Suggested fix. |

**Text rendering** (one line per diagnostic, optionally followed by an indented hint):

```
<file>:<line>:<column>: <severity> <code> <path>: <message>
```

If the position is unknown the line and column are omitted: `<file>: <severity> ...`.

**Codes** are lowercase, dot-separated and stable within an API version.

| Prefix | Origin |
| ------ | ------ |
| `yaml.` | YAML restrictions of [spec 3.1](../spec/v1alpha1/README.md#31-serialization). |
| `schema.` | Structural violation. The suffix names the violated JSON Schema keyword (`schema.additionalProperties`, `schema.required`, `schema.enum`, ...). |
| `profile.` | A field or kind belongs to an unsupported profile, or a profile-specific requirement is not met. |
| other | Semantic rules, for example `dependsOn.cycle`, `secretRef.scope`, `expr.not-a-dependency`. Catalogue: [schema/README.md](../schema/README.md#semantic-validation-rules). |
| `lint.` | Advisory findings of `awp lint` ([section 5](#5-awp-lint)). |
| `plan.`, `simulate.`, `audit.` | Findings produced by those commands (sections 6, 7, 9). |

## 4. `awp validate`

```
awp validate [--profiles <list>] [--verify-digest] [--strict] [--output text|json] <manifest>...
```

Checks that each document is a manifest that satisfies all requirements on documents of the
selected profiles ([spec 11.1](../spec/v1alpha1/README.md#111-roles)): YAML restrictions, structure,
semantic rules. It does not resolve references and contacts no network.
`--verify-digest` verifies `metadata.integrity.digest` ([spec 9.1](../spec/v1alpha1/README.md#91-manifest-digest)).
Warnings from the semantic catalogue are reported but do not fail the command unless `--strict`.

**Text output.**

```
$ awp validate workflow.yaml
workflow.yaml:31:11: error dependsOn.unknown-step /spec/workflow/1/dependsOn/1: dependsOn names non-existent step "ghost"
workflow.yaml:12:5: warning mcp.server-unresolved /spec/agents/0/tools/0/server: MCP server "tools" is not declared in spec.mcpServers

workflow.yaml (Workflow vulnerability-fixer 0.1.0): invalid, 1 error, 1 warning
```

For a valid file, the last line is `<file> (<kind> <name> <version>): valid` (with `, N warnings` if any).
The summary line is written once per document.

**JSON result.**

```json
{
  "awp": "v1alpha1",
  "command": "validate",
  "ok": false,
  "result": {
    "profiles": ["core", "governance", "audit", "security", "mcp", "a2a"],
    "files": [
      {
        "file": "workflow.yaml",
        "documents": [
          {
            "document": 0,
            "kind": "Workflow",
            "name": "vulnerability-fixer",
            "version": "0.1.0",
            "valid": false,
            "diagnostics": [ { "severity": "error", "code": "dependsOn.unknown-step", "...": "..." } ]
          }
        ]
      }
    ],
    "summary": { "documents": 1, "valid": 0, "invalid": 1, "errors": 1, "warnings": 1 }
  }
}
```

`kind`, `name` and `version` are omitted when the document is too malformed to read them.
Exit code: `0` if every document is valid, otherwise `1`.

## 5. `awp lint`

```
awp lint [--profiles <list>] [--fail-on error|warning|info] [--output text|json] <manifest>...
```

`lint` runs `validate` and adds **advisory** findings for manifests that are valid but risky or
incomplete. Output formats are those of `validate` (the result adds `"failOn"` and the lint
diagnostics have codes with the prefix `lint.` or are semantic warnings). `--fail-on` sets the
lowest severity that produces exit code `1`; the default is `error`.

Lint rules in v1alpha1 are derived from `SHOULD` and "should be considered" statements of the
specification:

| Code | Severity | Spec | Finding |
| ---- | -------- | ---- | ------- |
| `lint.permissions-absent` | warning | 7.5.3 | No `permissions` object: every action of exposed tools is allowed by permissions. |
| `lint.unmapped-tool` | warning | 5.5.4 | A tool name suggests a well-known effect (for example `push`, `merge`, `deploy`, `send`, `delete`) but no action group maps it to a well-known action. |
| `mcp.server-unresolved` | warning | 5.5.1 | A tool source names an MCP server that is not declared in `spec.mcpServers`. |
| `expr.undeclared-input` | warning | 3.9 | An expression references an undeclared input. |
| `lint.command-expression` | warning | 5.6.2 | `command` contains `${{ }}`; use `env`. |
| `lint.environment-not-listed` | warning | 7.10 | `spec.environment.name` is not listed in `spec.environments`. |
| `lint.default-allow` | info | 12 | `permissions.default` is `allow`; prefer `deny` with explicit allows. |
| `lint.shell-grants-sandbox` | info | 12 | `shell.execute` is allowed; this is equivalent to granting everything the sandbox can reach. Combine with `permissions.network` and `permissions.filesystem`. |
| `lint.unpinned-reference` | info | 9.4 | An agent reference, policy include, prompt reference or agent card has no `digest`. |
| `lint.unpinned-image` | warning (error with the `security` profile, code `security.image-not-pinned`) | 9.4 | A container image is not pinned by digest. |

Implementations MAY add rules with their own prefix (`x-<vendor>.`); rule codes of this table MUST
keep their meaning.

## 6. `awp simulate`

```
awp simulate [--environment <name>] [--input <name>=<value>]... [--actor <type>:<id>]
             [--profiles <list>] [--output text|json] <manifest>
```

`simulate` evaluates the governance of a workflow **without running anything**: no model is called,
no tool is executed, nothing is written to an audit log. It answers: for each step, which actions
could happen and what would the runtime decide for them
([spec 8.4](../spec/v1alpha1/README.md#84-decision-combination))?

Because the actions an agent chooses are not known in advance, the simulation covers the
**potential actions** of a step:

- agent step: every tool exposed to the agent (`<server>.<tool>` for each listed MCP tool, or
  `<server>.*` when all tools of a server are exposed; `shell.execute` for the built-in `shell`;
  `a2a.<id>.send` for a remote agent), after action-group mapping;
- command step: `shell.execute`;
- approval step: the approval request itself.

The simulation applies, in the order of the decision algorithm: permissions, deny rules (shorthands,
policy manifests, data policy, model policy, environment `prohibited`), then approval requirements
(`approval.requiredFor`, `requireApproval` rules, environment autonomy, risk level). Attributes that
cannot be determined statically (for example the data classification of an operation or the region
of a model) are treated as the specification requires: fail closed
([spec 8.3](../spec/v1alpha1/README.md#83-conditions), [7.3](../spec/v1alpha1/README.md#73-data-residency-and-processing))
and marked `"determinable": false`.

**Text output.**

```
AWP Simulation

Workflow:    vulnerability-fixer 0.1.0
Environment: development
Inputs:      repository=example-org/web-shop cve=CVE-2026-12345

Step investigate (agent researcher)
  github.search_code       allow
  github.get_file_contents allow
Step fix (agent fixer)
  github.create_branch     allow
  github.push_files        allow              [git.push]
  github.create_pull_request allow            [pullRequest.create]
  github.merge_pull_request  deny             policies.merge.allow=false
Step test (command)
  shell.execute            allow

Result: 1 action denied, 0 require approval, 6 allowed
Budget ceiling: 30 steps, $2.00, 15 minutes
```

Layout: one `Step <id> (<kind> [<agent>])` heading per step in execution-graph order; one line per
potential action: action identifier, decision (`allow`, `deny`, `requireApproval`), optional
well-known groups in `[...]`, and for non-`allow` decisions the reason (the sources that
contributed, in the order of the algorithm). `Result:` counts decisions.

**JSON result.**

```json
{
  "awp": "v1alpha1",
  "command": "simulate",
  "ok": true,
  "result": {
    "workflow": { "name": "vulnerability-fixer", "version": "0.1.0" },
    "environment": "development",
    "inputs": { "repository": "example-org/web-shop" },
    "steps": [
      {
        "id": "fix",
        "type": "agent",
        "agent": "fixer",
        "actions": [
          {
            "action": "github.merge_pull_request",
            "groups": ["git.merge"],
            "decision": "deny",
            "determinable": true,
            "evaluated": [
              { "source": "permissions", "result": "allow" },
              { "source": "policies.merge", "result": "deny", "detail": "allow=false" }
            ]
          }
        ]
      }
    ],
    "summary": { "allow": 6, "deny": 1, "requireApproval": 0 },
    "budgetCeiling": { "maxSteps": 30, "maxCostUsd": 2.0, "maxDurationSeconds": 900 },
    "diagnostics": []
  }
}
```

`decision` is one of `allow`, `deny`, `requireApproval`; each `evaluated` entry has the shape of an
entry of the `policy.evaluated` event ([spec 10.4](../spec/v1alpha1/README.md#104-event-types)).
For `requireApproval`, an `approval` object with `approvers`, `minApprovals`, `timeout` and
`onTimeout` is added. Exit code: `0` if the manifest is valid and the simulation completes (denied
actions are findings, not failures), `1` if the manifest is invalid or `--strict` is set and any
action is denied or a decision is not determinable. A simulation MUST NOT be presented as an audit
record, and runtimes MUST NOT write it to the audit log.

## 7. `awp plan`

```
awp plan [--environment <name>] [--profiles <list>] [--output text|json] <manifest>
```

`plan` summarizes what an execution of the manifest would be allowed to do and the **maximum** it
could consume, before anything runs. It validates the manifest first (a plan is only produced for a
valid manifest, otherwise the diagnostics of `validate` are printed and the exit code is `1`) and
resolves references and dependencies as far as the runtime can without executing
([spec 9.4](../spec/v1alpha1/README.md#94-dependencies)); a reference that cannot be resolved makes
the exit code `3`.

### 7.1 Text format

```
$ awp plan workflow.yaml

AWP Execution Plan

Workflow: vulnerability-fixer
Version: 0.1.0

Agents:
  researcher → claude
  fixer      → qwen3

Tools:
  github.read
  github.write
  shell.execute

Policies:
  ✓ cost limit
  ✓ tool permissions
  ✓ network policy
  ✓ production restriction

Human approval:
  required before merge

Estimated maximum:
  30 steps
  $2.00
  15 minutes
```

This is the layout of the project brief, section 21. The example corresponds to the
`vulnerability-fixer` example with `approval.requiredFor: [git.merge]` added; for the unmodified
example the `Human approval:` section reads `none`. Rules for each part:

- Header: the line `AWP Execution Plan`, a blank line, then `Workflow: <metadata.name>` and
  `Version: <metadata.version>`. Under `--environment`, a line `Environment: <name>` follows.
- `Agents:` one line per entry of `spec.agents` in order, `<id> → <model.name>` with ids padded to
  the longest id; ASCII fallback `->`. A reference shows `<id> → ref <name>@<version>`, a remote
  agent `<id> → a2a <endpoint host>`. The model name is `model.name`; `model.version` is appended
  as `@<version>` when declared.
- `Tools:` the actions and action groups the manifest permits: the keys of
  `permissions.tools` with `allow: true`, in manifest order, merged over workflow and agent
  permissions; if no `permissions` object applies, the tools exposed to the agents (`<server>.<tool>`
  or `<server>.*`) and the line `(no permissions object: all exposed tools)`.
- `Policies:` one line per **control** the manifest configures, with a mark: `✓` (ASCII `[ok]`) the
  control is present and the implementation can enforce it; `✗` (ASCII `[x]`) it is present but the
  implementation cannot enforce it, which also makes the plan fail with exit code `1` and a
  `plan.control-unenforceable` diagnostic. Controls and their sources:

  | Line | Present when |
  | ---- | ------------ |
  | `cost limit` | any `budget.maxCostUsd` |
  | `step limit` | any `budget.maxSteps` |
  | `time limit` | any `budget.maxDuration` or `timeout` |
  | `token and tool-call limits` | any `budget.resources.maxTokens` or `maxToolCalls` |
  | `tool permissions` | `permissions` present |
  | `network policy` | `permissions.network` present |
  | `filesystem policy` | `permissions.filesystem` present |
  | `<shorthand> restriction` | a `policies` shorthand with value `false` (`git push`, `git force-push`, `pull request`, `merge`, `production`) |
  | `policy <name>@<version>` | an entry of `policies.include` |
  | `data policy` | `dataPolicy` present |
  | `model policy` | `modelPolicy` present |
  | `environment autonomy` | `environments` present |
  | `audit` | `audit` present |
  | `separation of duties` | `approval.separationOfDuties.enabled: true` |

  Controls that are not configured are omitted (not marked with a cross).
- `Human approval:` the action keys of `approval.requiredFor` as `required before <label>`, where
  `<label>` is the last segment of a well-known action (`git.merge` → `merge`,
  `production.deploy` → `deploy`) or the action key otherwise; each approval step as
  `approval step <id>`; environment autonomy `approval-required` as `every action in <environment>`;
  risk level `high`/`critical` as the corresponding treatment. `none` if there is nothing.
- `Estimated maximum:` three lines from the effective (minimum over levels) workflow limits:
  `<maxSteps> steps`, `$<maxCostUsd with two decimals>`, `<maxDuration in minutes or h/m/s>`.
  An absent limit prints `unlimited`. These are **upper bounds from the budget**, not a prediction
  of actual usage. Durations print as `15 minutes`, `1 hour 30 minutes`, `45 seconds`.

With `--verbose` the text plan adds, after `Estimated maximum:`, the sections `Dependencies:`
(resolved set, one `<type> <reference> <digest>` per line), `Steps:` (execution graph, one line per
step with its dependencies) and `Warnings:` (the non-error diagnostics).

### 7.2 JSON result

```json
{
  "awp": "v1alpha1",
  "command": "plan",
  "ok": true,
  "result": {
    "workflow": { "name": "vulnerability-fixer", "version": "0.1.0", "digest": "sha256:5c4b3a29180716f5e4d3c2b1a0f9e8d7c6b5a49382716f5e4d3c2b1a0f9e8d7c" },
    "environment": null,
    "agents": [
      { "id": "researcher", "form": "inline", "model": { "provider": "anthropic", "name": "claude" } },
      { "id": "fixer", "form": "inline", "model": { "provider": "ollama", "name": "qwen3" } }
    ],
    "tools": [
      { "key": "github.read", "allow": true },
      { "key": "github.write", "allow": true },
      { "key": "shell.execute", "allow": true }
    ],
    "controls": [
      { "id": "cost-limit", "label": "cost limit", "status": "enforced", "source": "/spec/budget/maxCostUsd" },
      { "id": "tool-permissions", "label": "tool permissions", "status": "enforced", "source": "/spec/permissions" },
      { "id": "network-policy", "label": "network policy", "status": "enforced", "source": "/spec/permissions/network" },
      { "id": "production-restriction", "label": "production restriction", "status": "enforced", "source": "/spec/policies/production" }
    ],
    "approvals": [
      { "kind": "action", "action": "git.merge", "label": "merge", "approvers": [], "minApprovals": 1 }
    ],
    "steps": [
      { "id": "investigate", "type": "agent", "dependsOn": [] },
      { "id": "fix", "type": "agent", "dependsOn": ["investigate"] },
      { "id": "test", "type": "command", "dependsOn": ["fix"], "image": "registry.example.com/build/node@sha256:3f1d5c0a9e2b7c4d6e8f0a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f" }
    ],
    "dependencies": [
      { "type": "mcpServer", "name": "github", "url": "https://mcp.example.com/github" },
      { "type": "image", "reference": "registry.example.com/build/node@sha256:3f1d5c0a9e2b7c4d6e8f0a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f", "digest": "sha256:3f1d5c0a9e2b7c4d6e8f0a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f" }
    ],
    "estimatedMaximum": { "steps": 30, "costUsd": 2.0, "durationSeconds": 900 },
    "diagnostics": []
  }
}
```

| Field | Description |
| ----- | ----------- |
| `workflow.digest` | Manifest digest per [spec 9.1](../spec/v1alpha1/README.md#91-manifest-digest), computed by the implementation (never copied from `metadata.integrity`). |
| `environment` | The selected environment or `null`. |
| `agents[].form` | `inline`, `reference` or `remote`; `model` for inline, `ref` (`name`, `version`, `digest`) for references, `endpoint` for remote agents. |
| `controls[].status` | `enforced` or `unenforceable`; `source` is a JSON Pointer. |
| `approvals[]` | `kind`: `action`, `step`, `environment` or `risk`; plus the fields of the approval configuration. |
| `dependencies[]` | The resolved dependency set of [spec 9.4](../spec/v1alpha1/README.md#94-dependencies). `type`: `agent`, `policy`, `prompt`, `mcpServer`, `image`, `remoteAgent`. |
| `estimatedMaximum` | Effective limits; a missing limit is `null` (printed `unlimited`). |

Exit code: `0` for a valid, resolvable and enforceable plan; `1` if the manifest is invalid or a
control is unenforceable; `3` if a dependency cannot be resolved.

## 8. `awp run`

```
awp run [--environment <name>] [--input <name>=<value>]... [--no-wait]
        [--audit-out <file>] [--output text|json|jsonl] <manifest>
```

`run` performs an execution. It validates and plans first (a failed plan stops the command with the
exit code of the plan). `--input` provides input values; values are validated against the
declarations before the execution starts ([spec 5.3](../spec/v1alpha1/README.md#53-inputs)).
Approvals are requested interactively on a terminal or through the runtime's configured channel;
with `--no-wait` the command exits with code `11` as soon as an execution is waiting for approval,
leaving the execution in the state `waitingForApproval`.

**Text output** is one line per event on standard output (progress messages and approval prompts
go to standard error):

```
$ awp run workflow.yaml --input repository=example-org/web-shop --input cve=CVE-2026-12345
13:42:11 workflow.started   awp-exec-01JABC7Q4M2W9X0Y1Z2A3B4C5D vulnerability-fixer@0.1.0 env=development
13:42:11 agent.started      investigate   researcher (anthropic/claude)
13:42:30 tool.requested     investigate   github.search_code
13:42:30 tool.executed      investigate   github.search_code success 412ms
13:44:02 agent.completed    investigate   succeeded
...
13:55:12 workflow.completed succeeded     12 steps, $0.84, 13m01s

Execution awp-exec-01JABC7Q4M2W9X0Y1Z2A3B4C5D: succeeded
Audit log: ./awp-exec-01JABC7Q4M2W9X0Y1Z2A3B4C5D.events.jsonl
```

A line is `<local time> <event type, padded> <step id or execution id> <summary>`. The final lines
state the execution id, the status (`succeeded`, `failed`, `cancelled`, `waitingForApproval`) and,
if `--audit-out` was given or the runtime writes a log, its location.

**`jsonl`** writes the audit events of the execution to standard output, one event envelope per
line, exactly as defined in [spec 10.3](../spec/v1alpha1/README.md#103-event-envelope), in causal
order, followed by a final line with the summary object. The summary line has `"type": "x-awp.cli.summary"`
(an extension, not an audit event) and is the only line that is not an audit event:

```json
{"type":"x-awp.cli.summary","executionId":"awp-exec-01JABC7Q4M2W9X0Y1Z2A3B4C5D","status":"succeeded","usage":{"steps":12,"costUsd":0.84,"costKnown":true,"durationSeconds":781},"auditLog":"./awp-exec-01JABC7Q4M2W9X0Y1Z2A3B4C5D.events.jsonl","reproducibilityRecord":"./awp-exec-01JABC7Q4M2W9X0Y1Z2A3B4C5D.record.json"}
```

**`json`** writes only the summary as the `result` of the envelope:

```json
{ "awp": "v1alpha1", "command": "run", "ok": true,
  "result": { "executionId": "awp-exec-01JABC7Q4M2W9X0Y1Z2A3B4C5D", "status": "succeeded",
              "environment": "development", "usage": { "steps": 12, "costUsd": 0.84, "costKnown": true, "durationSeconds": 781 },
              "auditLog": "./awp-exec-01JABC7Q4M2W9X0Y1Z2A3B4C5D.events.jsonl",
              "reproducibilityRecord": "./awp-exec-01JABC7Q4M2W9X0Y1Z2A3B4C5D.record.json" } }
```

Events and the reproducibility record keep the formats of the specification ([section 10](../spec/v1alpha1/README.md#10-execution-audit-and-traceability));
with `audit.payload: metadata` the CLI output MUST NOT contain more than the events do (no prompts,
no tool results). Exit codes: `0` succeeded, `10` failed (including `reason: budgetExceeded`),
`11` cancelled or ended by a rejected or expired approval, `1` if plan or validation failed before
the execution started, `3` if the runtime could not start it.

## 9. `awp audit`

```
awp audit [--profiles <list>] [--output text|json] <manifest>...
awp audit --log <events.jsonl>... [--record <record>] [--output text|json]
```

`audit` has two modes. Both are read-only.

### 9.1 Manifest mode: governance posture

`awp audit workflow.yaml` reports which governance and audit controls the manifest declares and
where it relies on defaults. It validates first; for an invalid manifest it prints the diagnostics of
`validate` and exits `1`.

```
$ awp audit workflow.yaml

AWP Governance Audit

Workflow: invoice-processing 1.2.0   owner: finance-ai   classification: confidential   risk: high

Identity and supply chain:
  ✓ owner team
  ✓ classification
  ✓ manifest digest (sha256:9b2f6c1e…)
  ✓ signature (sigstore-bundle, signer release-pipeline@example.com)
  - provenance not declared
Governance:
  ✓ permissions (default deny)
  ✓ data policy (residency: EU)
  ✓ model policy
  ✓ human approval (production.deploy, git.merge)
  ✓ separation of duties
  ✓ environment autonomy
Audit:
  ✓ audit enabled (payload metadata, integrity hash-chain, retention 7y)
Findings:
  warning lint.unpinned-reference /spec/agents/2/ref: agent reference without digest

Result: 1 warning, 0 errors
```

Each check line is `✓ <name> (<detail>)` when the control is declared, `-` for an absent
optional item, `✗` for a missing or invalid required item (under the selected profiles). The checks
are: identity (`owner.team`, `classification`), supply chain (digest, signature, provenance,
pinned images and references), governance (`permissions`, `dataPolicy`, `modelPolicy`, `approval`,
`approval.separationOfDuties`, `environments`, `policies`) and audit (`audit`). The digest check
verifies `metadata.integrity.digest` against the computed digest. Findings are diagnostics;
`lint.*` findings appear as in `awp lint`. The audit states the facts of the manifest; it does not
assert compliance with any law, regulation or standard.

JSON result:

```json
{ "awp": "v1alpha1", "command": "audit", "ok": true,
  "result": { "mode": "manifest",
              "workflow": { "name": "invoice-processing", "version": "1.2.0" },
              "checks": [ { "id": "owner-team", "status": "present", "detail": "finance-ai" },
                          { "id": "provenance", "status": "absent" } ],
              "diagnostics": [],
              "summary": { "errors": 0, "warnings": 1 } } }
```

`checks[].status` is `present`, `absent` or `invalid`.

### 9.2 Log mode: audit trail verification

`awp audit --log events.jsonl` reads audit events (one envelope per line,
[spec 10.3](../spec/v1alpha1/README.md#103-event-envelope)) and verifies them:

1. every line is a valid event envelope with the required fields;
2. all events of one `executionId` are in causal order (`workflow.started` first, exactly one
   terminal `workflow.completed|failed|cancelled` last) and every `tool.requested` has a matching
   outcome (`tool.executed`, `tool.denied` or an approval event) ([spec 10.4](../spec/v1alpha1/README.md#104-event-types));
3. for `hash-chain` and `signed` integrity, the chain verifies ([spec 10.5](../spec/v1alpha1/README.md#105-tamper-evidence));
   signatures are verified only if the implementation supports the documented format;
4. under `payload: metadata` no event carries content fields (`arguments`/`inputs` values, prompts,
   tool results), and no event contains a value matching a declared secret;
5. with `--record`, the reproducibility record matches the log (workflow digest, execution id).

```
$ awp audit --log awp-exec-01JABC7Q4M2W9X0Y1Z2A3B4C5D.events.jsonl

AWP Audit Log Verification

Execution: awp-exec-01JABC7Q4M2W9X0Y1Z2A3B4C5D   workflow: vulnerability-fixer@0.1.0   status: succeeded
Events: 118   Integrity: hash-chain

  ✓ envelopes valid
  ✓ causal order
  ✓ hash chain intact (118 of 118 events)
  ✓ no content under payload=metadata
Approvals: 1 requested, 1 granted, 0 rejected, 0 expired
Denied actions: 1 (tool.denied reason=policy: policies.merge)

Result: verified
```

The result has `Result: verified` or `Result: failed` and, for failures, one diagnostic per problem
with the code prefix `audit.` (`audit.envelope-invalid`, `audit.order`, `audit.chain-broken`,
`audit.chain-missing`, `audit.content-in-metadata-payload`, `audit.record-mismatch`) and `path`
set to `/<line number>` of the event (1-based). A hash chain detects modification but not
deletion of a whole chain ([spec 12](../spec/v1alpha1/README.md#12-security-considerations));
`awp audit` says so in the result (`"anchored": false`) unless the log was checked against an
external anchor the implementation supports.

JSON result:

```json
{ "awp": "v1alpha1", "command": "audit", "ok": true,
  "result": { "mode": "log",
              "executions": [ { "executionId": "awp-exec-01JABC7Q4M2W9X0Y1Z2A3B4C5D",
                                "workflow": { "name": "vulnerability-fixer", "version": "0.1.0" },
                                "status": "succeeded", "events": 118, "integrity": "hash-chain",
                                "chainVerified": true, "anchored": false,
                                "approvals": { "requested": 1, "granted": 1, "rejected": 0, "expired": 0 },
                                "deniedActions": 1 } ],
              "diagnostics": [] } }
```

Exit code: `0` verified, `1` verification failed or the manifest is invalid, `3` unreadable input.

## 10. Stability

Everything in this document is part of the v1alpha1 draft: formats, codes and exit codes may change
incompatibly in a later alpha version. Diagnostic codes of the semantic catalogue and the exit code
meanings are kept stable within one alpha version as far as possible so that the conformance suite
([conformance/](../conformance/README.md)) can rely on them.
