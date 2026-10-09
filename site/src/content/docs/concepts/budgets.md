---
title: "Budgets and resources"
description: "Bounding cost, steps, duration, tokens, tool calls, retries and concurrency."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
budget:
  maxCostUsd: 5.00
  maxSteps: 50
  maxDuration: 30m
  resources:
    maxTokens: 100000
    maxToolCalls: 100
```

- Limits nest (step, agent, workflow); the minimum applies.
- The runtime checks limits before every model invocation and action and stops the execution with `workflow.failed` and `reason: budgetExceeded`.
- Absent limits are unlimited, except `maxConcurrency` (default 1) and `maxRetries` (default 0).

Normative text: [Budgets and resources](/specification/v1alpha1/#57-budgets-and-resources).
