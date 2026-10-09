---
title: "Secrets"
description: "Secrets are referenced by name, never written into manifests."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
secrets:
  - name: GITHUB_TOKEN
    source: secret-manager
    scope:
      - github
mcpServers:
  - name: github
    transport: streamable-http
    url: https://mcp.example.com/github
    auth:
      secretRef: GITHUB_TOKEN
```

- A `secretRef` must name a declared secret whose `scope` includes the consumer.
- Manifests with fields such as `token`, `password` or `apiKey` holding literal values are rejected.
- Runtimes must not pass secret values to models and must not write them to audit events, logs or approval requests.

Normative text: [Secrets](/specification/v1alpha1/#79-secrets).

:::note[Compliance]
AWP provides machine-readable governance primitives that can help organizations implement and enforce their own compliance requirements. Compliance depends on the implementation, organizational controls and applicable regulatory requirements.
:::
