---
title: "Audit events"
description: "Event families, the event envelope and tamper evidence."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
id: 01JABC0000000000000000000C
type: policy.evaluated
time: "2026-10-05T13:42:30Z"
executionId: awp-exec-01JABC7Q4M2W9X0Y1Z2A3B4C5D
stepId: investigate
actor:
  type: runtime
  id: example-runtime
data:
  action: github.search_code
  decision: allow
```

Event families: `workflow.*`, `agent.*`, `tool.*`, `policy.*`, `approval.*`, `artifact.*`.

AWP defines the semantics of audit events; implementations may provide tamper-evident storage. The `audit.integrity.mode` values `none`, `hash-chain` and `signed` describe what a runtime offers.

Normative text: [Event envelope](/specification/v1alpha1/#103-event-envelope), [Event types](/specification/v1alpha1/#104-event-types), [Tamper evidence](/specification/v1alpha1/#105-tamper-evidence).

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
