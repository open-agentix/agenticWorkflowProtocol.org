# AWP specification

This directory contains the normative text of the Agentic Workflow Protocol (AWP).

| API version | Status | Text |
| ----------- | ------ | ---- |
| `v1alpha1` | **Draft / alpha** - may change incompatibly | [v1alpha1/README.md](v1alpha1/README.md) |

- Glossary: [v1alpha1/glossary.md](v1alpha1/glossary.md)
- Examples (valid YAML, non-normative): [v1alpha1/examples/](v1alpha1/examples/)

## Roadmap: proposed changes (not adopted)

The following AWP Enhancement Proposals are **drafts**. None is accepted, none changes `v1alpha1`,
and the AEP process itself is still a proposal ([docs/aep-process.md](../docs/aep-process.md)).
Target versions are proposals and may change or be dropped.

| AEP | Title | Proposed target |
| --- | ----- | --------------- |
| [0001](../aep/0001-conditional-steps.md) | Conditional steps (`when`) | `v1alpha2` |
| [0002](../aep/0002-tool-argument-constraints.md) | Argument constraints and call limits in permissions | `v1alpha2` |
| [0003](../aep/0003-typed-handoffs.md) | Typed handoffs between steps | `v1alpha2` |
| [0004](../aep/0004-event-references.md) | Event references | `v1alpha2` |
| [0005](../aep/0005-prompt-kind.md) | Kind `Prompt` | `v1alpha2` or later |
| [0006](../aep/0006-playbook-kind.md) | Kind `Playbook` | `v1alpha3` or later |
| [0007](../aep/0007-mcp-connection-catalog.md) | MCP connection catalog | `v1alpha3` |
| [0008](../aep/0008-model-provider-catalog.md) | Model and provider catalog | `v1alpha3` |
| [0009](../aep/0009-audit-payload-levels.md) | Audit payload levels and content retention | `v1alpha3` |
| [0010](../aep/0010-digest-canonicalization.md) | Digest canonicalisation (JCS) | `v1alpha2` |
| [0011](../aep/0011-required-extensions.md) | Required extensions | `v1alpha2` |

The specification text is licensed under [CC BY 4.0](../LICENSE-SPEC); examples, schemas and
code are licensed under [Apache-2.0](../LICENSE).

AWP provides machine-readable governance primitives that can help organizations implement and
enforce their own compliance requirements. Compliance depends on the implementation,
organizational controls and applicable regulatory requirements.
