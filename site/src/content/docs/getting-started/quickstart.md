---
title: Quickstart
description: Validate an AWP manifest with the reference conformance checker in five steps.
---

This page walks you through validating a manifest with the reference checker in the repository. The checker is development tooling for the specification, not a runtime and not a product. You need Node.js 20 or newer and Git.

## 1. Get the repository

```sh
git clone https://github.com/open-agentix/agenticWorkflowProtocol.org
cd agenticWorkflowProtocol.org
```

## 2. Install the pinned dependencies

The checker has two pinned development dependencies. Install scripts are disabled.

```sh
npm ci --ignore-scripts
```

## 3. Write a manifest

Create `hello.workflow.yaml`. It declares an owner, a budget, one agent, one step and a default-deny permission model.

```yaml title="hello.workflow.yaml"
apiVersion: awp.agenticworkflowprotocol.org/v1alpha1
kind: Workflow
metadata:
  name: hello-workflow
  version: 0.1.0
  owner:
    team: example-team
  classification: internal
  risk:
    level: low
spec:
  triggers:
    - type: manual
  budget:
    maxCostUsd: 1.00
    maxSteps: 10
    maxDuration: 5m
  agents:
    - id: helper
      model:
        provider: ollama
        name: qwen3
  workflow:
    - id: greet
      agent: helper
  permissions:
    default: deny
```

## 4. Validate it

```sh
node conformance/awp-check.mjs check hello.workflow.yaml
```

The checker applies the YAML restrictions, the JSON Schema and the semantic rules. Add `--json` for machine-readable diagnostics, or `--profiles core,governance` to limit the profiles.

## 5. Break it on purpose

Remove the `owner` block or add an unknown field under `spec`, then run the check again. The checker reports a diagnostic with a code and a JSON Pointer to the offending node. Unknown fields are rejected instead of ignored.

To run the whole conformance suite:

```sh
npm test
```

## Next steps

- Read the [Manifest](/concepts/manifest/) concept and the [Specification](/specification/v1alpha1/).
- Study the annotated [examples](/examples/).
- Building a runtime or validator? See [Conformance](/implementations/conformance/) and [Build your own runtime](/implementations/build-your-own-runtime/).
