# Changelog

All notable changes to this repository are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
repository adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Specification
API versions (`v1alpha1`, ...) are versioned separately, see [GOVERNANCE.md](GOVERNANCE.md).

## [Unreleased]

### Changed

- Website: restyled as a documentation site (introduction page at `/`, sidebar with version label, on-this-page table of contents, prev/next links, mobile drawer, scrollable tables and code blocks); the marketing homepage was removed and its content moved into the docs pages.

### Added

- OpenAgentix alignment documents (`docs/alignment/`, informative, not adopted): field-by-field alignment matrix v2 against the current `agents.md` source and examples with a prototype converter evaluation (no example converts cleanly; all produce valid AWP manifests only in lossy mode), a proposal for the `x-openagentix-*` extension namespace, a single-source-of-truth workflow (schema pin, drift test, conformance CI) and a phased plan with open decisions. OpenAgentix remains not conformant; no conformance claim is made.
- Website (`site/`): Astro Starlight site with homepage, concept, governance, security, integration, example and implementation pages, the specification rendered from `spec/`, offline Pagefind search, dark/light themes, link check, size budget and accessibility check, and a GitHub Pages workflow (`.github/workflows/pages.yml`).
- Website: Quickstart page and `llms.txt` / `llms-full.txt` generated at build time.

- Repository scaffold: README, licenses (CC BY 4.0 for specification text, Apache-2.0 for code),
  Code of Conduct, contributing guide with DCO, governance, security policy, issue and pull request
  templates, `CNAME` for `agenticworkflowprotocol.org`.
- Draft specification `v1alpha1` (`spec/v1alpha1`): document model, kinds `Workflow`, `Agent` and
  `Policy`, governance, policy evaluation, supply chain integrity, audit and traceability,
  conformance profiles, glossary and nine examples.
- Documentation site plan (`docs/site-plan.md`).
- JSON Schema (draft 2020-12) for manifests of `v1alpha1` (`schema/awp.v1alpha1.json`) with entry
  points for `Workflow`, `Agent` and `Policy`, and a catalogue of the semantic validation rules
  that JSON Schema cannot express (`schema/README.md`).
- Conformance suite for validators (`conformance/`): 28 valid and 141 invalid manifests (one rule
  per file, named after the specification section), a machine-readable test index
  (`conformance/index.json`) and a reference checker (`npm test`) with pinned development
  dependencies (`ajv`, `yaml`).
- Command-line output formats for `awp validate`, `awp lint`, `awp simulate`, `awp plan`, `awp run`
  and `awp audit`, including diagnostics, exit codes and the plan output (`docs/cli.md`).
- Mapping of the OpenAgentix `agents.md` syntax to AWP `v1alpha1` (`docs/mapping-agents-md.md`): field-by-field table, converter design, round-trip expectations and the work needed per conformance profile, plus a website page on the OpenAgentix implementation status (not conformant).
- Draft proposal for AWP Enhancement Proposals (`docs/aep-process.md`, not adopted): AEP lifecycle, numbering, template (`aep/0000-template.md`), versioning rules for API versions and repository releases, and rules for a future conformance mark (self-certification, test suite, revocation). No mark or certification exists.

### Changed

- Specification section 11.4 links to the CLI output format document instead of announcing it.

[Unreleased]: https://github.com/open-agentix/agenticWorkflowProtocol.org/commits/main
