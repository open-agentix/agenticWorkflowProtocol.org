---
title: "Triggers and inputs"
description: "How an execution starts and how its parameters are declared and validated."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
triggers:
  - type: manual
  - type: schedule
    cron: "0 6 * * 1-5"
    timezone: Europe/Berlin
inputs:
  - name: cve
    type: string
    required: true
    pattern: "^CVE-[0-9]{4}-[0-9]{4,}$"
```

- Trigger types: `manual`, `schedule`, `event`. The trigger is recorded in `workflow.started`.
- Inputs are validated before an execution starts. Inputs must not carry secrets; secrets are referenced with `secretRef`.

Normative text: [Triggers](/specification/v1alpha1/#52-triggers), [Inputs](/specification/v1alpha1/#53-inputs).
