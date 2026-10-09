---
title: "Tamper-evident audit"
description: "Hash chains and signed chains over audit events."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
audit:
  enabled: true
  integrity:
    mode: hash-chain
  retention:
    duration: 7y
```

AWP defines the semantics of audit events; implementations may provide tamper-evident storage. A hash chain detects modification but not deletion of a whole chain; external anchoring or replication is an implementation choice. Storage, key management and retention enforcement are implementation concerns.

Normative text: [Audit configuration](/specification/v1alpha1/#102-audit-configuration), [Tamper evidence](/specification/v1alpha1/#105-tamper-evidence).

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
