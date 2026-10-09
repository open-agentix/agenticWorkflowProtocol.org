# AWP and OpenAgentix alignment: phased plan and owner decisions (proposal)

| | |
| --- | --- |
| **Status** | Draft proposal for the project owner. Not adopted. |
| **Related** | [Alignment matrix v2](openagentix-matrix.md), [x-openagentix namespace](x-openagentix-extensions.md), [single source of truth](single-source-of-truth.md), AEP drafts in [`aep/`](../../aep/) |

> Estimates are rough working-day ranges for one contributor with agent support, including review,
> and exclude the discussion periods of the governance process (at least 5 working days for
> substantive changes, at least 10 for an FCP under the draft AEP process). No date in this plan is
> a commitment. OpenAgentix remains "in progress, not conformant" throughout; no phase includes a
> conformance or compliance claim.

## 1. AEP drafts in this pull request

| AEP | Title | Profile | Closes gap for | Size |
| --- | --- | --- | --- | --- |
| [0001](../../aep/0001-conditional-steps.md) | Conditional steps (`when`) with a restricted expression language | core | `when` | M |
| [0002](../../aep/0002-tool-argument-constraints.md) | Argument constraints and call limits in tool permissions; no prefix wildcards | core | `args`, `allowAdditionalArgs`, `maxCallsPerRun`, `get_*` | M |
| [0003](../../aep/0003-typed-handoffs.md) | Typed handoffs between steps | core | `schemas`, `input`, `output` | L |
| [0004](../../aep/0004-event-references.md) | Event references `${{ event.* }}` | core | event payload | S |
| [0005](../../aep/0005-prompt-kind.md) | Kind `Prompt`: versioned prompt templates | core | `promptRef` target | M |
| [0006](../../aep/0006-playbook-kind.md) | Kind `Playbook`: recurring tasks with deterministic steps and checks | core | skills, playbooks | L |
| [0007](../../aep/0007-mcp-connection-catalog.md) | MCP connection catalog (tool classes, data classification, named profiles) | mcp | profiles, `access` | M |
| [0008](../../aep/0008-model-provider-catalog.md) | Model and provider catalog as policy input | governance | provider identifiers, region, price | M |
| [0009](../../aep/0009-audit-payload-levels.md) | Audit payload levels and content retention | audit | metadata default, optional content | S |
| [0010](../../aep/0010-digest-canonicalization.md) | Digest canonicalisation (JCS) for manifests | core | digest interoperability | S |
| [0011](../../aep/0011-required-extensions.md) | Required extensions (`metadata.requiredExtensions`) | core | safe interim extensions | S |

S = 2-4 days, M = 4-8 days, L = 8-15 days for text, schema changes and conformance cases together.

## 2. Phases

### Phase 0: review (now)

- Review this pull request; decide the questions of [section 5](#5-decisions-for-the-owner).
- Decide whether the AEP process (`docs/aep-process.md`) is adopted first, or whether these drafts
  are handled as substantive changes under the current GOVERNANCE.md process.
- Effort: 1-2 days of owner review.

### Phase 1: foundations (both repositories, parallel tracks)

| Track | Work | Depends on | Effort |
| --- | --- | --- | --- |
| AWP-1a | AEP-0010 (digest) and AEP-0011 (required extensions) to `Accepted`; schema, semantic rules and conformance cases | Phase 0 | S + S |
| AWP-1b | AEP-0002 (arguments, call limits) and AEP-0001 (conditions) to `Accepted`; schema, rules, cases | Phase 0 | M + M |
| AWP-1c | Process AEP: schema normative for structure ([single source of truth](single-source-of-truth.md#1-principle)); release assets with SHA-256 | Phase 0 | S |
| OA-1a | Wrapper parser: `agents.md` front matter as AWP manifest, effective manifest, JCS digest; old `openagentix.io/v1alpha1` read through the converter | AWP-1a (digest rule), not on other AEPs | M |
| OA-1b | Vendored pin of `v1alpha1`, CI steps 1-4 and 10 of the [CI proposal](single-source-of-truth.md#4-ci-steps-in-openagentix) | AWP-1c for the asset format; can start with a commit pin | S |
| OA-1c | `x-openagentix-*` extension schema and registry; converter with golden tests for `examples/` | OA-1a | M |

Parallelisable: AWP-1a, AWP-1b and AWP-1c are independent of each other; OA-1b can start
immediately; OA-1a needs only the digest rule. Critical path: AWP-1a -> OA-1a -> OA-1c.

### Phase 2: close the security-relevant gaps

| Track | Work | Depends on | Effort |
| --- | --- | --- | --- |
| AWP-2a | AEP-0003 (typed handoffs) and AEP-0004 (event references) to `Accepted` | AWP-1b (shares expression roots with AEP-0001) | L + S |
| AWP-2b | Cut `v1alpha2` draft with AEPs 0001-0004, 0010, 0011 | AWP-1a, 1b, 2a | S |
| OA-2a | Switch OpenAgentix to `v1alpha2`: core fields replace the critical extensions; drift test (CI step 5) and suite run (step 6) | AWP-2b | M |
| OA-2b | Step graph semantics needed by the core profile (DAG, `dependsOn`, statuses, condition skips) | AWP-1b | L |

Parallelisable: AWP-2a with OA-2b. After OA-2a, the four examples are expected to convert in
strict mode except for publish-context items ([matrix 6.4](openagentix-matrix.md#64-what-the-aeps-would-change)).

### Phase 3: catalogs, prompts, playbooks, audit

| Track | Work | Depends on | Effort |
| --- | --- | --- | --- |
| AWP-3a | AEP-0007 (MCP catalog) | AWP-1b (action groups, argument rules) | M |
| AWP-3b | AEP-0008 (model and provider catalog) | - | M |
| AWP-3c | AEP-0009 (audit payload levels) | - | S |
| AWP-3d | AEP-0005 (`Prompt`), then AEP-0006 (`Playbook`) | AWP-1a (digests), AWP-2a (schemas) | M + L |
| OA-3 | Implement the accepted parts, one profile at a time: `core` validator first, then `mcp`, `audit` (export of the existing hash chain into the AWP envelope), `governance`, `security`, `a2a` last | per AEP | L per profile |

All four AWP tracks are independent and can run in parallel; OA-3 follows each AEP.

### Phase 4: evidence, not claims

- A runtime conformance suite exists for a profile (AWP side).
- OpenAgentix CI passes the public suite for that profile.
- Only then: the OpenAgentix maintainers decide whether to publish a conformance statement with
  every limitation. Until that statement exists, documentation says "in progress".
- The promotion of an API version to beta additionally needs two independent implementations
  ([aep-process 6.1](../aep-process.md#61-api-versions)); OpenAgentix alone cannot satisfy it.

## 3. Order in one line

AEP-0010 + AEP-0011 -> OpenAgentix wrapper and pin -> AEP-0002 + AEP-0001 -> AEP-0003 + AEP-0004 ->
`v1alpha2` -> OpenAgentix on `v1alpha2` -> catalogs, audit, prompts, playbooks -> profile by profile
-> evidence.

## 4. Risks

| Risk | Mitigation |
| --- | --- |
| AWP looks shaped by one implementation | Every AEP is written for any runtime; independent reviewers sought before `Accepted`; OpenAgentix-only concepts stay in `x-openagentix-*` |
| Interim critical extensions leak into portable manifests | Do not export manifests with critical extensions before AEP-0011; then `requiredExtensions` |
| Two specs drift (OpenAgentix moves faster) | Vendored pin, drift test, schema normative for structure |
| Accidental conformance or compliance claims | CI reports are artefacts only; wording rule in [single source of truth section 6](single-source-of-truth.md#6-status-reporting) |
| Expression language grows into a programming language | AEP-0001 fixes grammar and limits; functions only by a later AEP |

## 5. Decisions for the owner

1. **Process**: adopt `docs/aep-process.md` before these AEPs move beyond `Draft`, or handle them
   under the current substantive-change process? Numbering 0001-0011 follows the order in this
   pull request; is that acceptable?
2. **Schema normative for structure** (single source of truth section 1), changing the statement
   in `schema/README.md` through a `Process` AEP?
3. **Required extensions (AEP-0011)** as a prerequisite of strategy A?
4. **Prefix wildcards**: confirm the recommendation in AEP-0002 (no in-segment wildcards; action
   groups and publish-time enumeration instead).
5. **Expression language**: base `when` on the existing OpenAgentix grammar (AEP-0001) rather than
   CEL or JSONPath? Bare expression or `${{ }}` in the `when` field?
6. **Success rule**: may an execution succeed with steps skipped by a condition (AEP-0001)?
7. **Event root**: `${{ event.* }}` as a new root, or always map events to inputs (AEP-0004)?
8. **`Prompt` and `Playbook` kinds**: in `v1alpha2`, or deferred to a later alpha (AEP-0005, 0006)?
9. **MCP catalog**: part of the `mcp` profile (proposed) or a separate profile (AEP-0007)?
10. **Model catalog prices**: inside manifests (proposed only as a separate `ModelCatalog` kind with
    digest) or runtime-only input (AEP-0008)?
11. **Audit content default**: `metadata` default; optional `content` with a mandatory retention
    duration; a suggested default retention for content (for example 7 days) or none (AEP-0009)?
12. **Where the namespace page lives**: keep `docs/alignment/x-openagentix-extensions.md` in this
    repository, move it to the OpenAgentix repository, or create a neutral, informative list of
    extension prefixes open to every implementation?
13. **Transition**: how long OpenAgentix keeps reading `openagentix.io/v1alpha1` files after the
    switch (proposed: one minor release with deprecation warnings).
14. **Pinning method** in OpenAgentix: vendored copy (recommended) or submodule.
15. **`owner`**: may an OpenAgentix owner be a user, or is it always a team (affects
    `metadata.owner.team`)?
16. **Shepherd**: the draft process says the shepherd should not be the author. All drafts are
    written by agentix-zero; the human project lead would shepherd all of them. Seek an external
    reviewer before `Accepted`?
17. **`v1alpha2` scope**: cut it with AEPs 0001-0004, 0010, 0011 only (proposed), and leave the
    catalogs, audit levels, `Prompt` and `Playbook` for `v1alpha3`?
