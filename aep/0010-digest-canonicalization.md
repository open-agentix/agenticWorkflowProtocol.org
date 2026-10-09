# AEP-0010: Digest canonicalisation (JCS) for manifests

| | |
| --- | --- |
| **AEP** | 0010 (proposed; numbered in pull request order, pending maintainer assignment) |
| **Title** | Digest canonicalisation (JCS) for manifests |
| **Authors** | @agentix-zero |
| **Shepherd** | to be assigned |
| **Type** | Specification |
| **Status** | Draft |
| **Target API version** | `v1alpha2` |
| **Profiles affected** | `core`, `security` |
| **Created** | 2026-10-09 |
| **Discussion** | issue to be opened |
| **Supersedes** | - |
| **Superseded-by** | - |

## Summary

Make the manifest digest of spec 9.1 reproducible across languages by specifying the data model
the JCS (RFC 8785) serialization is applied to: how YAML is mapped to JSON values, which numbers and
strings are allowed, that extension fields are included, how multi-document files and wrapped
manifests are handled, and a set of test vectors.

## Motivation

Spec 9.1 says "JCS serialization of the manifest without integrity, signature and provenance". Two
implementations can still compute different digests for the same YAML file because:

- YAML scalars resolve differently between YAML 1.1 and 1.2 schemas (`yes`, `on`, `0o17`, `.inf`,
  timestamps).
- Numbers outside the IEEE 754 double range or above 2^53 lose precision in some parsers and not in
  others; `-0`, `5.00` and `1e21` need a fixed rendering.
- Strings with lone surrogates are valid in some parsers and invalid in JCS.
- It is not stated whether `x-` extension fields are part of the digest.
- Implementations that embed manifests in other files (for example Markdown front matter) need a
  rule for what is hashed.

## Goals and non-goals

- Goals: one digest per manifest, independent of YAML formatting, key order, comments and
  language; test vectors in the conformance suite.
- Non-goals: signature formats (spec 9.2), digests of non-manifest artefacts.

## Specification

### Replace section 9.1 with

1. **Data model.** The manifest is parsed into a JSON value (RFC 8259) with these rules:
   - YAML documents are parsed with the YAML 1.2 **core schema**. Tags other than the core schema
     tags are rejected (spec 3.1). Timestamps are not a type: they are strings.
   - Mapping keys MUST be strings and MUST be unique.
   - Numbers MUST be finite and MUST be representable as IEEE 754 double precision values without
     loss; integers MUST be in the range -(2^53 - 1) to 2^53 - 1. Manifests with other numbers MUST
     be rejected. (`.inf`, `.nan` are rejected.)
   - Strings MUST be valid Unicode scalar value sequences (no lone surrogates). No Unicode
     normalisation is applied: `é` composed and decomposed are different strings.
   - `null` is a value and is serialised; absent fields are absent.
2. **Removed fields.** `metadata.integrity`, `metadata.signature` and `metadata.provenance` are
   removed. Nothing else is removed. In particular **`x-` extension fields are included**: an
   extension that changes behaviour must change the digest.
3. **Serialisation.** The value is serialised with RFC 8785 (JCS): object members sorted by the
   UTF-16 code units of their names, numbers in the ECMAScript shortest round-trip form (`5.00` ->
   `5`, `-0` -> `0`, `1e21` -> `1e+21`), strings with the JSON escapes of RFC 8785, no whitespace.
4. **Hash.** The digest is `<algorithm>:<lowercase hex>` of the hash of the UTF-8 bytes of the
   serialisation (spec 3.8).
5. **Multi-document files.** Each document has its own digest; a file has no digest.
6. **Embedded manifests.** When a manifest is embedded in another format, the embedding format MUST
   define the **effective manifest** (the JSON value after all injections, for example instructions
   taken from Markdown sections) and the digest is computed over the effective manifest. Content of
   the embedding format that is not part of the effective manifest is not covered by the digest.

### Test vectors

Computed with the reference checker (`manifestDigest` in `conformance/semantic.mjs`):

| Vector | Manifest (JSON) | sha256 digest |
| --- | --- | --- |
| V1 | The example of the AEP template (`example`, owner `example-team`, classification `internal`, one agent `assistant` with provider `example-provider` and model `example-model`, one step `run`) | `sha256:93f0e48f05f1d0587eb3dff64d72435550760e12f8c1659f4a795ceb88acc4d2` |
| V2 | V1 plus `metadata.integrity.digest` (any value) | same as V1 (integrity removed) |
| V3 | V1 plus `metadata.description: "Grüße €"`, `spec.budget: {maxCostUsd: 0.5, maxSteps: 10}` and a top-level `x-example-mode: standard` | `sha256:0c3262ff08d3b28a5472041cbe6b41d06c201f35374ba1fe05f6b985f92eac5b` |
| V4 | V3 without `x-example-mode` | `sha256:300d10178af15eb219ade2e97de1912c2b2befd96500dab75363ca48bc1554d3` (differs from V3: extensions are covered) |

JCS serialisation of V1:

```text
{"apiVersion":"awp.agenticworkflowprotocol.org/v1alpha1","kind":"Workflow","metadata":{"classification":"internal","name":"example","owner":{"team":"example-team"},"version":"0.1.0"},"spec":{"agents":[{"id":"assistant","model":{"name":"example-model","provider":"example-provider"}}],"workflow":[{"agent":"assistant","id":"run"}]}}
```

Number rendering, YAML input `{maxCostUsd: 5.00, big: 1e21, neg: -0.0}` serialises as
`{"big":1e+21,"maxCostUsd":5,"neg":0}`.

The vectors use `apiVersion` `v1alpha1` because they are computed with the current checker; the
final AEP text would recompute them for the target version.

## Examples

See the test vectors.

## Schema changes

None. The number and string rules are semantic rules: `number.out-of-range`, `string.lone-surrogate`
(both errors, section 3.1).

## Conformance impact

- `core`: digest rules; verification of `metadata.integrity.digest` and reference digests.
- New cases: `valid/9.1-digest-with-extension.yaml` (V3 with its digest, `verifyDigest: true`),
  `valid/9.1-digest-yaml-formatting.yaml` (V1 written with different key order, comments and flow
  style, same digest); invalid: `3.1-number-too-large.yaml` (`number.out-of-range`),
  `3.1-yaml-inf.yaml`, `9.1-digest-extension-changed.yaml` (`digest.mismatch`).
- The reference checker needs a check for unsafe integers and lone surrogates; its current JCS
  function is otherwise sufficient for parser output.

## Compatibility and migration

Manifests that use numbers beyond 2^53 or `.inf` become invalid; none of the current examples or
conformance cases do. Digests of existing manifests do not change.

## Security considerations

- A digest that differs between implementations causes either false integrity failures or, worse,
  implementations that skip verification. A fixed data model avoids both.
- Including extensions prevents swapping behaviour-changing extension values under a valid digest.
- Unicode is not normalised so that visually similar but different identifiers stay different;
  validators MAY warn about confusable characters.

## Privacy considerations

None.

## Compliance note

AWP provides machine-readable governance primitives that can help organizations implement and
enforce their own compliance requirements. This proposal makes no compliance promise.

## Alternatives

- **Hash the source bytes**: depends on formatting; YAML and JSON forms of one manifest would have
  different digests.
- **Canonical YAML**: no widely implemented standard.
- **Exclude extensions**: would let behaviour change under an unchanged digest.

## Implementation status

The reference checker in this repository computes digests as described for parser output.
OpenAgentix (in progress, not conformant) has a canonical JSON function that matches JCS for
parser output, used today over its Markdown source rather than over a manifest.

## Open questions

1. Should Unicode normalisation (NFC) be required for identifiers only?
2. Should the digest algorithm be fixed to `sha256` for `v1alpha2`?

## References

- RFC 8785 (JCS), RFC 8259, RFC 7493 (I-JSON), YAML 1.2.2 core schema.
- Spec sections 3.1, 3.8, 9.1.
