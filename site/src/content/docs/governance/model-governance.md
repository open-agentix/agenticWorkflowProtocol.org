---
title: "Model governance"
description: "Allowed providers and models, approval status and requirements."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
modelPolicy:
  allowedProviders:
    - openai
    - azure-openai
    - ollama
  allowedModels:
    - gpt-5
    - qwen3
  forbiddenModels:
    - unapproved-model
  requirements:
    approvalStatus: approved
    encryption: true
    region: EU
```


- Every agent model is validated against `modelPolicy` before the execution starts.
- Substituted (fallback) models must satisfy the policy as well and the substitution is audited.
- A model can carry `approval`, `evaluation` and `region` metadata; expired approvals do not satisfy a requirement.


Normative text: [Model governance](/specification/v1alpha1/#74-model-governance).

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
