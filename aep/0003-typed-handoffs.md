# AEP-0003: Typed handoffs between steps

| | |
| --- | --- |
| **AEP** | 0003 (proposed; numbered in pull request order, pending maintainer assignment) |
| **Title** | Typed handoffs between steps |
| **Authors** | @agentix-zero |
| **Shepherd** | to be assigned |
| **Type** | Specification |
| **Status** | Draft |
| **Target API version** | `v1alpha2` |
| **Profiles affected** | `core`, `audit` |
| **Created** | 2026-10-09 |
| **Discussion** | issue to be opened |
| **Supersedes** | - |
| **Superseded-by** | - |

## Summary

Let step outputs carry a JSON Schema (a restricted subset) that the runtime validates before
dependent steps start, let steps validate what they receive, and let a step declare its input
**sources** (`from`) so that it receives exactly those values and nothing else. Named schemas live
in `spec.schemas`.

## Motivation

In `v1alpha1` a step output is a named, untyped value (spec 5.6.1). A dependent step's `task`
interpolates it as text. Three problems follow:

1. Conditions (AEP-0001) and write actions read model output whose shape is not checked.
2. A model can smuggle instructions into an output that the next step treats as its task text;
   validated, bounded, typed values reduce that surface.
3. There is no way to say "this step sees only the analysis result and the event, nothing else",
   which is how least-privilege data flow is reviewed.

## Goals and non-goals

- Goals: portable output and input validation; a bounded JSON Schema subset that every runtime can
  implement identically; explicit input sources; defined failure and retry behaviour.
- Non-goals: schemas for tool arguments (AEP-0002), streaming outputs, artifact formats (files).

## Specification

### New section 5.8: Schemas

`spec.schemas` maps a schema name (`^[A-Za-z][A-Za-z0-9_-]{0,62}$`, at most 32 entries) to a JSON
Schema in the **AWP schema subset**:

- Keywords: `type`, `enum`, `const`, `properties`, `required`, `additionalProperties`, `items`,
  `minItems`, `maxItems`, `uniqueItems`, `minLength`, `maxLength`, `pattern`, `minimum`, `maximum`,
  `exclusiveMinimum`, `exclusiveMaximum`, `anyOf`, `$ref`, and the annotations `title`,
  `description`, `examples`, `default`, `$comment`. Any other keyword MUST be rejected.
- `$ref` MUST have the form `#/spec/schemas/<name>` and MUST name an entry of `spec.schemas`. No
  remote references, no recursion (direct or indirect).
- `pattern` MUST be accompanied by `maxLength` (at most 4096) and MUST NOT use backreferences,
  lookaround or a quantified group that contains a quantifier.
- Limits per schema: 32 KiB serialized, depth 12, 512 nodes, 128 properties per object, 128 enum
  values.
- Validation semantics are those of JSON Schema draft 2020-12 for these keywords, without format
  assertions, coercion or default insertion.

### Changes to section 5.6.1 (step outputs and inputs)

Output entries gain:

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `schema` | object | no | Schema (subset) the output value MUST satisfy; inline or `{ "$ref": "#/spec/schemas/<name>" }`. |
| `onInvalid` | string | no | `fail` (default) or `retry`: one further model turn for agent steps with the list of failed keywords and instance paths (never the values), then fail. Command steps always `fail`. |

Steps gain:

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `input` | object | no | `from` (list of sources, OPTIONAL) and `schema` (OPTIONAL). |

`input.from` entries are `inputs.<name>`, `steps.<id>.outputs.<name>` or `event` (AEP-0004).
When `input.from` is present:

1. Every `steps.<id>` source MUST be a direct or transitive dependency, and `<name>` a declared
   output (same rules as section 3.9).
2. The runtime passes the agent exactly an object `{ "<source>": <value>, ... }` as the step's
   data, in addition to `task`. Expressions in `task` and `env` MUST only reference listed sources.
3. The runtime MUST NOT give the step any other step output or input. This includes not passing
   the previous step's text implicitly.
4. A source that is unavailable (skipped by condition, AEP-0001) fails the step with reason
   `missingInput`.

`input.schema` validates the object of item 2 (or, without `from`, the values referenced by the
step's expressions as an object keyed by their reference text).

### Execution

- Output validation happens when the step completes and before any dependent step becomes ready.
  An invalid output (after the optional retry) fails the step with reason `handoffInvalid`.
- Input validation happens after the condition (AEP-0001) and before the first model invocation or
  command; failure fails the step with reason `handoffInvalid`.
- Instances larger than 256 KiB, deeper than 32 levels, or with an own `__proto__` key MUST be
  rejected without validation.

### Changes to section 10.4

| Type | When | Required `data` |
| ---- | ---- | --------------- |
| `handoff.invalid` | An input or output failed validation. | `stepId`, `direction` (`input`, `output`), `attempt`, `schemaDigest`, `errors` (list of `instancePath`, `keyword`, `schemaPath`; at most 20) |

`handoff.invalid` MUST NOT contain the offending values under `payload: metadata`.

## Examples

```yaml
spec:
  schemas:
    Analysis:
      type: object
      required: [severity, action]
      additionalProperties: false
      properties:
        severity: { enum: [low, medium, high, critical] }
        action: { enum: [comment, ignore] }
  workflow:
    - id: analysis
      agent: analyst
      outputs:
        - name: result
          schema: { $ref: "#/spec/schemas/Analysis" }
          onInvalid: retry
    - id: action
      agent: writer
      dependsOn: [analysis]
      when: 'steps.analysis.outputs.result.action == "comment"'
      input:
        from:
          - event
          - steps.analysis.outputs.result
```

## Schema changes

- `WorkflowSpec.properties.schemas`; output entry `schema`, `onInvalid`; step `input`.
- `$defs/SchemaSubset` (structural part); keyword, reference, recursion and limit rules as semantic
  rules `schema.keyword`, `schema.ref`, `schema.recursion`, `schema.limits`, `schema.pattern`;
  `input.from-not-a-dependency`, `input.from-undeclared-output`, `input.expression-not-in-from`.

## Conformance impact

- `core`: static rules; runtime validation, isolation and failure reasons.
- `audit`: `handoff.invalid`.
- New cases: `valid/5.8-schemas-and-handoffs.yaml`; invalid: `5.8-unsupported-keyword.yaml`,
  `5.8-remote-ref.yaml`, `5.8-recursive-ref.yaml`, `5.8-pattern-without-maxlength.yaml`,
  `5.6.1-input-from-not-dependency.yaml`, `5.6.1-expression-outside-from.yaml`.

## Compatibility and migration

Additive. Steps without `input.from` keep the `v1alpha1` behaviour.

## Security considerations

- Validation reduces, but does not remove, prompt-injection risk: a schema-valid string can still
  carry instructions. Enums, bounded lengths and `additionalProperties: false` are recommended for
  values that drive conditions or write actions.
- `input.from` is a data-minimisation and review aid; it is enforced by the runtime, not by the
  model.
- The subset and limits bound validation cost.

## Privacy considerations

Schemas make it easier to keep personal data out of handoffs (`additionalProperties: false`).
Validation errors never contain values.

## Compliance note

AWP provides machine-readable governance primitives that can help organizations implement and
enforce their own compliance requirements. This proposal makes no compliance promise.

## Alternatives

- **Full JSON Schema**: unbounded evaluation cost, remote references, formats; rejected.
- **Schemas only on workflow inputs**: does not cover model output, which is the risky part.
- **Do nothing**: typing stays in prompts.

## Implementation status

OpenAgentix (in progress, not conformant) has typed handovers with the same keyword subset and
limits, with references of the form `#/schemas/<name>` relative to its own front matter. No
implementation of this AEP exists.

## Open questions

1. Should output schemas be allowed on command steps (stdout parsed as JSON)?
2. Should the `input.schema` without `from` exist at all, or require `from`?
3. Should `spec.schemas` be shareable across manifests (a `Schema` kind) later?

## References

- JSON Schema draft 2020-12.
- Spec sections 3.9, 5.6, 10.4.
- [Alignment matrix v2](../docs/alignment/openagentix-matrix.md), section 4.5.
