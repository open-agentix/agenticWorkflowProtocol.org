# Changelog

All notable changes to this repository are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
repository adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Specification
API versions (`v1alpha1`, ...) are versioned separately, see [GOVERNANCE.md](GOVERNANCE.md).

## [Unreleased]

### Added

- Website (`site/`): Astro Starlight site with homepage, concept, governance, security, integration, example and implementation pages, the specification rendered from `spec/`, offline Pagefind search, dark/light themes, link check, size budget and accessibility check, and a GitHub Pages workflow (`.github/workflows/pages.yml`).

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

### Changed

- Specification section 11.4 links to the CLI output format document instead of announcing it.

[Unreleased]: https://github.com/open-agentix/agenticWorkflowProtocol.org/commits/main
