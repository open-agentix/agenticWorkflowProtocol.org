---
title: "Reproducibility"
description: "A record of what an execution depended on."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
executionId: awp-exec-01JABC7Q4M2W9X0Y1Z2A3B4C5D
status: succeeded
environment: development
workflow:
  name: vulnerability-fixer
  version: 0.1.0
  digest: sha256:5c4b3a29180716f5e4d3c2b1a0f9e8d7c6b5a49382716f5e4d3c2b1a0f9e8d7c
```

At the end of every execution an audit-profile runtime produces a record of workflow, agent, model and prompt versions, tools, images, policies, inputs and artifacts. This is *traceability of what ran*; AWP does not require identical model output on re-execution.

Normative text: [Reproducibility record](/specification/v1alpha1/#107-reproducibility-record).
