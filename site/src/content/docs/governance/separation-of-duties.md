---
title: "Separation of duties"
description: "Rules that keep the requester of an action from approving it."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
approval:
  separationOfDuties:
    enabled: true
    rules:
      - actorCannotApproveOwnAction: true
      - initiatorCannotApprove: true
```


Example flow: an agent creates a pull request, a developer reviews, security approves, a release manager deploys; each step by a different human. The runtime rejects approvals that violate a rule and records the reason.


Normative text: [Separation of duties](/specification/v1alpha1/#78-separation-of-duties).

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
