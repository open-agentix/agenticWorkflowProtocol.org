---
title: "Manifest"
description: "Structure of an AWP manifest: apiVersion, kind, metadata and spec."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

Every AWP document has four top-level fields.

```yaml
apiVersion: awp.agenticworkflowprotocol.org/v1alpha1
kind: Workflow          # Workflow, Agent or Policy
metadata:
  name: invoice-processing
  version: 1.2.0
  owner:
    team: finance-ai
spec: {}                # kind-specific
```

- `kind` is one of `Workflow`, `Agent` (a reusable agent definition) or `Policy` (a reusable rule set).
- Unknown fields are rejected. Extensions use the `x-` prefix. See [Unknown fields and extensions](/specification/v1alpha1/#33-unknown-fields-and-extensions).
- Names, versions, durations, timestamps and digests have fixed formats ([Document model](/specification/v1alpha1/#3-document-model)).
- A [JSON Schema](/schema/awp.v1alpha1.json) expresses the structural rules; the specification lists the semantic rules the schema cannot express.

Normative text: [Document model](/specification/v1alpha1/#3-document-model), [Metadata](/specification/v1alpha1/#4-metadata).
