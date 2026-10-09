---
title: "Versioning"
description: "How AWP API versions and the specification evolve."
banner:
  content: "Draft - v1alpha1. Fields and semantics may change before v1beta1."
---

AWP API versions are written in the `apiVersion` of every manifest:

```yaml
apiVersion: awp.agenticworkflowprotocol.org/v1alpha1
```

- `v1alpha1` is a working draft. Any field, rule or conformance requirement may change incompatibly in a later alpha (`v1alpha2`, ...).
- Beta and stable versions (`v1beta1`, `v1`) follow once the specification has been implemented and tested by more than one party.
- Runtimes reject manifests with an `apiVersion` they do not support (fail closed).
- This website models versions as directories, for example `/specification/v1alpha1/`.

See [Versioning in the specification](/specification/v1alpha1/#14-versioning) for the normative rules.
