# AEP-0009: Audit payload levels and content retention

| | |
| --- | --- |
| **AEP** | 0009 |
| **Title** | Audit payload levels and content retention |
| **Authors** | @agentix-zero |
| **Shepherd** | Project lead (proposed; not an author, [aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)) |
| **Type** | Specification |
| **Status** | Review (proposed for `v1alpha3`; not accepted) |
| **Reviewer roles needed** | runtime implementer, privacy reviewer, security reviewer. None identified yet; an external review is required before `Accepted` ([aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)). |
| **Owner decisions** | [D11](../docs/alignment/decisions.md#d11-contentretention-is-mandatory-with-a-documented-default) (2026-10-10) |
| **Target API version** | `v1alpha3` |
| **Profiles affected** | `audit` |
| **Created** | 2026-10-09 |
| **Discussion** | issue to be opened |
| **Supersedes** | - |
| **Superseded-by** | - |

## Summary

Refine `audit.payload` (spec 10.2) into explicit levels: `metadata` (default, unchanged meaning),
`redacted` (structure and non-sensitive values, secrets and classified fields replaced) and
`content` (full content). Content beyond `metadata` gets its own, mandatory retention
(`contentRetention`), separate from the retention of the metadata events, and is stored so that it
can be erased without breaking the integrity chain.

## Motivation

`v1alpha1` offers `metadata` and `full`, and one `retention.duration` for everything. In practice:

- Debugging and review need some content for a short time; audit evidence needs metadata for a long
  time. One retention value forces either long-lived content (data minimisation conflict, spec 13)
  or short-lived evidence.
- Erasure requests for personal data conflict with hash chains when content is part of the hashed
  event.
- `full` is a single switch; there is no middle ground that keeps structure but drops values.

## Goals and non-goals

- Goals: metadata-only default; opt-in content with an explicit, bounded retention; erasable
  content with verifiable chains; per-classification limits.
- Non-goals: a storage format, encryption scheme or key management (implementation concerns,
  spec 10.5).

## Specification

### Changes to section 10.2

| Field | Type | Description |
| ----- | ---- | ----------- |
| `payload` | string | `metadata` (default), `redacted` or `content`. `full` is accepted as a deprecated alias of `content` in `v1alpha3` and removed later. |
| `contentRetention` | duration | REQUIRED when `payload` is not `metadata`. Maximum time content is kept. Documented default: `7d` (see below). |
| `maxContentClassification` | string | Highest data class whose content may be recorded. Content of operations with a higher class is recorded as `metadata`. Default: `internal`. |
| `retention.duration` | duration | Unchanged: minimum retention of the events (metadata). |

Levels:

| Level | Events contain |
| ----- | -------------- |
| `metadata` | Identifiers, digests, decisions, sizes, counts, error codes. No content of inputs, outputs, prompts, tool arguments or tool results. |
| `redacted` | As `metadata`, plus the structure (keys, types, lengths) and values that are neither secrets nor classified above `public`. |
| `content` | As `redacted`, plus all values up to `maxContentClassification`. Secrets are always redacted (spec 7.9). |

Default for `contentRetention`: the field has no implicit value. Its documented default is `7d`:
authoring tools, converters and exporters MUST write `contentRetention: 7d` into the manifest when
content capture is enabled and the author has not chosen a value, and MUST show the value to the
author. Validators MUST reject a manifest with `payload` other than `metadata` and without
`contentRetention`; runtimes MUST NOT assume a value. The value is thus part of the reviewed and
digested manifest.

Rules:

1. Content (everything beyond `metadata`) MUST be stored separately from the hashed event and
   referenced from it by a **salted digest** (HMAC-SHA-256 with a per-event random salt stored with
   the content). Erasing content removes the content and the salt; the event and its chain stay
   verifiable, and verification reports the event as `contentErased`.
2. Runtimes MUST delete content when `contentRetention` has passed, and MUST be able to erase the
   content of a single execution on request.
3. A runtime that cannot honour `contentRetention` or the separation in rule 1 MUST reject the
   manifest (as for `integrity.mode`, spec 10.2).
4. Runtimes MAY enforce a lower maximum `contentRetention` or level by configuration and MUST then
   reject manifests that request more.

## Examples

```yaml
audit:
  payload: redacted
  contentRetention: 7d
  maxContentClassification: internal
  integrity:
    mode: hash-chain
  retention:
    duration: 2y
```

## Schema changes

- `Audit.payload` enum `metadata`, `redacted`, `content`, `full` (deprecated); `contentRetention`,
  `maxContentClassification`.
- Semantic rules: `audit.content-retention-required`, warning `audit.payload-full-deprecated`.

## Conformance impact

- `audit`: levels, separation, erasure, retention.
- New cases: `valid/10.2-payload-redacted.yaml`; invalid: `10.2-content-without-retention.yaml`,
  `10.2-invalid-max-content-classification.yaml`.

## Compatibility and migration

`payload: metadata` keeps its meaning. `full` maps to `content` and now requires
`contentRetention`; a `v1alpha1` manifest with `full` needs that field when it moves to the new
version.

## Security considerations

- Salted digests prevent recovering low-entropy erased content by brute force.
- Content stores are a high-value target; the default stays `metadata`.
- Redaction is best effort for unstructured text; `maxContentClassification` is the main control.

## Privacy considerations

The proposal is mainly a privacy measure: short content retention, erasure without breaking audit
integrity, and no content above a classification. Approver identities in events remain personal
data in some jurisdictions (spec 13).

## Compliance note

AWP provides machine-readable governance primitives that can help organizations implement and
enforce their own compliance requirements. This proposal makes no compliance promise.

## Alternatives

- **Keep `full` and one retention**: conflicts described above.
- **Encrypt content inside the event**: erasure by key deletion works, but the chain then covers
  ciphertext whose key may be lost; separation with salted digests is simpler to verify.
- **Implicit runtime default** for content retention: rejected by owner decision D11 in favour of
  a mandatory field with a documented default (`7d`) that tools write explicitly.
- **No documented default**: leaves every tool to pick its own value; rejected (D11).

## Implementation status

OpenAgentix (in progress, not conformant) records metadata by default for new tenants, has an
optional short retention window per tenant and salted payload digests for erasure, in its own
audit format. No implementation of this AEP exists.

## Open questions

1. Should `redacted` be defined more precisely (which values count as non-sensitive)?
2. Should approval requests (spec 7.6) follow the same levels?

## Decision

Owner direction of 2026-10-10 (D11): `contentRetention` is mandatory when content capture is used, with the documented default `7d` that tools write explicitly ([conflict C4](../docs/alignment/decisions.md#c4-mandatory-field-with-a-default-value)). Not in the `v1alpha2` scope of D8; target `v1alpha3` ([conflict C3](../docs/alignment/decisions.md#c3-d10-and-d11-decide-details-but-not-the-target-version)). Not accepted; needs the reviews listed in the header ([aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)).

## References

- Spec sections 7.9, 10.2, 10.3, 10.5, 13.
