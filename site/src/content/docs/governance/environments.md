---
title: "Environments"
description: "Different autonomy for the same workflow in different environments."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
environment:
  name: production
environments:
  development:
    autonomy: unrestricted
  staging:
    autonomy: controlled
  production:
    autonomy: approval-required
    autoApprove:
      - erp.read
```


- `autonomy` values: `unrestricted`, `controlled`, `approval-required`, `prohibited`.
- An execution in an environment that is not listed does not start.
- The runtime is responsible for running an environment with that environment's credentials; AWP cannot verify it.


Normative text: [Environments](/specification/v1alpha1/#710-environments).

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
