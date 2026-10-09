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
Humans stay accountable: every change is reviewed by a human maintainer, and decisions are owned
by the maintainers. agentix-zero has no decision rights of its own.

## Roles

- **Implementers** build runtimes, validators and tools that implement AWP.
- **Contributors** propose changes, review, write documentation and examples. Everyone is welcome.
- **Maintainers** review and merge pull requests, publish specification versions and steward the
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
- Larger changes will use **AWP Enhancement Proposals (AEPs)**: a numbered Markdown document in
  `aep/` with motivation, specification text, alternatives, compatibility and conformance impact.
  The AEP process is itself still a draft and will be defined in a dedicated pull request.
- If consensus cannot be reached, the maintainers decide by simple majority; the project lead
  breaks ties.

## Specification versions

- API versions follow the Kubernetes-style maturity levels: `v1alphaN` (unstable, may change
  incompatibly), `v1betaN` (feature-complete for the version, changes only with a migration path),
  `v1` (stable, only backwards-compatible additions).
- A published API version is never changed incompatibly. Incompatible changes require a new API
  version.
- Repository releases (schemas, tooling, website) follow [SemVer 2.0.0](https://semver.org) and
  are documented in [CHANGELOG.md](CHANGELOG.md).

## Conformance claims

An implementation may state that it conforms to AWP only for the profiles and API version it
actually implements, for example "conforms to AWP `v1alpha1` profiles core and audit". Rules for a
formal conformance mark (test suite, self-certification, revocation) will be defined together with
the conformance test suite.

## Changes to this document

Changes to this governance document follow the substantive change process above.
