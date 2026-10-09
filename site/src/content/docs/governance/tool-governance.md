---
title: "Tool governance"
description: "Permissions per action, with default deny, network and filesystem limits."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
permissions:
  default: deny
  tools:
    github.read:
      allow: true
    github.write:
      allow: true
    production.deploy:
      allow: false
  network:
    egress: deny
    allowHosts:
      - mcp.example.com
  secrets:
    - GITHUB_TOKEN
```


- `allow: false` wins over `allow: true` within one object; several `permissions` objects combine as an intersection.
- `resources` restricts an allowed action to specific targets. If the target cannot be determined, the call is denied.
- Permissions grant, policies restrict. Without a `permissions` object every action of the exposed tools is allowed by permissions; `awp lint` warns about this.


Normative text: [Tool governance: permissions](/specification/v1alpha1/#75-tool-governance-permissions).

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
