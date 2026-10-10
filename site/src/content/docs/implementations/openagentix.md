---
title: "OpenAgentix"
description: "Status of OpenAgentix as an AWP implementation: built to the AWP schema, conformance in progress (alpha)."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

[OpenAgentix](https://github.com/open-agentix/open-agentix) intends to implement AWP. It is one implementation effort; AWP is a specification, not a platform, and OpenAgentix has no special rights over it.

## Status

**Built to the AWP schema, conformance in progress (alpha).**

| | |
| --- | --- |
| AWP version | `v1alpha1` (target of the first schema check); `v1alpha2` once it exists |
| Schema conformance | **Not yet shown.** No CI run of the AWP conformance suite against OpenAgentix's validator and real exports exists yet. |
| Conformance profiles | **None.** OpenAgentix is not conformant to any profile (`core`, `governance`, `audit`, `security`, `mcp`, `a2a`). |
| Conformance statement | Not published. |
| Reads or exports AWP manifests | Not yet. OpenAgentix still uses its own `agents.md` syntax (`openagentix.io/v1alpha1`); the switch to AWP manifests (strategy A) is planned and tracked in the OpenAgentix repository (label `awp`). |

This page makes no conformance claim. OpenAgentix may describe itself as "AWP `v1alpha1` schema conformant (alpha)" only after the AWP conformance suite passes against its validator and its real exports in its public CI ([rules](https://github.com/open-agentix/agenticWorkflowProtocol.org/blob/main/docs/aep-process.md#70-self-declared-schema-conformance-during-alpha)). Conformance to a profile additionally needs a runtime test suite and a published conformance statement with every limitation (see [Conformance](/implementations/conformance/)).

## Mapping from `agents.md`

A field-by-field mapping between `agents.md` and AWP `v1alpha1`, a converter design and the work needed per profile are in [docs/mapping-agents-md.md](https://github.com/open-agentix/agenticWorkflowProtocol.org/blob/main/docs/mapping-agents-md.md). In short:

- Identity, classification, budgets, manual and cron triggers, agents with their models and instructions, exact tool grants and per-tool approval map cleanly or with small, documented losses.
- Conditional steps (`when`), tool argument constraints, prefix wildcards and typed handovers have no AWP `v1alpha1` equivalent. An export that drops them would run with fewer restrictions on another runtime, so the proposed converter refuses to produce one by default.
- Many AWP features (typed inputs, step graphs, command and approval steps, data and model policies, environments, risk levels, `Policy` manifests, the audit event model, signatures, remote A2A agents) have no `agents.md` equivalent.

A second version of the mapping, written for the OpenAgentix plan to use AWP manifests natively, is in [docs/alignment/](https://github.com/open-agentix/agenticWorkflowProtocol.org/tree/main/docs/alignment): a verified alignment matrix with a prototype converter evaluation (none of the four OpenAgentix examples converts without losing security-relevant restrictions today), a proposed `x-openagentix-*` extension namespace and a phased plan. The owner's decisions of 2026-10-10 on that plan are recorded in a [decision log](https://github.com/open-agentix/agenticWorkflowProtocol.org/blob/main/docs/alignment/decisions.md). The related AWP Enhancement Proposals in `aep/` are in review and not accepted; each needs an external reviewer before acceptance. None of this changes the status above.

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
