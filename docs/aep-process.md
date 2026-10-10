# AWP Enhancement Proposals (AEPs), specification versioning and conformance marks

| | |
| --- | --- |
| **Status** | **Adopted** by decision of the project lead on 2026-10-10 ([decision log D1](alignment/decisions.md#d1-aep-process-adopted)); in force from the merge of the adopting pull request, after the public discussion period of [GOVERNANCE.md](../GOVERNANCE.md#decision-process) |
| **Scope** | Additions to [GOVERNANCE.md](../GOVERNANCE.md): AEP lifecycle, numbering and template; versioning of the specification; rules for a future conformance mark |
| **Adoption** | Through the substantive change process of [GOVERNANCE.md](../GOVERNANCE.md#decision-process): public discussion of at least 5 working days, then lazy consensus of the maintainers. Later changes to this document need a `Process` AEP. |
| **Template** | [`aep/0000-template.md`](../aep/0000-template.md) |

> Sections 1 to 6 and 7.0 are the adopted process. Sections 7.1 to 7.5 (conformance mark) remain
> a proposal: no conformance mark exists, and no implementation has been certified or has received
> a mark. No AEP has been accepted yet. Nothing here is a
> compliance promise: AWP provides machine-readable governance primitives that can help
> organizations implement and enforce their own compliance requirements; compliance depends on the
> implementation, organizational controls and applicable regulatory requirements.

## Contents

1. [Purpose](#1-purpose)
2. [When an AEP is required](#2-when-an-aep-is-required)
3. [Numbering and files](#3-numbering-and-files)
4. [Lifecycle](#4-lifecycle)
5. [Roles and decisions](#5-roles-and-decisions)
   - [5.1 Review before acceptance](#51-review-before-acceptance)
6. [Versioning of the specification](#6-versioning-of-the-specification)
7. [Conformance mark (proposal)](#7-conformance-mark-proposal)
   - [7.0 Self-declared schema conformance during alpha](#70-self-declared-schema-conformance-during-alpha)
8. [Open questions](#8-open-questions)

## 1. Purpose

AWP is a specification, not a platform. Larger changes to it need a written record that anyone
can read, review and implement against, independent of any one implementation. An **AWP
Enhancement Proposal (AEP)** is that record: a numbered Markdown document in `aep/` that states the
motivation, the proposed normative text, the alternatives, the compatibility and the conformance
impact of a change.

AEPs are written in English. They contain no personal data beyond what authors choose to share in
their public GitHub profiles; the project contact for matters that cannot be discussed in public is
info@openagentix.si, and security issues follow [SECURITY.md](../SECURITY.md).

## 2. When an AEP is required

| Change | AEP required? |
| --- | --- |
| New field, kind, step type, trigger type, event type, profile or well-known action | Yes |
| Changed semantics of an existing field or rule, including changed defaults | Yes |
| New, removed or changed conformance requirement (MUST/SHOULD for runtimes or validators) | Yes |
| A new API version (`v1alpha2`, `v1beta1`, `v1`, ...) and its promotion criteria | Yes |
| Changes to this process, the versioning rules or the conformance mark rules | Yes (type `Process`) |
| Clarification that does not change which manifests are valid or what runtimes must do | No: issue and pull request with one maintainer approval (editorial change) |
| Examples, website, glossary wording, typos | No |
| Conformance test cases for an existing rule, schema bug fixes that align the schema with the normative text | No, but the pull request names the section of the specification it implements |

If in doubt, open an issue first; a maintainer decides whether the change needs an AEP.

AEP types:

- **Specification**: changes the normative text, the schema or the conformance requirements.
- **Process**: changes how the project works (this document, governance, conformance mark rules).
- **Informational**: guidance without normative effect (for example a mapping or a design note).
  Informational AEPs never create requirements.

## 3. Numbering and files

- AEPs live in `aep/` as `aep/NNNN-short-title.md`, where `NNNN` is a four-digit number and
  `short-title` is lowercase `kebab-case`.
- `0000` is reserved for the template. Authors open their pull request with the file named
  `aep/0000-short-title.md`. A maintainer assigns the next free number when the AEP enters the
  `Draft` state and renames the file before merging.
- Numbers are assigned in order and are never reused, also not for rejected or withdrawn AEPs.
- An AEP that replaces another names it in `Supersedes`; the replaced AEP gets the status
  `Superseded` and a `Superseded-by` entry. Content of accepted AEPs is not rewritten afterwards;
  corrections are made by a new AEP or, for typos, by an editorial change that does not alter
  meaning.
- Supporting files (schemas, examples, diagrams) go into `aep/NNNN/`.

## 4. Lifecycle

```
Idea (issue) -> Draft -> Review -> Final Comment Period -> Accepted -> Implemented -> Final
                  |         |               |                  |
                  +---------+---------------+--> Withdrawn / Rejected / Deferred
Accepted or Final -> Superseded (by a later AEP)
```

| Status | Meaning | Exit criteria |
| --- | --- | --- |
| `Idea` | An issue describes the problem; no AEP file yet. | A maintainer confirms that an AEP is needed and that the problem is in scope. |
| `Draft` | The AEP file is merged with a number. The text may change freely. | The author asks for review; all template sections are filled in. |
| `Review` | Public review in the pull request and the linked issue. | Open review comments are resolved or recorded under "Open questions". |
| `Final Comment Period` (FCP) | A maintainer announces the FCP in the issue with a proposed outcome (accept, reject, defer). Lasts **at least 10 working days**. | No unresolved objection from a maintainer at the end of the FCP. A substantive new objection restarts the FCP. |
| `Accepted` | The change is agreed for a named target API version. | Normative text, schema changes and conformance test cases are merged into the target version. |
| `Implemented` | The change is part of a published draft of the target API version. | The target API version is published as `v1betaN` or `v1`. |
| `Final` | The change is part of a beta or stable API version. | - |
| `Withdrawn` | The author withdrew it. | - |
| `Rejected` | The maintainers decided against it; the reason is recorded in the AEP. | - |
| `Deferred` | Not now; may be resumed as `Draft` later. | - |
| `Superseded` | Replaced by a later AEP. | - |

Rules:

- Every status change is a pull request that updates the `Status` field and, when relevant, adds
  the decision and its reason to the AEP.
- An AEP of type `Specification` cannot be accepted without a **Conformance impact** section that
  lists the new or changed test cases (valid and invalid manifests, or runtime tests once a runtime
  suite exists).
- An AEP can only change an API version that is still a draft (see
  [section 6.2](#62-published-versions-are-frozen)). Changes to a published version need a new API
  version.
- The "Implementation status" section of an AEP describes known implementation work factually. It
  never states that a platform supports AWP unless that project has said so publicly.

## 5. Roles and decisions

- **Author**: anyone. Writes and updates the AEP, answers review comments.
- **Shepherd**: a maintainer who guides the AEP through the process, assigns the number and
  announces the FCP. The shepherd should not be the author.
- **Maintainers** decide by lazy consensus at the end of the FCP; if consensus cannot be reached,
  [GOVERNANCE.md](../GOVERNANCE.md#decision-process) applies (simple majority, the project lead
  breaks ties).
- **Conflicts of interest**: a maintainer who works on an implementation discloses this in the
  AEP discussion when the AEP mainly benefits or burdens that implementation. Changes needed by
  OpenAgentix go through the same process as everyone else's; OpenAgentix has no veto and no
  fast track.
- Text drafted by the project's agent account (agentix-zero) is reviewed by a human maintainer
  before any status change, as for every other change ([GOVERNANCE.md](../GOVERNANCE.md#transparency-written-with-an-agent)).
- In discussions, "proposed for `<version>`" means the status `Review` with that target API version.

### 5.1 Review before acceptance

Decided on 2026-10-10 ([decision log D16](alignment/decisions.md#d16-external-reviewer-before-accepted)).

1. **No self-acceptance.** An AEP cannot move to `Accepted` on the decision of its author alone,
   and not on the decision of the project lead alone. This also applies to alpha API versions.
2. **Shepherd and reviewer are not the author.** The shepherd MUST NOT be listed as an author of
   the AEP. Before the Final Comment Period starts, at least one **reviewer** records a review in
   the AEP's pull request or issue (approval, or the objections that remain open). The reviewer
   is neither an author, nor the shepherd, nor the person on whose behalf an agent account drafted
   the text.
3. **External reviewer while the project has one organisation.** As long as all maintainers belong
   to one organisation, the reviewer of rule 2 MUST be external: not a maintainer, not an author,
   and not working on OpenAgentix. Agent accounts cannot be reviewers. For AEPs drafted by
   agentix-zero, the project lead may act as shepherd (a human has to guide the AEP and the agent
   account has no decision rights) but cannot be the reviewer.
4. **Roles per AEP.** Each AEP lists in its header the reviewer roles it needs. Roles used so far:

   | Role | Needed for |
   | --- | --- |
   | Runtime implementer | Every `Specification` AEP: someone who builds or maintains an agent or workflow runtime other than OpenAgentix and can judge whether the text is implementable. |
   | Security reviewer | AEPs that change permissions, isolation, digests, extensions or audit integrity. |
   | Privacy reviewer | AEPs that change what audit events or handoffs contain or how long content is kept. |
   | MCP practitioner | AEPs that touch MCP servers, tools or authorization: someone familiar with the Model Context Protocol specification. |
   | Language or schema reviewer | AEPs that define a grammar or a JSON Schema subset. |

   One person may cover several roles. Roles are filled by people who volunteer publicly; the
   project does not name reviewers it has not asked and who have not agreed.
5. **Finding reviewers.** Maintainers ask for reviewers in a pinned GitHub Discussion and in the
   AEP's issue. Until a reviewer is found, the AEP stays in `Review`; an API version is not held
   back by one AEP without a reviewer (the AEP moves to a later target version).
6. **Record.** The AEP's `Decision` section names the shepherd, the reviewer(s) with their role,
   the FCP dates and the outcome.

## 6. Versioning of the specification

Three things are versioned separately. They must not be confused.

| What | Format | Example | Rules |
| --- | --- | --- | --- |
| **API version** of a manifest | maturity level in `apiVersion` | `awp.agenticworkflowprotocol.org/v1alpha1` | [section 6.1](#61-api-versions) |
| **Manifest version** written by authors | SemVer 2.0.0 in `metadata.version` | `1.2.0` | Defined by the specification ([spec 3.5](../spec/v1alpha1/README.md#35-versions)); not covered here |
| **Repository releases** (specification text, schemas, conformance suite, tooling, website) | SemVer 2.0.0, Git tag `vX.Y.Z` | `v0.3.0` | [section 6.3](#63-repository-releases) |

### 6.1 API versions

The `apiVersion` is **not** a SemVer string. It follows Kubernetes-style maturity levels, and
SemVer concepts map onto it as follows:

| Level | Example | Compatibility promise | SemVer analogy |
| --- | --- | --- | --- |
| alpha | `v1alpha1`, `v1alpha2` | None between alpha versions. Each `v1alphaN` may change any field incompatibly compared to the previous one. | `0.y.z`: anything may change |
| beta | `v1beta1`, `v1beta2` | A later beta may change incompatibly only with a documented migration path (a mechanical conversion from the previous beta) and a deprecation notice in the previous beta. | release candidate of `1.0.0` |
| stable | `v1` | Only backwards-compatible changes: new optional fields, new enum values that older runtimes reject cleanly (fail closed), clarifications. | `1.y.z`: MINOR and PATCH only |
| next major | `v2alpha1`, ... | Incompatible changes to `v1` require a new major API version that starts again at alpha. | `2.0.0` |

Proposed rules:

1. **A change is incompatible** if a manifest that was valid becomes invalid, a manifest that was
   invalid becomes valid in a way that weakens a governance control, or a runtime requirement
   (MUST) changes for an existing field. Adding a field to `v1` is compatible only if it is
   optional and its absence keeps the previous meaning.
2. **Fail closed stays the compatibility mechanism.** Because runtimes reject unknown fields
   ([spec 3.3](../spec/v1alpha1/README.md#33-unknown-fields-and-extensions)), a new optional field
   in `v1` makes manifests that use it unreadable for older `v1` runtimes. That is intended: a
   governance control must never be ignored silently. Runtimes report the field and, if known, the
   minimum repository release that defines it.
3. **Promotion from alpha to beta** requires: every Accepted AEP for the version is Implemented or
   explicitly deferred; JSON Schema and conformance suite cover every MUST requirement on
   documents; at least **two independent implementations** (maintained by different organizations)
   have published conformance statements for at least the `core` profile against the candidate
   version; and an FCP on the promotion.
4. **Promotion from beta to stable** requires: at least six months without incompatible change in
   the latest beta; a runtime conformance test suite for every profile included in `v1`; at least
   two independent implementations per included profile; a migration tool or documented
   conversion from the last beta. Profiles without two implementations stay optional or move to
   the next version.
5. **Support windows.** Runtimes MAY support several API versions ([spec 14](../spec/v1alpha1/README.md#14-versioning)).
   The project recommends that runtimes keep supporting the previous beta for at least six
   months after the next beta or `v1` is published. Alpha versions get no support window.
6. **Deprecation in `v1`.** A deprecated field stays valid in every `v1` revision and is removed
   only in a later major API version. Deprecations are announced in the specification text and the
   changelog, and validators SHOULD warn about deprecated fields.

### 6.2 Published versions are frozen

- An API version is a **draft** while its text carries the draft status (today: `v1alpha1`).
  Drafts may change through AEPs and editorial pull requests.
- When an API version is **published** (a repository release marks it as published), its
  normative text, JSON Schema `$id` and conformance requirements are frozen. Afterwards only
  **errata** are allowed: corrections that do not change which manifests are valid and do not add
  runtime requirements. Errata are listed in the changelog and in an errata section of the
  specification.
- A change that is not an erratum needs a new API version, even for alpha versions.

### 6.3 Repository releases

Repository releases follow [SemVer 2.0.0](https://semver.org) and the project changelog, as
[GOVERNANCE.md](../GOVERNANCE.md#specification-versions) already states. Proposed meaning:

| Bump | When |
| --- | --- |
| MAJOR | Support for an API version is removed from the repository's schema or tooling, or the CLI output formats ([docs/cli.md](cli.md)) or the conformance index format change incompatibly. Before `1.0.0`, such changes are MINOR and marked as breaking in the changelog. |
| MINOR | A new API version (draft or published), a new profile, new schema entry points, new conformance cases, new website sections. |
| PATCH | Errata, editorial changes, fixes to examples or tooling that do not change results. |

The conformance suite carries its own SemVer version (`conformance/index.json` `version`): MAJOR
when the expected result of an existing case changes, MINOR for new cases, PATCH for metadata
fixes (rule texts, paths that do not change the result). A conformance statement names the suite
version it was tested with (`testedWith`, [spec 11.3](../spec/v1alpha1/README.md#113-conformance-statement)).

## 7. Conformance mark (proposal)

### 7.0 Self-declared schema conformance during alpha

Adopted with this process (decision log R1). It is not a mark and gives no right to a logo.

1. An implementation MAY state "**AWP `<api version>` schema conformant (alpha)**" only when all of
   the following hold, shown by a public CI run on the implementation's default branch:
   - its validator gives the expected result (accept or reject, and the `path` for rejections) for
     every case of the AWP conformance suite (`conformance/index.json`) of a named suite version,
     for the profiles it names;
   - every manifest it exports (a committed set of golden exports plus every shipped example that
     it exports) is accepted by the reference checker of the same suite version with digest
     verification enabled;
   - the suite and schema it runs are an unmodified copy of a named commit or release of this
     repository, verified by hash.
2. The statement names the API version, the suite version, the profiles whose document rules were
   checked, the date, a link to the CI run, and every limitation (for example "agents that use
   conditions are not exported").
3. The statement is about documents only. It MUST NOT be phrased as runtime conformance to a
   profile (spec 11.1, 11.3) and MUST NOT imply a compliance property.
4. Until rule 1 is met, the implementation describes itself as "**built to the AWP schema,
   conformance in progress (alpha)**".
5. A failing run on the default branch makes the statement invalid until the next passing run;
   the implementation updates or removes the statement.

**No conformance mark exists today. No implementation is certified, and none may claim a mark.**
[GOVERNANCE.md](../GOVERNANCE.md#conformance-claims) allows only plain, accurate statements such as
"conforms to AWP `v1alpha1` profiles core and audit", and only for profiles an implementation
actually meets. The following rules are a proposal for when a mark is introduced. They do not
assume any registered trademark or legal protection; whether a name or logo is registered is a
separate decision of the project.

### 7.1 Preconditions for introducing a mark

- A **runtime** conformance test suite exists for the profiles the mark covers. The current suite
  ([conformance/](../conformance/README.md)) tests validators and manifest rules only.
- The mark is available only for **beta and stable** API versions. For alpha versions,
  implementations may publish self-declared conformance statements but no mark.
- These rules are adopted through a `Process` AEP.

### 7.2 Self-certification

1. The implementer runs the public conformance suite (validator and runtime parts) of a stated
   suite version against a stated implementation version.
2. The implementer publishes, at a stable public URL: the conformance statement of
   [spec 11.3](../spec/v1alpha1/README.md#113-conformance-statement) with `testedWith`, every
   limitation of the claimed profiles, and the machine-readable test report.
3. The implementer opens a pull request to be listed on the implementations page with links to
   both. Maintainers check that the evidence is complete and consistent (claimed profiles match the
   report, no failing MUST case, limitations listed). They do not re-run the suite by default but
   may reproduce any case.
4. The listing shows API version, profiles, implementation version, suite version and date. A
   mark always names the API version and the profiles, for example "AWP v1beta1 conformant:
   core, audit (self-certified)". A mark without profiles is not allowed.
5. There is no fee. Every implementation, including OpenAgentix, follows the same steps; a
   maintainer affiliated with the implementation does not review its listing.

### 7.3 Validity

- A listing is valid for the implementation version range the implementer states, and at most
  until a new MAJOR version of the conformance suite for the same API version is released plus
  90 days. The implementer renews it by repeating section 7.2.
- An implementation that drops a claimed profile or a MUST requirement updates or withdraws its
  statement.

### 7.4 Usage rules

- The mark must not suggest legal or regulatory compliance, certification by a third party, or
  endorsement of the product by the AWP project.
- The mark must not be used for a different implementation, an unlisted version range, or other
  profiles than listed.
- Statements about other platforms (for example "works with X") are not part of the mark.

### 7.5 Revocation

1. **Grounds**: a claimed MUST case fails and the failure is reproduced by a maintainer; the
   published evidence is missing, incomplete or inconsistent; the mark is used against section
   7.4; or the listing has expired.
2. **Report**: anyone can report a suspected violation in a public issue (or via
   info@openagentix.si when the report cannot be public). Reports must contain reproducible
   evidence.
3. **Remediation**: the implementer is notified in the issue and has **30 days** to fix the
   implementation, correct the statement or withdraw the claim. The period can be extended once.
4. **Decision**: if the violation remains, the maintainers decide by the normal decision process,
   excluding maintainers affiliated with the implementation. The listing is then marked "revoked"
   with date and reason, and stays visible for transparency.
5. **Appeal and reinstatement**: the implementer may request one re-review with new evidence.
   A revoked implementation can be listed again by completing section 7.2 for a version that fixes
   the cause.

## 8. Open questions

1. Is 10 working days the right minimum FCP, given that GOVERNANCE.md asks for 5 working days for
   substantive changes?
2. ~~Should AEP numbers be assigned at `Draft` (proposed) or reuse the pull request number?~~
   Decided 2026-10-10 (D1): numbers are assigned at `Draft`; 0001-0011 are kept.
3. Should the alpha-to-beta promotion require two independent implementations of `core` only, or
   also of one further profile?
4. Who runs a runtime conformance suite for implementations that are not open source, and how is
   the test report made verifiable?
5. Should a mark exist at all, or are listed self-declared conformance statements enough?
6. Does the project want to register a name or logo before introducing a mark, and who would hold
   it?
