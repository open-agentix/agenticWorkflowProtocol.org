---
title: "A2A"
description: "Remote agents over the Agent2Agent protocol."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
agents:
  - id: security-agent
    protocol: a2a
    endpoint: https://agents.example.com/a2a/security-review
    agentCard:
      url: https://agents.example.com/.well-known/agent-card.json
      digest: sha256:1f2e3d4c5b6a79880716253443526170f1e2d3c4b5a6978877665544332211ff
    auth:
      secretRef: REVIEW_AGENT_TOKEN
```

Messages to a remote agent are the action `a2a.<id>.send` and are subject to data policy. The local runtime cannot enforce governance inside the remote agent; treat it as an external party.

Normative text: [Remote agents (A2A)](/specification/v1alpha1/#544-remote-agents-a2a).
