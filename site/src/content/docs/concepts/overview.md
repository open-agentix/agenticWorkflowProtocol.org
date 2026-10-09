---
title: "What AWP is and is not"
description: "AWP is a specification for declaring, governing and auditing agentic workflows. It is not a platform."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

AWP is a **specification, not a platform**. It describes in a vendor-neutral, machine-readable way:

- **what** an agentic workflow does: agents, tools, steps, triggers, inputs;
- **within which limits** it may run: budgets, permissions, environments;
- **under which governance** it runs: ownership, data classification, data residency, model governance, human approval, risk levels, separation of duties, supply-chain integrity;
- **what it leaves behind**: audit events, decision traces, reproducibility records.

A *runtime* reads a manifest, validates it, enforces its limits and governance rules while executing it, and emits audit events with standardized semantics.

```yaml
apiVersion: awp.agenticworkflowprotocol.org/v1alpha1
kind: Workflow
metadata:
  name: vulnerability-fixer
  version: 0.1.0
  owner:
    team: security-team
```

## Relationship to MCP and A2A

| Protocol | Scope |
| -------- | ----- |
| MCP | Agents to tools and resources |
| A2A | Agent to agent communication |
| AWP | Definition, governance, execution and audit of agentic workflows |

AWP does not replace MCP or A2A. See [Relationship to other protocols](/specification/v1alpha1/#12-relationship-to-other-protocols).

## What AWP is not

- Not a runtime, a hosting service or a product. OpenAgentix is one implementation.
- Not a compliance certification. AWP offers primitives; compliance depends on the implementation and the organization.
- Not a standard for model reasoning. It standardizes events, inputs, outputs, decisions and policy results, not private chain-of-thought.

## Possible runtimes

The diagram on the [homepage](/) shows AWP above A2A and MCP. Any runtime can sit under a manifest; which runtimes exist today is listed on the [implementations](/implementations/) page.

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
