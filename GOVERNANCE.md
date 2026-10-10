# Governance

The Agentic Workflow Protocol (AWP) is an open specification developed in the open in the GitHub
repository [`open-agentix/agenticWorkflowProtocol.org`](https://github.com/open-agentix/agenticWorkflowProtocol.org).

## Principles

- **AWP is a specification, not a platform.** The specification must remain implementable by
  anyone, without a dependency on a specific vendor, runtime, model provider or hosting service.
- **OpenAgentix is one implementation.** The [OpenAgentix](https://github.com/open-agentix/open-agentix)
  project develops a reference implementation. It has no special rights over the specification:
  changes needed by OpenAgentix go through the same process as everyone else's.
- **Open process.** Proposals, discussions and decisions happen in public issues, discussions and
  pull requests.
- **Honesty.** The project does not claim support by third parties that have not stated it
  themselves, and makes no compliance promises.

## Transparency: written with an agent

Much of the text and tooling is drafted by **agentix-zero**, the project's AI agent account.
The maintainers stay accountable and own the decisions. agentix-zero has no decision rights of
its own.

### How changes are reviewed

The specification and tooling are built mostly by AI agents under the maintainer's direction.

- Pull requests are authored by agents (the implementation model).
- A second, independent review agent (a stronger model) reviews each pull request. For
  security-relevant changes this is a dedicated adversarial security review with a fix round and
  real test runs.
- The lead agent merges (squash merge) under the maintainer's standing authorisation.
- There is **no guarantee that a human reads every change before it is merged.**
- The maintainer sets the direction, answers design questions, can inspect, revert and block
  changes at any time, and decides on releases.
- External contributions from people are reviewed by the maintainer.

Requiring a human approval for sensitive paths through `CODEOWNERS` and branch protection is
possible and planned as an optional governance setting. It is not enforced today.

**How to verify:** the pull request history shows who authored, reviewed and merged each change and
keeps the review comments; the AEPs in [`aep/`](aep/) record specification decisions; the
[CHANGELOG](CHANGELOG.md) lists what shipped in each release.

## Roles

- **Implementers** build runtimes, validators and tools that implement AWP.
- **Contributors** propose changes, review, write documentation and examples. Everyone is welcome.
- **Maintainers** set the direction, review pull requests from people, publish specification versions and steward the
  roadmap.

| Maintainer   | GitHub              | Areas |
| ------------ | ------------------- | ----- |
| Project lead | via `@agentix-zero` | all (owns decisions) |
| agentix-zero | `@agentix-zero`     | all (agent account, drafts changes, no own decision rights) |

The project explicitly seeks maintainers from independent implementations. A contributor with a
track record of substantial contributions over at least three months can be nominated by any
maintainer; the nomination passes with lazy consensus of the maintainers after 7 days. The goal is
that no single organization holds a majority of maintainers once the specification reaches
`v1beta1`.

## Decision process

- Editorial changes (typos, wording, examples): one maintainer approval.
- Substantive changes (new fields, changed semantics, conformance requirements): an issue first,
  at least 5 working days of public discussion, then lazy consensus of the maintainers.
- **Alpha waiver.** While the project is in alpha and no third party depends on it, the project owner
  may waive the 5-day discussion period for a specific change. Every waiver is recorded in the pull
  request and in `docs/alignment/decisions.md`. A waiver never changes an AEP's lifecycle status: the
  external review required by `docs/aep-process.md` still applies before an AEP is `Accepted`.
- Larger changes use **AWP Enhancement Proposals (AEPs)**: a numbered Markdown document in
  `aep/` with motivation, specification text, alternatives, compatibility and conformance impact.
  The process is [docs/aep-process.md](docs/aep-process.md) with the template
  [aep/0000-template.md](aep/0000-template.md), adopted on 2026-10-10
  ([decision log](docs/alignment/decisions.md)). An AEP is never accepted by its author or by the
  project lead alone: it needs a reviewer who is not an author and, while all maintainers belong to
  one organisation, an external one ([aep-process 5.1](docs/aep-process.md#51-review-before-acceptance)).
- If consensus cannot be reached, the maintainers decide by simple majority; the project lead
  breaks ties.

## Specification versions

- API versions follow the Kubernetes-style maturity levels: `v1alphaN` (unstable, may change
  incompatibly), `v1betaN` (feature-complete for the version, changes only with a migration path),
  `v1` (stable, only backwards-compatible additions).
- A published API version is never changed incompatibly. Incompatible changes require a new API
  version.
- For document structure (field names, types, required fields, closed objects) the JSON Schema of
  an API version is normative; the specification text is normative for semantics and runtime
  behaviour. A discrepancy is a defect fixed by an erratum ([schema/README.md](schema/README.md)).
- Repository releases (schemas, tooling, website) follow [SemVer 2.0.0](https://semver.org) and
  are documented in [CHANGELOG.md](CHANGELOG.md).

## Conformance claims

An implementation may state that it conforms to AWP only for the profiles and API version it
actually implements, for example "conforms to AWP `v1alpha1` profiles core and audit". During
alpha, a statement about documents only ("AWP `v1alpha1` schema conformant (alpha)") needs a
passing public CI run of the conformance suite against the implementation's validator and real
exports ([aep-process 7.0](docs/aep-process.md#70-self-declared-schema-conformance-during-alpha)). Rules for a
formal conformance mark (test suite, self-certification, revocation) will be defined together with
the conformance test suite.

## Changes to this document

Changes to this governance document follow the substantive change process above.
