# AEP-0007: MCP connection catalog (tool classes, data classification, named profiles)

| | |
| --- | --- |
| **AEP** | 0007 (proposed; numbered in pull request order, pending maintainer assignment) |
| **Title** | MCP connection catalog (tool classes, data classification, named profiles) |
| **Authors** | @agentix-zero |
| **Shepherd** | to be assigned |
| **Type** | Specification |
| **Status** | Draft |
| **Target API version** | `v1alpha3` (owner decision) |
| **Profiles affected** | `mcp` |
| **Created** | 2026-10-09 |
| **Discussion** | issue to be opened |
| **Supersedes** | - |
| **Superseded-by** | - |

## Summary

Extend MCP server declarations (spec 5.5.1) with a **catalog**: the tools of a server with an
access class (`read` or `write`), the highest data class each tool may receive, an optional mapping
to well-known actions, and named **profiles** (tool sets). Add a step field `access: read-only`
that the runtime enforces against the catalog. Catalogs can be inline or a separate kind
`McpCatalog` referenced by name, version and digest.

## Motivation

Permissions in `v1alpha1` grant action identifiers. Whether a tool only reads or also writes is
not visible in the manifest: tool names are vendor-chosen, MCP tool annotations are hints from the
server, and well-known action mappings are the author's responsibility (spec 5.5.4). Reviewers
therefore cannot check a claim such as "this step only reads". Organisations that run many
workflows also want to describe a server's tools once (classes, data clearance, groups) and reuse
that description, instead of repeating action groups in every workflow.

## Goals and non-goals

- Goals: a portable description of a server's tools for governance; named tool sets; an enforceable
  read-only step; data clearance per tool as policy input.
- Non-goals: discovering tools from the server (runtime concern), trusting server annotations,
  describing tool schemas (MCP already does).

## Specification

### Changes to section 5.5.1 (MCP servers)

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `catalog` | object | no | Inline catalog (fields below), or `ref` (`name`, `version`, `digest`) to an `McpCatalog` manifest. |

Catalog fields:

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `tools` | map | yes | Tool name -> `{ access: read \| write, classification?, actions? }`. `classification` is the highest data class the tool may receive (spec 7.2). `actions` lists well-known actions (spec 5.5.3) the tool performs. |
| `profiles` | map | no | Profile name (`^[a-z][a-z0-9-]{0,62}$`) -> list of tool names of this catalog. |

Rules:

1. Every profile member MUST be a tool of the catalog. A profile named `read` MUST contain only
   `read` tools.
2. A tool that the server exposes but the catalog does not list is treated as `write` with no
   clearance (fail closed); runtimes SHOULD warn.
3. Each profile `<p>` of server `<s>` defines the action group `<s>.<p>` (spec 5.5.4). It MUST NOT
   collide with an action group declared in `spec.actionGroups`.
4. Each `actions` entry adds the tool to the corresponding well-known action group.
5. Before each call, the runtime MUST deny the action (`policy.denied`, `tool.denied` with
   `reason: dataPolicy`) when the data classification of the operation ranks higher than the
   tool's `classification`.
6. MCP tool annotations (for example `readOnlyHint`) MUST NOT override the catalog.

### Changes to section 5.6.1

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `access` | string | no | `read-only` or `write` (default). In a `read-only` step every action MUST be an MCP tool classified `read` in a catalog; any other action, including `shell.execute` and remote agent messages, MUST be denied. Validators MUST reject a `read-only` agent step whose agent is permitted a tool that is classified `write` or not catalogued, when this can be decided statically. |

### New kind `McpCatalog`

`spec` contains `server` (informative name), `version` of the server the catalog describes, and the
catalog fields above. It is referenced from `mcpServers[].catalog.ref` with exact version and
optional digest (spec 9.1).

## Examples

```yaml
mcpServers:
  - name: tickets
    transport: streamable-http
    url: https://mcp.example.com/tickets
    catalog:
      tools:
        get_ticket:    { access: read,  classification: confidential }
        search:        { access: read,  classification: confidential }
        add_comment:   { access: write, classification: internal, actions: [external.communication] }
      profiles:
        read: [get_ticket, search]
        comment: [add_comment]
agents:
  - id: researcher
    model: { provider: example-provider, name: example-model }
    tools:
      - { type: mcp, server: tickets }
    permissions:
      default: deny
      tools:
        tickets.read: { allow: true }
workflow:
  - id: research
    agent: researcher
    access: read-only
```

## Schema changes

- `McpServer.catalog`; `$defs/McpCatalogSpec`; root kind `McpCatalog`; step `access`.
- Semantic rules: `catalog.profile-unknown-tool`, `catalog.read-profile-write-tool`,
  `catalog.group-collision`, `access.write-tool-granted` (static check where decidable).

## Conformance impact

- `mcp`: catalog validation, profile groups, clearance check per call, read-only enforcement.
- New cases: `valid/5.5.5-catalog.yaml`; invalid: `5.5.5-profile-unknown-tool.yaml`,
  `5.5.5-read-profile-with-write-tool.yaml`, `5.5.5-profile-group-collision.yaml`,
  `5.6.1-read-only-step-with-write-grant.yaml`.

## Compatibility and migration

Additive. Without `catalog` the `v1alpha1` behaviour holds.

## Security considerations

- A catalog is a declaration by the integrator; AWP cannot prove a `read` tool has no side
  effects. Catalogs are reviewed like permissions; pinning by digest prevents silent changes.
- Uncatalogued tools are `write` (fail closed).
- `read-only` also excludes shell and remote agents, which can have arbitrary effects.

## Privacy considerations

Per-tool `classification` keeps personal data away from tools not cleared for it (for example
external communication tools).

## Compliance note

AWP provides machine-readable governance primitives that can help organizations implement and
enforce their own compliance requirements. This proposal makes no compliance promise.

## Alternatives

- **Trust MCP tool annotations**: they are hints from the server, controlled by the server's
  author, and not a governance input.
- **Action groups only**: express sets, but not access classes or clearance.
- **New profile `catalog`** instead of extending `mcp`: possible; proposed here inside `mcp`
  because it only applies to MCP tool sources (owner decision 9).

## Implementation status

OpenAgentix (in progress, not conformant) has connection-level tool access classes, named profiles
expanded at publish time, and a read-only step check, in its own format. No implementation of this
AEP exists.

## Open questions

1. Should built-in tools (`shell`) get catalog entries too?
2. Should profile expansion be recorded in the reproducibility record (catalog digest)?

## References

- Spec sections 5.5, 5.6, 7.2, 9.1.
- Model Context Protocol tool annotations.
