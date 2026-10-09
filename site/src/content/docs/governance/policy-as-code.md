---
title: "Policy-as-Code"
description: "Declarative rules evaluated by the runtime before an action."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
apiVersion: awp.agenticworkflowprotocol.org/v1alpha1
kind: Policy
metadata:
  name: no-production-autonomy
  version: 1.0.0
  owner:
    team: platform-governance
spec:
  rules:
    - id: deploy-needs-release-manager
      when:
        action: production.deploy
      effect: requireApproval
      approval:
        approvers:
          - role: release-manager
```

- A rule has a `when` condition and an `effect` (`allow`, `deny`, `requireApproval`).
- Every evaluation produces a `policy.evaluated` event; denials produce `policy.denied`.
- Decisions of several sources are combined by a defined algorithm; an unevaluable policy denies.
- Policies are reusable `Policy` manifests that workflows reference.

Normative text: [Kind Policy and policy evaluation](/specification/v1alpha1/#8-kind-policy-and-policy-evaluation), [Decision combination](/specification/v1alpha1/#84-decision-combination).

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
