# AWP - Agentic Workflow Protocol

**An open, declarative standard for defining, governing, executing and auditing agentic workflows.**

> MCP connects agents to tools. A2A connects agents to agents. AWP defines how agents work.

> **Status: draft / alpha.** The current version of the specification is `v1alpha1`. It is a
> working draft: fields, semantics and conformance profiles may change incompatibly before
> `v1`. Do not rely on it for production interoperability yet.

## What AWP is

AWP is a **specification, not a platform**. It describes, in a vendor-neutral and machine-readable
way:

- **what** an agentic workflow does (agents, tools, steps, triggers, inputs),
- **within which limits** it may run (budgets, resources, tool permissions, environments),
- **under which governance** it runs (ownership, data classification, data residency, model
  governance, human approval, risk levels, separation of duties, supply-chain integrity),
- **what it leaves behind** (audit events, decision traces, reproducibility records).

AWP complements existing protocols instead of replacing them:

| Protocol | Scope |
| -------- | ----- |
| MCP      | Agents ↔ tools and resources |
| A2A      | Agent ↔ agent communication |
| AWP      | Definition, governance, execution and audit of agentic workflows |

A minimal manifest:

```yaml
apiVersion: awp.agenticworkflowprotocol.org/v1alpha1
kind: Workflow
metadata:
  name: vulnerability-fixer
  version: 0.1.0
  owner:
    team: security-team
spec:
  triggers:
    - type: manual
  budget:
    maxCostUsd: 2.00
    maxSteps: 30
    maxDuration: 15m
  agents:
    - id: fixer
      model:
        provider: ollama
        name: qwen3
      tools:
        - type: mcp
          server: github
  workflow:
    - id: fix
      agent: fixer
    - id: test
      type: command
      command: npm test
      dependsOn: [fix]
```

## Compliance

AWP provides machine-readable governance primitives that can help organizations implement and
enforce their own compliance requirements. AWP itself does not make any system compliant with any
law or regulation. Compliance depends on the implementation, organizational controls and
applicable regulatory requirements.

## Implementations

| Implementation | Status |
| -------------- | ------ |
| [OpenAgentix](https://github.com/open-agentix/open-agentix) | Reference implementation: **built to the AWP schema, conformance in progress (alpha)**; not conformant to any profile |

**Call for implementations:** AWP is not tied to OpenAgentix. If you build a runtime, validator or
tool that implements AWP, open an issue or pull request to be listed here. Listing requires a
public statement of the supported conformance profiles.

## Repository layout

| Path | Content |
| ---- | ------- |
| `spec/` | Normative specification text (planned for `v1alpha1`) |
| `docs/` | Concept documentation and website plan |
| `site/` | Website (Astro Starlight), see [site/README.md](site/README.md) |
| `CNAME` | Custom domain for GitHub Pages (`agenticworkflowprotocol.org`) |

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) (DCO sign-off,
Conventional Commits) and the [Code of Conduct](CODE_OF_CONDUCT.md). How decisions are made is
described in [GOVERNANCE.md](GOVERNANCE.md). Security issues: see [SECURITY.md](SECURITY.md).

Questions and ideas: GitHub Issues and Discussions. Contact: info@openagentix.si

## License

- Specification text and documentation: [CC BY 4.0](LICENSE-SPEC)
- Code, schemas, conformance tests and tooling: [Apache-2.0](LICENSE)
