# AEP-0002: Argument constraints and call limits in tool permissions; action groups instead of prefix wildcards

| | |
| --- | --- |
| **AEP** | 0002 |
| **Title** | Argument constraints and call limits in tool permissions; action groups instead of prefix wildcards |
| **Authors** | @agentix-zero |
| **Shepherd** | Project lead (proposed; not an author, [aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)) |
| **Type** | Specification |
| **Status** | Review (proposed for `v1alpha2`; not accepted) |
| **Reviewer roles needed** | runtime implementer, security reviewer, language or schema reviewer. None identified yet; an external review is required before `Accepted` ([aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)). |
| **Owner decisions** | [D4](../docs/alignment/decisions.md#d4-no-prefix-wildcards-in-permissions) (2026-10-10) |
| **Target API version** | `v1alpha2` |
| **Profiles affected** | `core` |
| **Created** | 2026-10-09 |
| **Discussion** | issue to be opened |
| **Supersedes** | - |
| **Superseded-by** | - |

## Summary

Extend the value of a `permissions.tools` entry with `args` (constraints per argument),
`allowAdditionalArgs` and `maxCalls` (per-execution call limit of the matched actions). Decide
against prefix wildcards inside an identifier segment (`jira.get_*`): action groups, filled
explicitly or by publish-time enumeration, are the supported way to grant a family of tools.

## Motivation

`v1alpha1` permissions decide per action identifier, optionally narrowed by `resources` (spec
7.5.2), which needs a runtime-documented derivation of the target resource per tool. Common, simple
restrictions cannot be expressed portably: "only tickets matching `SEC-\d+`", "status only one of
three values", "comment at most 2000 characters", "at most one comment per execution". A runtime
that cannot express them has two bad options: grant the whole tool, or refuse the use case.

The OpenAgentix alignment ([matrix](../docs/alignment/openagentix-matrix.md)) found these the most
frequent security-relevant losses: every example with tools uses argument constraints, and three of
four use per-tool call limits.

## Goals and non-goals

- Goals: declarative, portable checks on the arguments of a single action call; a per-action call
  limit; a clear rule for tool families.
- Non-goals: full JSON Schema for arguments (typed step data is AEP-0003), checks across several
  calls, content inspection of tool results, policy-wide forbidden argument patterns (could be a
  later `Policy` condition).

## Specification

### Changes to section 7.5.1 (permission entry fields)

The value of each `tools` key gains three optional fields:

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `allow` | boolean | yes | Unchanged. |
| `resources` | list | no | Unchanged. |
| `args` | map | no | Constraints per argument name (section 7.5.5). Only valid with `allow: true`. |
| `allowAdditionalArgs` | boolean | no | Whether arguments not listed in `args` are allowed. Default `false` when `args` is present; ignored when `args` is absent. |
| `maxCalls` | integer | no | Maximum number of actions matching this key per execution. Positive. Only valid with `allow: true`. |

### New section 7.5.5: Argument constraints

Each `args` entry maps an argument name (a top-level property of the call's arguments object) to a
constraint object:

| Field | Type | Description |
| ----- | ---- | ----------- |
| `type` | string | `string`, `number`, `integer`, `boolean`, `array`, `object`. |
| `required` | boolean | Default `false`. The argument MUST be present. |
| `enum` | list of scalars | The value MUST equal one of them. |
| `const` | scalar | The value MUST equal it. |
| `pattern` | string | ECMA-262 regular expression (Unicode mode) that a string value MUST match. Requires `maxLength`. |
| `minLength`, `maxLength` | integer | Length bounds of a string value (in Unicode code points). |
| `minimum`, `maximum` | number | Bounds of a numeric value. |
| `maxItems` | integer | Maximum length of an array value. |
| `deny` | list of string | ECMA-262 regular expressions that MUST NOT match any string contained in the value (recursively). Each requires the value or its strings to be bounded by `maxLength` or by the runtime's documented argument size limit. |

Rules:

1. The runtime MUST evaluate the constraints of every applicable permission object before the
   action and MUST deny the action (`tool.denied` with `reason: permissions`) if any constraint is
   violated, an argument is missing that is `required`, or an argument not in `args` is present
   while `allowAdditionalArgs` is `false`.
2. When several permission objects apply (section 7.5.4), all of their constraints apply.
3. Within one object, if several keys match an action (an identifier and a group), the action is
   allowed only if at least one matching `allow: true` entry's constraints are all satisfied and no
   matching `allow: false` entry exists.
4. Regular expressions MUST be valid and MUST NOT use backreferences or lookaround; a manifest with
   such a pattern is rejected. Implementations SHOULD use a linear-time regular expression engine
   or bound the input length.
5. Constraint failures are reported without the offending value under `payload: metadata`.

### New section 7.5.6: Call limits

`maxCalls` counts the actions matching the key that were started in the execution (all steps);
denied actions do not count. When the limit is reached, further matching actions MUST be denied
with `reason: budget`. `maxCalls` is
independent of `budget.resources.maxToolCalls`; both apply.

### Changes to section 5.5.3 (wildcards): decision (confirmed by owner decision D4)

The existing rule stays: a wildcard is only a final segment `*` (`github.*`). **Prefix wildcards
inside a segment (`jira.get_*`) are not added.** Families of tools are granted through action
groups (section 5.5.4). Runtimes MAY offer authoring helpers that expand a pattern into an explicit
group at publish time; the published manifest contains the expanded list. With an MCP catalog
(AEP-0007), each catalog profile is such an enumerated group of reviewed tools.

Justification:

- A prefix grants tools that do not exist yet. A server update that adds `get_admin_token` is
  silently granted by `get_*`.
- Tool names are vendor-chosen; `get_` does not reliably mean read-only.
- The digest of a manifest with an explicit group identifies exactly what is granted; a prefix's
  meaning changes with the server.
- Groups are already the mechanism for well-known actions and for policies, so reviewers see one
  model.

## Examples

```yaml
permissions:
  default: deny
  tools:
    tickets.get_ticket:
      allow: true
      args:
        key: { type: string, required: true, pattern: "^SEC-[0-9]+$", maxLength: 32 }
    tickets.update_ticket:
      allow: true
      maxCalls: 1
      args:
        key: { type: string, required: true, pattern: "^SEC-[0-9]+$", maxLength: 32 }
        status: { type: string, enum: [triaged, in-progress, done] }
        labels: { type: array, maxItems: 5 }
    jira.read:            # an action group listing the read tools explicitly
      allow: true
actionGroups:
  jira.read:
    - jira.get_issue
    - jira.search_issues
```

## Schema changes

- Permission entry: properties `args` (map of `ArgConstraint`), `allowAdditionalArgs` (boolean),
  `maxCalls` (integer, minimum 1).
- New `$defs/ArgConstraint`, closed object with `^x-` extensions.
- Semantic rules: `args.with-deny` (`args` or `maxCalls` with `allow: false`), `args.pattern-invalid`,
  `args.pattern-unbounded` (pattern without `maxLength`), `args.type-mismatch` (`pattern` on a
  non-string type, `minimum` on a non-numeric type), `args.range` (`minimum > maximum`,
  `minLength > maxLength`).

## Conformance impact

- `core`: static rules; runtime enforcement of constraints and call limits.
- New cases: `valid/7.5.5-argument-constraints.yaml`; invalid: `7.5.5-args-on-deny.yaml`,
  `7.5.5-pattern-invalid.yaml`, `7.5.5-pattern-without-maxlength.yaml`,
  `7.5.5-pattern-on-number.yaml`, `7.5.5-minimum-greater-than-maximum.yaml`,
  `7.5.6-maxcalls-zero.yaml`, `5.5.3-prefix-wildcard.yaml` (already rejected, kept as a regression
  case).

## Compatibility and migration

Additive. Manifests without `args` keep the `v1alpha1` meaning (no argument restriction). An
implementation whose own default denies unknown arguments even without declared constraints must
write `args: {}` explicitly to keep that behaviour when it exports manifests.

## Security considerations

- Fail closed: an action whose arguments cannot be checked (for example arguments that are not an
  object) is denied when `args` is present.
- Argument checks are syntactic. They do not prove what a tool does with the value; `resources`
  scopes and tool-side authorization remain necessary.
- ReDoS: patterns are restricted and length-bounded.
- `shell.execute` arguments are a command string; argument constraints on it are not a sandbox
  (spec 12).

## Privacy considerations

Denials report argument names and failed rules, not values, under `payload: metadata`.

## Compliance note

AWP provides machine-readable governance primitives that can help organizations implement and
enforce their own compliance requirements. This proposal makes no compliance promise.

## Alternatives

- **Full JSON Schema per tool call**: more expressive, much larger surface and evaluation cost;
  the constraint set here is a subset that maps onto JSON Schema keywords one to one, so a later
  AEP can extend it.
- **Prefix wildcards** with a mandatory approval: rejected for the reasons above.
- **Call limits in `budget`** (`budget.resources.maxCallsPerAction`): would separate the limit from
  the grant it belongs to; rejected.
- **Do nothing**: implementations keep these controls in extensions that other runtimes ignore.

## Implementation status

OpenAgentix (in progress, not conformant) enforces argument constraints, an `allowAdditionalArgs`
flag and per-tool call limits in its own format. No implementation of this AEP exists.

## Open questions

1. Should `deny` patterns stay, or move to `Policy` conditions only?
2. Should `maxCalls` count per step instead of per execution, or offer both?
3. Nested argument paths (`args."options.force"`): needed, or handled by AEP-0003 schemas?

## Decision

Owner direction of 2026-10-10 (D4): no prefix wildcards inside a segment; families of tools are granted through action groups and publish-time enumeration. Target `v1alpha2`. Not accepted; needs the reviews listed in the header ([aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)).

## References

- Spec sections 5.5.3, 5.5.4, 7.5.
- [Alignment matrix v2](../docs/alignment/openagentix-matrix.md), section 4.4.
