---
title: "Identity and ownership"
description: "Who is accountable for a workflow, agent or policy."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
metadata:
  name: invoice-processing
  version: 1.2.0
  owner:
    team: finance-ai
    contact: finance-ai@example.com
```


- `owner.team` is required under the governance profile; `businessOwner`, `technicalOwner` and `dataOwner` are optional.
- `metadata.classification` is required alongside the owner.
- Name, version and owner team are part of the `workflow.started` event.


Normative text: [Identity and ownership](/specification/v1alpha1/#71-identity-and-ownership).

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
