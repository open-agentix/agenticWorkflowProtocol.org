---
title: "Security"
description: "Secrets, supply chain, tamper-evident audit and the threat model."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

- [Secrets](/security/secrets/)
- [Supply chain](/security/supply-chain/)
- [Tamper-evident audit](/security/tamper-evident-audit/)
- [Threat model](/security/threat-model/)

Governance in AWP is enforced by the runtime outside the model: an agent cannot change permissions, policies, budgets or approvals by producing text. Unknown fields, unsupported profiles, undeterminable regions and unverifiable digests lead to rejection or denial, never silent acceptance (fail closed).

Normative text: [Security considerations](/specification/v1alpha1/#12-security-considerations).

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
