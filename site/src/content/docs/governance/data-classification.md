---
title: "Data classification"
description: "Classes for inputs and outputs and the rules that follow from them."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
dataPolicy:
  classification: confidential
  inputs:
    - name: customer_data
      classification: personal
  outputs:
    - name: report
      classification: internal
  restrictions:
    externalTransfer: deny
```


- Classes from least to most restrictive: `public`, `internal`, `confidential`/`personal`, `restricted`/`sensitive`, `secret`.
- Executions whose inputs rank above `dataPolicy.classification` are rejected.
- Declassifying an output is recorded in the `artifact.created` event.
- The classes are an organizational vocabulary. Mapping them to legal definitions is up to the organization.


Normative text: [Data classification](/specification/v1alpha1/#72-data-classification).

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
