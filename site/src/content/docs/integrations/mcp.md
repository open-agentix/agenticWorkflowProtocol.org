---
title: "MCP"
description: "Referencing MCP servers as tool sources."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

```yaml
tools:
  - type: mcp
    server: github
```

A manifest declares MCP servers under `spec.mcpServers` (transport, url or image, authentication via `secretRef`) and references them from agents. Every tool call becomes an action identifier that permissions, policies and approvals evaluate, and produces `tool.*` events. The MCP wire protocol is out of scope.

Normative text: [MCP servers](/specification/v1alpha1/#551-mcp-servers), [Tool sources](/specification/v1alpha1/#552-tool-sources).
