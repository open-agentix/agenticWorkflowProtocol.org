---
title: "Decision trace"
description: "Structured decision records instead of private reasoning."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
decision:
  action: create_pull_request
  reason:
    type: policy-compatible-action
    summary: Fix applied and tests requested; pull request creation is allowed.
  evidence:
    - type: artifact
      ref: report
  policyChecks:
    - permissions
    - policies.pullRequest
```

AWP does not standardize or require private chain-of-thought. It standardizes events, inputs, outputs, decisions and policy results. Decision records are required for actions that need approval, so approvers see the facts behind a request.

Normative text: [Decision trace](/specification/v1alpha1/#106-decision-trace).
