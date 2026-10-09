# AEP-0000: Title of the proposal

<!--
Template for AWP Enhancement Proposals. The process is proposed in docs/aep-process.md (draft).
Copy this file to aep/0000-short-title.md; a maintainer assigns the number.
Write in English. Use the key words MUST, SHOULD and MAY (BCP 14) only in normative text.
No secrets, no real personal data in examples (use example.com / example.org).
-->

| | |
| --- | --- |
| **AEP** | 0000 (assigned by a maintainer) |
| **Title** | |
| **Authors** | GitHub handles |
| **Shepherd** | Maintainer GitHub handle (assigned) |
| **Type** | Specification / Process / Informational |
| **Status** | Draft |
| **Target API version** | for example `v1alpha2` (Specification AEPs only) |
| **Profiles affected** | `core`, `governance`, `audit`, `security`, `mcp`, `a2a` or none |
| **Created** | YYYY-MM-DD |
| **Discussion** | link to the issue |
| **Supersedes** | AEP number, if any |
| **Superseded-by** | AEP number, if any |

## Summary

One paragraph: what changes and why.

## Motivation

The problem, who has it, and why the current specification cannot solve it. Concrete use cases.

## Goals and non-goals

- Goals:
- Non-goals:

## Specification

The proposed normative text, written as it would appear in the specification, with the sections it
changes. Field tables use the columns of the specification (Field, Type, Req., Description).

## Examples

Non-normative manifests that show the change. They must be valid against the proposed rules.

```yaml
apiVersion: awp.agenticworkflowprotocol.org/v1alpha1
kind: Workflow
metadata:
  name: example
  version: 0.1.0
  owner:
    team: example-team
  classification: internal
spec:
  agents:
    - id: assistant
      model:
        provider: example-provider
        name: example-model
  workflow:
    - id: run
      agent: assistant
```

## Schema changes

Changes to `schema/awp.<version>.json` and to the semantic rules in `schema/README.md`.

## Conformance impact

- New or changed requirements per profile.
- New valid and invalid test cases (file names, rule, expected diagnostic code and path).
- Runtime tests, once a runtime suite exists.
- Which profile a new field belongs to (spec section 3.3).

## Compatibility and migration

- Is the change compatible (see docs/aep-process.md section 6.1)? Which manifests change from
  valid to invalid or the other way round?
- Migration path for manifest authors and runtimes.

## Security considerations

Effects on fail-closed behaviour, prompt injection, secrets, approvals, audit integrity.

## Privacy considerations

Effects on personal data in manifests, audit events and approvals.

## Compliance note

AWP provides machine-readable governance primitives that can help organizations implement and
enforce their own compliance requirements. This proposal makes no compliance promise.

## Alternatives

Other designs that were considered and why they were not chosen, including "do nothing".

## Implementation status

Known implementation work, stated factually. Do not state that a platform supports AWP or this
proposal unless that project has said so publicly.

## Open questions

## References
