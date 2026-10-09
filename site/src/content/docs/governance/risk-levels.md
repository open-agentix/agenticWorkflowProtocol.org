---
title: "Risk levels"
description: "An organizational risk model, not a regulatory classification."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
metadata:
  risk:
    level: high
    category:
      - security
      - financial
```


| Level | Recommended default treatment |
| ----- | ----------------------------- |
| `low` | Autonomous execution within permissions and policies |
| `medium` | As low, and every action produces a `policy.evaluated` event |
| `high` | As medium, and non-read-only actions require human approval |
| `critical` | Execution prohibited unless explicitly approved |

Risk levels are a possible governance model. They are not a regulatory classification.


Normative text: [Risk levels](/specification/v1alpha1/#77-risk-levels).

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
