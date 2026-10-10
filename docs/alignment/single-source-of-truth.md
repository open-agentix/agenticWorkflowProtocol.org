# Single source of truth: AWP schema, OpenAgentix pin, drift test and conformance CI

| | |
| --- | --- |
| **Status** | Directions decided on 2026-10-10 ([decision log](decisions.md): D2 schema normative for structure, D14 vendored copy with `PROVENANCE.json`, R1 conformance wording). Nothing here is implemented in the OpenAgentix repository yet; the work is tracked as OpenAgentix issues with the label `awp`. |
| **Scope** | How the AWP JSON Schema and conformance suite become the one definition of the manifest format that OpenAgentix (strategy A) builds on, and how drift is detected |
| **Related** | [Alignment matrix v2](openagentix-matrix.md), [x-openagentix namespace](x-openagentix-extensions.md), [plan](plan.md) |

> This is a workflow proposal for one implementation. It does not make OpenAgentix conformant and
> must not be read as a conformance claim. A CI job that runs the suite produces evidence for
> maintainers; a claim needs a passing public suite and a published conformance statement
> ([spec 11.3](../../spec/v1alpha1/README.md#113-conformance-statement), [docs/aep-process.md section 7](../aep-process.md#7-conformance-mark-proposal)).

## 1. Principle

| Artefact | Role | Owner |
| --- | --- | --- |
| `schema/awp.<version>.json` (this repository) | **Normative definition of the manifest structure** of an API version (decision D2) | AWP maintainers |
| `spec/<version>/README.md` | Normative semantics and runtime requirements; the semantic rules catalogue in `schema/README.md` lists what the schema cannot express | AWP maintainers |
| `conformance/` (index, cases, reference checker) | Executable definition of "valid manifest" for validators | AWP maintainers |
| OpenAgentix types and validator for manifests | **Derived** from the pinned schema; never edited by hand to add or remove AWP fields | OpenAgentix |
| `openagentix-extensions.<version>.json` | Schema of the `x-openagentix-*` fields only | OpenAgentix |

Decision D2 made the schema normative for structure; `schema/README.md` and section 2 of the
specification state it. The wording used: "For document structure (field names,
types, required fields, closed objects), the JSON Schema of an API version is normative. The
specification text is normative for semantics and runtime behaviour. A discrepancy between the two
is a defect that is fixed by an erratum in whichever artefact is wrong; until it is fixed,
validators follow the schema."

## 2. Release contract on the AWP side

For every repository release `vX.Y.Z` that contains a draft or published API version:

1. The release contains, as release assets, `awp.<version>.json` and
   `awp-conformance-<version>-<suite version>.tar.gz` (the `conformance/` directory and
   `schema/README.md`), each with its SHA-256 in the release notes.
2. The schema `$id` stays `https://agenticworkflowprotocol.org/schema/awp.<version>.json`; a draft
   version can change between releases, a published one cannot ([aep-process section 6.2](../aep-process.md#62-published-versions-are-frozen)).
3. `conformance/index.json` carries the suite `version`; the release notes state which spec
   sections changed.
4. No implementation is named in the release as supporting the version.

## 3. Pinning in OpenAgentix

Decided: a **vendored, reviewed copy** (decision D14), consistent with the rule that
nothing is loaded from the internet at build or run time.

```
packages/awp/vendor/awp-v1alpha2/
  awp.v1alpha2.json
  conformance/            # index.json, valid/, invalid/, awp-check.mjs, semantic.mjs
  schema-README.md
  PROVENANCE.json         # source repository URL, tag, commit, date, sha256 of every file
```

- The pin names one AWP API version and one repository release tag. Upgrading is a pull request
  that replaces the directory with the files of a new tag, updates `PROVENANCE.json`, regenerates
  the derived types and contains the review of the diff (`git diff` of the schema).
- The reference checker in the vendored copy is only run in CI as a second opinion; it is not
  shipped in OpenAgentix packages.
- A git submodule pinned to a commit is the alternative; it hides the reviewed content behind a
  pointer and is not recommended.

## 4. CI steps in OpenAgentix

A workflow `awp-conformance.yml` on GitHub-hosted runners, triggered on pull requests and pushes
to `main`. Actions pinned by commit SHA, dependencies installed from the lockfile without scripts.
The steps, in order:

| # | Step | Command (illustrative) | Fails when |
| --- | --- | --- | --- |
| 1 | Checkout | `actions/checkout@<sha>` with `persist-credentials: false` | - |
| 2 | Node and pnpm | `actions/setup-node@<sha>` (Node version of the repository), `pnpm install --frozen-lockfile --ignore-scripts` | lockfile drift |
| 3 | Verify the pin | `node scripts/awp/verify-pin.mjs` | a vendored file's SHA-256 differs from `PROVENANCE.json`, or a file is missing or extra |
| 4 | Derived types are current | `node scripts/awp/generate-types.mjs --check` (generates TypeScript types or the validator source from the pinned schema and compares with the committed output) | someone edited the derived code by hand, or the pin changed without regeneration |
| 5 | Field coverage (drift test) | `pnpm --filter @openagentix/core test -- awp-drift` | a schema property (outside `^x-`) has no handling in OpenAgentix, or OpenAgentix accepts a non-`x-` field that the schema does not define |
| 6 | Validator against the suite | `pnpm oax awp validate --suite packages/awp/vendor/awp-v1alpha2/conformance/index.json --json > awp-report.json` | any case of the claimed profiles gives the wrong accept/reject result or the wrong path |
| 7 | Reference checker sanity run | `node packages/awp/vendor/awp-v1alpha2/conformance/awp-check.mjs run` (needs the two pinned dev dependencies of the vendored `package-lock.json`) | the vendored suite itself is inconsistent |
| 8 | Examples as golden tests | for every `examples/**/*.agents.md`: build the effective manifest, compare with the committed golden `*.awp.json`, then `awp-check.mjs check --profiles <declared> --verify-digest` | an example is no longer a valid AWP manifest, its digest changed without a version bump, or a critical extension is not declared required (once AEP-0011 exists) |
| 9 | Extension schema | validate every `x-openagentix-*` value in examples and fixtures against `openagentix-extensions.<version>.json` | unknown extension name or invalid value |
| 10 | Report | upload `awp-report.json` as a build artefact; no badge, no README update | - |

Step 5 in detail: walk the pinned schema (`$defs`, `properties`, `if/then` branches) and produce the
set of JSON Pointers of defined fields; walk OpenAgentix's manifest model the same way; the test
fails on any difference outside `x-` names, and prints the pointers. A list of fields that
OpenAgentix knowingly rejects as "profile not supported" is kept in the test as data, so the
difference is visible in review.

Step 6 uses the index format of [conformance/README.md](../../conformance/README.md#index-format):
`profiles` per case decides which cases apply. Until OpenAgentix claims a profile, the job runs
with all cases and reports the pass rate; it **does not fail** the build on cases of profiles that
are not implemented yet, but it does fail on regressions (a case that passed on `main` and fails
in the pull request). The report is evidence, not a claim.

## 5. Change flow

```
AWP: AEP accepted -> schema + spec + conformance cases merged -> repository release vX.Y.Z
OpenAgentix: pin update PR (vendored files, PROVENANCE.json, regenerated types)
             -> CI steps 3-9 -> review -> merge
             -> x-openagentix-* successor switched to the core field (namespace lifecycle)
```

Changes needed by OpenAgentix flow the other way only as AEPs or issues in this repository. Editing
the vendored schema in OpenAgentix is not allowed; step 3 enforces it.

## 6. Status reporting

- Until the AWP conformance suite passes against OpenAgentix's validator and real exports in
  OpenAgentix's public CI (steps 6-8), OpenAgentix documentation, websites, release notes and
  announcements say "built to the AWP schema, conformance in progress (alpha)" and name no profile
  as supported. After that, they may say "AWP `<version>` schema conformant (alpha)" with the
  details of [aep-process 7.0](../aep-process.md#70-self-declared-schema-conformance-during-alpha).
  Runtime conformance to a profile needs a runtime suite and a conformance statement (spec 11.3).
- The CI pass rate is not published as a badge or marketing statement.
- AWP's implementations page uses the same wording and changes only when OpenAgentix publishes the
  statement.
