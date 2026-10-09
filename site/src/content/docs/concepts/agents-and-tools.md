---
title: "Agents and tools"
description: "Agents, models, MCP tool sources and action identifiers."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
agents:
  - id: fixer
    model:
      provider: ollama
      name: qwen3
    tools:
      - type: mcp
        server: github
```

- An agent has an `id`, a `model` object (`provider`, `name`, optional `version`, `region`, `approval`), instructions and tools.
- Agents can be defined inline, referenced by `name@version` from an `Agent` manifest, or be remote agents over A2A.
- Every tool call is an **action** with an identifier such as `github.create_pull_request`. Permissions, policies and approvals all work on action identifiers; action groups map many tools to one name like `git.merge`.

Normative text: [Agents](/specification/v1alpha1/#54-agents), [Tools and action identifiers](/specification/v1alpha1/#55-tools-and-action-identifiers), [Kind Agent](/specification/v1alpha1/#6-kind-agent).
