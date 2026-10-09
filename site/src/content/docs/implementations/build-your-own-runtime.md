---
title: "Build your own AWP runtime"
description: "A starting path for implementers."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

1. Read the [specification](/specification/v1alpha1/#1-introduction) and the [glossary](/specification/v1alpha1/glossary/).
2. Validate manifests with the [JSON Schema](/schema/awp.v1alpha1.json) and implement the semantic rules listed in the [schema README](https://github.com/open-agentix/agenticWorkflowProtocol.org/blob/main/schema/README.md).
3. Run the [conformance suite](https://github.com/open-agentix/agenticWorkflowProtocol.org/tree/main/conformance): valid manifests must be accepted, invalid ones rejected with the expected diagnostic.
4. Start with the `core` profile, then add `governance`, `audit`, `security`, `mcp` and `a2a` as needed.
5. Publish a conformance statement with the profiles you meet and the optional features you do not support.
6. Open a pull request to be listed on the [implementations](/implementations/) page.

Optionally provide the [CLI commands](/tooling/cli/) with the specified output formats.
