---
title: "Human approval"
description: "Human decisions that gate actions or steps."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
approval:
  requiredFor:
    - production.deploy
    - git.merge
    - external.communication
  approvers:
    - role: security-reviewer
  timeout: 24h
```


- The runtime pauses before the action, emits `approval.requested` and does not execute until `minApprovals` approvals are granted.
- An approval applies to exactly one action request and cannot be reused.
- Agents cannot grant approvals; an authenticated human must.
- Approval requests show workflow, step, action, redacted arguments, data classification and the decision record.


Normative text: [Human approval](/specification/v1alpha1/#76-human-approval).

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
