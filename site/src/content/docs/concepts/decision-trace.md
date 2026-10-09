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

## Example execution trace

A run can be summarized as an ordered trace of the steps, tool calls and policy checks it performed:

```text title="execution trace"
Execution ID: awp-exec-01JABC7Q4M2W9X0Y1Z2A3B4C5D
Workflow:     vulnerability-fixer@0.1.0
Started:      2026-10-05T13:42:11Z

  01  trigger
  02  researcher
  03  github.search
  04  fixer
  05  shell.execute
  06  npm.test
  07  policy.check
  08  pull-request

Result:       SUCCESS
```

AWP does not standardize or require private chain-of-thought. It standardizes events, inputs, outputs, decisions and policy results. Decision records are required for actions that need approval, so approvers see the facts behind a request.

Normative text: [Decision trace](/specification/v1alpha1/#106-decision-trace).
