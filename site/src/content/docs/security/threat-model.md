---
title: "Threat model"
description: "Security considerations for specification and implementations."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

| Topic | Consideration |
| ----- | ------------- |
| Prompt injection | Tool results and remote agent messages are untrusted input. Governance is enforced outside the model. |
| Shell access | `shell.execute` can do what action rules cannot see. Network and filesystem restrictions and isolation are the primary controls. |
| Incomplete action mappings | Rules on well-known actions apply only to mapped tools. Prefer `default: deny`. |
| Remote agents | The local runtime cannot enforce governance inside a remote agent. Treat them as external parties. |
| Secrets | Reference, scope and redact. |
| Approval fatigue | Requests need enough context for a meaningful decision. |
| Audit integrity | Hash chains do not detect deletion of a whole chain. |

Report problems in the specification or tooling via [GitHub private vulnerability reporting](/community/security-policy/).

Normative text: [Security considerations](/specification/v1alpha1/#12-security-considerations), [Privacy considerations](/specification/v1alpha1/#13-privacy-considerations).

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
