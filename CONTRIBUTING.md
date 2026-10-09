# Contributing to AWP

Thanks for helping to shape the Agentic Workflow Protocol. By participating you agree to the
[Code of Conduct](CODE_OF_CONDUCT.md).

## What you can contribute

- **Specification changes** (`spec/`): new fields, clarified semantics, conformance requirements.
- **Documentation** (`docs/`): concepts, guides, examples.
- **Schemas, conformance tests and tooling** (once they exist): code under Apache-2.0.
- **Implementation reports**: you implement AWP and want to be listed (see README).

## Ground rules

- **English** for specification text, code, comments, commit messages, issues and PRs.
- **One concern per pull request** and per commit.
- **Normative language**: use the key words MUST, MUST NOT, SHOULD, SHOULD NOT and MAY only in
  their [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) / [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174)
  meaning and in uppercase.
- **Examples must be valid**: every YAML example in the specification must parse and must be
  consistent with the normative text it illustrates.
- **Vendor neutrality**: the specification must not require a specific vendor, provider, runtime
  or hosting service. Product names may appear in examples only.
- **No compliance claims**: do not write that AWP makes anything compliant with a law or
  regulation. AWP provides machine-readable governance primitives; compliance depends on the
  implementation, organizational controls and applicable requirements.
- **No secrets** in examples (use `secretRef`), no real personal data (use `example.com` /
  `example.org`).

## Changes to the specification

1. Small fixes (typos, wording, broken examples) go straight to a pull request.
2. Substantive changes (new fields, changed semantics, new conformance requirements) start as an
   issue describing the problem and the proposed solution. Larger proposals will follow the AWP
   Enhancement Proposal process described in [GOVERNANCE.md](GOVERNANCE.md).
3. Breaking changes to a published version are only possible in a new API version
   (for example `v1alpha2`), see the versioning rules in [GOVERNANCE.md](GOVERNANCE.md).

## Developer Certificate of Origin (DCO)

All commits must be signed off. The sign-off certifies that you wrote the change or otherwise have
the right to submit it under the licenses of this repository (CC BY 4.0 for specification text,
Apache-2.0 for code), see [developercertificate.org](https://developercertificate.org/):

```bash
git commit -s -m "docs(spec): clarify dependsOn cycle detection"
```

This adds `Signed-off-by: Your Name <you@example.com>` to the message. Pull requests with
unsigned commits cannot be merged.

## Conventional Commits 1.0.0

Commit subjects and PR titles follow
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<scope>)<!>: <description in imperative mood, max. 100 chars>
```

- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Scopes: `spec`, `schema`, `conformance`, `site`, `docs`, `governance`, `ci`, `deps`.
- Breaking change: `!` after type/scope or a `BREAKING CHANGE:` footer.

## Versioning

- The **specification** is versioned by API version (`v1alpha1`, `v1alpha2`, `v1beta1`, `v1`), see
  [GOVERNANCE.md](GOVERNANCE.md).
- The **repository** (schemas, tooling, website) is released with
  [SemVer 2.0.0](https://semver.org). Every release updates [CHANGELOG.md](CHANGELOG.md) before
  the tag `vX.Y.Z` is created. User-visible changes add a line under `[Unreleased]` in the same PR.

## Reviews

A maintainer reviews every pull request. Specification changes need at least one maintainer
approval and should stay open for discussion for at least 5 working days if they change
semantics.
