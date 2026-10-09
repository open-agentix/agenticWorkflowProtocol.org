# AEP-0011: Required extensions (`metadata.requiredExtensions`)

| | |
| --- | --- |
| **AEP** | 0011 (proposed; numbered in pull request order, pending maintainer assignment) |
| **Title** | Required extensions (`metadata.requiredExtensions`) |
| **Authors** | @agentix-zero |
| **Shepherd** | to be assigned |
| **Type** | Specification |
| **Status** | Draft |
| **Target API version** | `v1alpha2` |
| **Profiles affected** | `core` |
| **Created** | 2026-10-09 |
| **Discussion** | issue to be opened |
| **Supersedes** | - |
| **Superseded-by** | - |

## Summary

Let a manifest declare extension fields that a runtime **must understand** to execute it:
`metadata.requiredExtensions` is a list of extension field names. A runtime that does not implement
every listed extension MUST reject the manifest. This keeps the fail-closed principle of spec 3.3
for extensions that restrict behaviour.

## Motivation

Spec 3.3 says runtimes MUST ignore extension fields they do not interpret, and that extension fields
MUST NOT weaken requirements. Both are right, but they leave a gap: an extension that **adds** a
restriction (an argument check, a condition, an isolation requirement) is silently dropped by every
runtime that does not know it. The manifest then runs with fewer restrictions than its author
intended, which is the outcome spec 3.3 item 2 wants to avoid for unknown core fields.

Implementations need extensions while proposals are discussed (the [alignment
matrix](../docs/alignment/openagentix-matrix.md) shows 11 such fields for one implementation). The
same pattern exists elsewhere: JOSE `crit` header parameters (RFC 7515 section 4.1.11) and critical
X.509 extensions (RFC 5280 section 4.2).

## Goals and non-goals

- Goals: fail closed for restricting extensions; machine-checkable; no registry needed.
- Non-goals: defining the content of any extension, negotiating extension versions.

## Specification

### Changes to section 4 (metadata)

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `requiredExtensions` | list of string | no | Names of extension fields (each MUST start with `x-`) that a runtime MUST implement to accept this manifest. |

### Changes to section 3.3

Add item 4:

4. If `metadata.requiredExtensions` lists an extension field name that the implementation does not
   implement, the implementation MUST reject the manifest with an error that names the extension.
   A validator that does not execute manifests (for example a linter) MAY accept such a manifest
   but MUST report the required extensions. An implementation MUST NOT list in its conformance
   statement an extension it does not enforce.

Static rules:

1. Every entry MUST match `^x-[a-zA-Z0-9][a-zA-Z0-9_-]*$` and MUST be unique.
2. Every listed name SHOULD occur as a field somewhere in the manifest (warning otherwise).
3. A field name listed in `requiredExtensions` is required wherever it occurs in the manifest.

`requiredExtensions` is part of the digest (AEP-0010 includes all fields except integrity,
signature and provenance).

## Examples

```yaml
apiVersion: awp.agenticworkflowprotocol.org/v1alpha2
kind: Workflow
metadata:
  name: ticket-updater
  version: 2.0.0
  owner:
    team: example-team
  classification: internal
  requiredExtensions:
    - x-example-args
spec:
  agents:
    - id: updater
      model: { provider: example-provider, name: example-model }
      tools:
        - { type: mcp, server: tickets, tools: [update_ticket] }
      permissions:
        default: deny
        tools:
          tickets.update_ticket:
            allow: true
            x-example-args:
              key: { type: string, pattern: "^SEC-[0-9]+$" }
  workflow:
    - id: update
      agent: updater
```

A runtime that does not implement `x-example-args` rejects this manifest instead of allowing any
ticket key.

## Schema changes

- `Metadata.requiredExtensions`: array of strings with pattern `^x-[a-zA-Z0-9][a-zA-Z0-9_-]*$`,
  `uniqueItems: true`.
- Semantic rule (warning): `extension.required-not-used`. Reference checker option
  `--extensions <list>` to declare implemented extensions; without it, the checker reports
  `extension.required-unsupported` as an error for executing contexts and as a warning in lint mode.

## Conformance impact

- `core`: rejection rule.
- New cases: `valid/3.3-required-extension-declared.yaml` (checker run with the extension
  declared); invalid: `3.3-required-extension-unsupported.yaml`
  (`extension.required-unsupported`), `3.3-required-extension-not-x.yaml` (`schema.pattern`),
  `3.3-required-extension-duplicate.yaml` (`schema.uniqueItems`).

## Compatibility and migration

A `v1alpha1` runtime rejects `metadata.requiredExtensions` as an unknown field, which is the
correct, fail-closed outcome. Manifests without the field are unaffected.

## Security considerations

- Restores fail-closed behaviour for restricting extensions.
- Does not make extensions portable; it makes their absence visible. Restrictions that matter to
  many implementations should still become core fields through AEPs.
- An author can mark a permissive extension as required; that only reduces portability, never
  safety.

## Privacy considerations

None.

## Compliance note

AWP provides machine-readable governance primitives that can help organizations implement and
enforce their own compliance requirements. This proposal makes no compliance promise.

## Alternatives

- **Naming convention** (for example `x-crit-...`): breaks existing names and is easy to get wrong.
- **Per-field flag inside the extension value**: requires parsing unknown extensions.
- **Forbid restricting extensions**: forces implementations to choose between dropping controls and
  waiting for AWP releases.

## Implementation status

No implementation of this AEP exists. The OpenAgentix alignment proposes to list its critical
`x-openagentix-*` fields here ([namespace](../docs/alignment/x-openagentix-extensions.md)).

## Open questions

1. Should required extensions be declarable per object instead of per manifest?
2. Should a conformance statement list the extensions an implementation enforces?

## References

- RFC 7515 section 4.1.11 (`crit`), RFC 5280 section 4.2.
- Spec section 3.3.
