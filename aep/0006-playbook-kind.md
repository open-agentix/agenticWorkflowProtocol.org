# AEP-0006: Kind `Playbook`: recurring tasks with deterministic steps and checks

| | |
| --- | --- |
| **AEP** | 0006 |
| **Title** | Kind `Playbook`: recurring tasks with deterministic steps and checks |
| **Authors** | @agentix-zero |
| **Shepherd** | Project lead (proposed; not an author, [aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)) |
| **Type** | Specification |
| **Status** | Review (proposed for `v1alpha2`; not accepted) |
| **Reviewer roles needed** | runtime implementer, security reviewer. None identified yet; an external review is required before `Accepted` ([aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)). |
| **Owner decisions** | [D8](../docs/alignment/decisions.md#d8-and-question-17-prompt-and-playbook-are-in-v1alpha2) (2026-10-10) |
| **Target API version** | `v1alpha2` |
| **Profiles affected** | `core`, `audit` |
| **Created** | 2026-10-09 |
| **Discussion** | issue to be opened |
| **Supersedes** | - |
| **Superseded-by** | - |

## Summary

Define the kind `Playbook` (also known in agent tooling as a "skill"): a reusable, versioned unit
for a recurring task that combines deterministic steps (commands), agent steps and **checks**
(machine-verifiable postconditions), with declared parameters and outputs. Workflows use a playbook
through a new step type `playbook`.

## Motivation

Recurring tasks (update a dependency, triage a finding, prepare a release note) are today either
free-form instructions (non-deterministic, hard to review) or whole workflows (too heavy to reuse
inside other workflows). Agent tools increasingly package such procedures as "skills": a text plus
scripts. Without a governed format, skills are copied between projects, loaded from the internet at
run time, and run with whatever permissions the host agent has. A `Playbook` kind gives them
identity, version, digest, declared permissions and checks.

## Goals and non-goals

- Goals: reusable procedures with explicit parameters, steps, permissions and checks; inclusion in
  workflows with the same governance as inline steps; checks that decide success independently of
  the model's own claim.
- Non-goals: a package manager or registry protocol (spec 1.3), dynamic loading of playbooks during
  an execution, nested playbooks (not in this AEP).

## Specification

### New section 6b: Kind `Playbook`

| `spec` field | Type | Req. | Description |
| ------------ | ---- | ---- | ----------- |
| `purpose` | string | yes | When to use this playbook, in plain language. |
| `parameters` | list | no | Same fields as workflow inputs (spec 5.3). |
| `agents` | list | no | Agents used by the playbook's agent steps (spec 5.4; references and inline). |
| `steps` | list | yes | Steps as in spec 5.6 (`agent`, `command`, `approval`; AEP-0001 `when` allowed). Expressions use `params.<name>` instead of `inputs.<name>`. |
| `checks` | list | yes | Postconditions, at least one (section below). |
| `outputs` | list | no | `name`, `from` (`steps.<id>.outputs.<name>`), `schema` (AEP-0003). |
| `permissions` | object | no | Permissions the playbook needs (spec 7.5). |
| `budget` | object | no | Default limits. |
| `actionGroups`, `mcpServers`, `secrets` | | no | As in `Workflow`. |

A check is one of:

| `type` | Fields | Passes when |
| ------ | ------ | ----------- |
| `command` | `command`, `image`, `env` (as command steps) | exit status `0` |
| `output` | `output` (an output name), `schema` (AEP-0003 subset) | the output satisfies the schema |
| `condition` | `when` (AEP-0001 expression) | the expression is `true` |

Checks run after all steps succeeded (or were skipped by condition), in order. A failing check
fails the playbook step with reason `checkFailed`. Model output never decides a check by itself:
`output` and `condition` checks read declared outputs, `command` checks run in the sandbox.

### New step type `playbook` (section 5.6.1)

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `playbook` | object | yes | `name`, `version` (exact), `digest` (OPTIONAL) of a `Playbook` manifest. |
| `with` | map | no | Parameter values; expression-enabled strings. |

Rules:

1. The playbook's steps run inside the step; their actions are attributed to the workflow step id
   and the inner step id (`stepId: "<step>/<inner>"`) in audit events.
2. Effective permissions are the combination (spec 7.5.4) of the workflow's, the playbook's and the
   agents' permissions: a playbook can only restrict, never extend, what the workflow allows.
3. Effective budgets are nested (spec 5.7): playbook usage counts against the step and the
   workflow.
4. The workflow's governance (`dataPolicy`, `modelPolicy`, `approval`, `policies`, `environments`)
   applies to everything inside the playbook.
5. Secrets: a playbook declares the secrets it needs; the workflow MUST declare and scope them
   (as for `Agent` manifests, spec 6).

### Audit

New event types `playbook.started`, `playbook.completed` (with `checks`: list of check results
without content) and `playbook.failed` (`reason`). The reproducibility record lists playbooks with
name, version and digest.

## Examples

```yaml
apiVersion: awp.agenticworkflowprotocol.org/v1alpha2
kind: Playbook
metadata:
  name: bump-patch-dependency
  version: 0.1.0
  owner:
    team: example-team
  classification: internal
spec:
  purpose: Update one dependency to a newer patch version and prove the build still passes.
  parameters:
    - name: package
      type: string
      required: true
      pattern: "^[a-z0-9@/._-]{1,100}$"
  agents:
    - id: fixer
      model: { provider: example-provider, name: example-model }
  steps:
    - id: update
      type: command
      command: ./scripts/update-patch.sh "$PACKAGE"
      env:
        PACKAGE: "${{ params.package }}"
    - id: notes
      agent: fixer
      dependsOn: [update]
      task: "Write a one-paragraph change note for ${{ params.package }}."
      outputs:
        - name: note
  checks:
    - type: command
      command: npm test
    - type: command
      command: ./scripts/assert-patch-only.sh
  outputs:
    - name: note
      from: steps.notes.outputs.note
  permissions:
    default: deny
    tools:
      shell.execute: { allow: true }
    network:
      egress: deny
      allowHosts: [registry.example.org]
```

```yaml
workflow:
  - id: bump
    type: playbook
    playbook: { name: bump-patch-dependency, version: 0.1.0 }
    with:
      package: "${{ inputs.package }}"
```

## Schema changes

- Root `kind` enum; `$defs/Playbook`, `$defs/PlaybookSpec`, `$defs/Check`; step type `playbook`.
- Expression roots `params.*` inside playbooks only.
- Semantic rules: `playbook.no-checks`, `playbook.output-from-unknown`, `expr.params-outside-playbook`,
  `playbook.nested` (a playbook step inside a playbook).

## Conformance impact

- `core`: validation of `Playbook` manifests; execution of playbook steps; check semantics;
  permission and budget combination.
- `audit`: `playbook.*` events; reproducibility record entries.
- New cases: `valid/6b-playbook.yaml`, `valid/5.6.1-playbook-step.yaml`; invalid:
  `6b-playbook-without-checks.yaml`, `6b-params-reference-in-workflow.yaml`,
  `6b-playbook-nested.yaml`, `5.6.1-playbook-step-version-range.yaml`.

## Compatibility and migration

Additive. Depends on AEP-0001 (conditions in checks), AEP-0003 (schemas) and AEP-0010 (digests), all in
`v1alpha2`. If one of them moves to a later version, this AEP moves with it.

## Security considerations

- Playbooks are dependencies: exact versions, digests, trusted registries (spec 9.4). Runtimes
  MUST NOT download playbooks during an execution.
- A playbook cannot widen permissions (rule 2), so a copied "skill" cannot grant itself tools.
- Checks give a success signal that does not depend on the model's self-report.
- Command steps and command checks remain `shell.execute` actions under isolation (spec 5.6.2).

## Privacy considerations

Same as workflows; playbook outputs inherit classifications (spec 7.2).

## Compliance note

AWP provides machine-readable governance primitives that can help organizations implement and
enforce their own compliance requirements. This proposal makes no compliance promise.

## Alternatives

- **Workflow references a workflow** (sub-workflows): heavier, carries its own triggers and
  governance sections that would conflict with the parent's.
- **Skills as Markdown plus scripts without a manifest**: no identity, no permissions, no checks.
- **Do nothing**: procedures stay in prompts.

## Implementation status

No implementation of this AEP exists. OpenAgentix (in progress, not conformant) has development
guidelines and toolbox images, which are related but not the same concept.

## Open questions

1. Name: `Playbook`, `Skill` or `Procedure`?
2. Should checks be allowed to run between steps (preconditions)?
3. Should a playbook be runnable on its own (as a one-step workflow, like `Agent`)?

## Decision

Owner direction of 2026-10-10 (D8): the kind `Playbook` is in `v1alpha2` (previously proposed for `v1alpha3` or later). Not accepted; needs the reviews listed in the header ([aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)).

## References

- Spec sections 5.3, 5.6, 5.7, 6, 7.5, 9.4.
- AEP-0001, AEP-0003, AEP-0005.
