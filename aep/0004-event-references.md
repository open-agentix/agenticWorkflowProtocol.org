# AEP-0004: Event references (`${{ event.* }}`)

| | |
| --- | --- |
| **AEP** | 0004 |
| **Title** | Event references (`${{ event.* }}`) |
| **Authors** | @agentix-zero |
| **Shepherd** | Project lead (proposed; not an author, [aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)) |
| **Type** | Specification |
| **Status** | Review (proposed for `v1alpha2`; not accepted) |
| **Reviewer roles needed** | runtime implementer, security reviewer, privacy reviewer. None identified yet; an external review is required before `Accepted` ([aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)). |
| **Owner decisions** | [D7](../docs/alignment/decisions.md#d7-own-event-root) (2026-10-10) |
| **Target API version** | `v1alpha2` |
| **Profiles affected** | `core` |
| **Created** | 2026-10-09 |
| **Discussion** | issue to be opened |
| **Supersedes** | - |
| **Superseded-by** | - |

## Summary

Add the expression root `event` for executions started by a trigger of type `event`, with the
fields `event.source`, `event.type`, `event.id`, `event.time` and `event.data.*`. Allow triggers to
declare the expected shape of `event.data` with a schema (AEP-0003 subset) and a classification.

## Motivation

Spec 5.2 lets events start executions, but the payload is unreachable: section 3.9 has no root for
it. Authors and converters map the payload to a workflow input (`inputs.event`), which hides that
the value comes from an external, unauthenticated-by-content sender, gives it the input's
classification by default, and makes manual starts and event starts look the same.

## Goals and non-goals

- Goals: a read-only root for the triggering event; a declared shape and classification for event
  data; a clear rule when no event exists.
- Non-goals: event sources and their authentication (implementation-defined, spec 5.2), event
  replay, several events per execution.

## Specification

### Changes to section 3.9

Add the reference:

- `event.source`, `event.type`, `event.id`, `event.time`: metadata of the event that started the
  execution;
- `event.data` and `event.data.<path>`: the event payload, with `.<name>` and `[<index>]` segments.

A reference to `event.*` in an execution that was not started by an `event` trigger is an
evaluation error (the step fails with reason `missingEvent`); inside `exists()` (AEP-0001) it is
`false`. Validators MUST reject `event.*` references in a workflow that has no `event` trigger.

### Changes to section 5.2 (event triggers)

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `dataSchema` | object | no | Schema (AEP-0003 subset) for `event.data`. The runtime MUST validate the payload before the execution starts and MUST NOT start an execution with an invalid payload (event dropped, recorded). |
| `classification` | string | no | Data class of `event.data`. Default: `metadata.classification`. |

When a workflow has several event triggers, `event.*` refers to the one that started the
execution; `event.source` and `event.type` let conditions distinguish them.

### Data policy

`event.data` is an untrusted external input. Its classification enters the data classification of
every operation in a step that references it (spec 7.2).

## Examples

```yaml
spec:
  triggers:
    - type: event
      source: git.example.com
      eventType: pull_request.opened
      classification: internal
      dataSchema:
        type: object
        required: [repository, number]
        properties:
          repository: { type: string, maxLength: 200, pattern: "^[a-z0-9-]+/[a-z0-9-]+$" }
          number: { type: integer, minimum: 1 }
  workflow:
    - id: review
      agent: reviewer
      task: "Review pull request ${{ event.data.number }} in ${{ event.data.repository }}."
```

## Schema changes

- `Expression` pattern: add the `event` root.
- Trigger `event`: `dataSchema`, `classification`.
- Semantic rules: `expr.event-without-trigger`; reuse of AEP-0003 schema rules for `dataSchema`.

## Conformance impact

- `core`: static rule; runtime payload validation before start; `missingEvent` failure.
- New cases: `valid/3.9-event-reference.yaml`; invalid: `3.9-event-without-event-trigger.yaml`,
  `5.2-event-data-schema-invalid-keyword.yaml`.

## Compatibility and migration

Additive. Converters that mapped events to an `object` input can switch to `event.data`.

## Security considerations

- Event payloads are attacker-controllable in many deployments (public webhooks). Validation before
  start and bounded schemas reduce what reaches a model. Event data used in `command` steps still
  only flows through `env` (spec 5.6.2).
- Authenticity of the event remains the runtime's duty (spec 5.2).

## Privacy considerations

Payloads often contain personal data. The trigger `classification` lets data policies apply; under
`payload: metadata`, `workflow.started` records a digest of the event data, not the data.

## Compliance note

AWP provides machine-readable governance primitives that can help organizations implement and
enforce their own compliance requirements. This proposal makes no compliance promise.

## Alternatives

- **Always map events to inputs** (rejected by owner decision D7): works, but loses the distinction between operator-provided and
  externally-provided values, and needs a naming convention per runtime.
- **Expose the raw transport envelope** (headers, signatures): implementation-specific; rejected.

## Implementation status

OpenAgentix (in progress, not conformant) exposes `event.data` to conditions and as an input source
in its own format. No implementation of this AEP exists.

## Open questions

1. Should `event.time` be the event's own timestamp or the receipt time?
2. Should `dataSchema` be REQUIRED under the security profile?

## Decision

Owner direction of 2026-10-10 (D7): an own root `${{ event.* }}`; events are not mapped to inputs. Target `v1alpha2`. Not accepted; needs the reviews listed in the header ([aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)).

## References

- Spec sections 3.9, 5.2, 7.2.
- AEP-0001, AEP-0003.
