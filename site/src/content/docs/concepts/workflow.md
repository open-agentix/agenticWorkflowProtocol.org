---
title: "Workflow steps and execution model"
description: "Steps, dependsOn, command steps and the execution model."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
workflow:
  - id: fix
    agent: fixer
  - id: test
    type: command
    command: npm test
    dependsOn:
      - fix
```

1. Cycles, duplicate step ids and unknown references are rejected.
2. A step is ready when all steps in `dependsOn` have succeeded; ready steps may run concurrently within `maxConcurrency`.
3. If a step fails after its retries, everything that depends on it is skipped.
4. Step statuses: `pending`, `running`, `waitingForApproval`, `succeeded`, `failed`, `skipped`, `cancelled`.
5. Outputs of a step are available to dependent steps through expressions.

Normative text: [Workflow steps](/specification/v1alpha1/#56-workflow-steps), [Execution model](/specification/v1alpha1/#563-execution-model).
