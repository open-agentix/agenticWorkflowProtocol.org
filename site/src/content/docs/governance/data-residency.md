---
title: "Data residency"
description: "Where data may be processed and by which providers."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
dataPolicy:
  residency:
    allowed:
      - EU
  processing:
    allowedProviders:
      - azure-openai
      - ollama
    forbiddenProviders:
      - public-cloud-us
```


- Before each model invocation and each message to a remote agent the runtime determines provider and region.
- If the region is not allowed **or cannot be determined**, the operation is denied (fail closed) and `policy.denied` is emitted.
- `forbiddenProviders` takes precedence over `allowedProviders`.


Normative text: [Data residency and processing](/specification/v1alpha1/#73-data-residency-and-processing).

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
