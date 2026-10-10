# AEP-0007: MCP connection catalog (tool access classes, pinned tool definitions, authorization), aligned with the MCP specification

| | |
| --- | --- |
| **AEP** | 0007 |
| **Title** | MCP connection catalog (tool access classes, pinned tool definitions, authorization), aligned with the MCP specification |
| **Authors** | @agentix-zero |
| **Shepherd** | Project lead (proposed; not an author, [aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)) |
| **Type** | Specification |
| **Status** | Review (proposed for `v1alpha2`; not accepted) |
| **Reviewer roles needed** | runtime implementer, MCP practitioner, security reviewer. None identified yet; an external review is required before `Accepted` ([aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)). |
| **Owner decisions** | [D8](../docs/alignment/decisions.md#d8-and-question-17-prompt-and-playbook-are-in-v1alpha2), [D9](../docs/alignment/decisions.md#d9-mcp-catalog-in-the-mcp-profile-aligned-with-the-mcp-specification) (2026-10-10) |
| **Target API version** | `v1alpha2` |
| **Profiles affected** | `mcp` (no new profile), `audit` (new event type) |
| **MCP revision** | Terms checked against the Model Context Protocol specification, revision `2026-07-28` (read as reference data; [conflict C7](../docs/alignment/decisions.md#c7-mcp-terms-are-external-reference-data)) |
| **Created** | 2026-10-09 |
| **Discussion** | issue to be opened |
| **Supersedes** | - |
| **Superseded-by** | - |

## Summary

Extend MCP server declarations (spec 5.5.1) with a **catalog** that describes, for governance, what
an MCP server offers, in the terms of the Model Context Protocol (MCP) specification: its **tools**
(keyed by the MCP tool `name`, with a pinned digest of each MCP tool definition), its **resources**
(by `uri` or `uriTemplate`), an AWP **access class** (`read` or `write`) and data clearance per
entry, and named **profiles** (tool sets that become action groups). Add a step field
`access: read-only` that the runtime enforces against the catalog, and an `auth` form for MCP
servers that follows MCP authorization (OAuth 2.1 with resource indicators and protected resource
metadata). Catalogs can be inline or a separate kind `McpCatalog` referenced by name, version and
digest. Everything stays in the `mcp` profile.

## Motivation

Permissions in `v1alpha1` grant action identifiers. Whether a tool only reads or also writes is
not visible in the manifest: tool names are chosen by the server's author, MCP tool annotations
(`readOnlyHint`, `destructiveHint`, ...) are hints that the MCP specification itself says clients
must treat as untrusted unless they come from trusted servers, and well-known action mappings are
the author's responsibility (spec 5.5.4). Reviewers therefore cannot check a claim such as "this
step only reads".

Two further gaps follow from MCP itself:

- **Tool definitions change.** `tools/list` can return different definitions over time
  (`notifications/tools/list_changed`), and per the MCP specification the list may also vary by
  the authorization presented. A grant reviewed against one description and input schema can
  silently apply to a different one ("rug pull"); descriptions are also a channel for prompt
  injection ("tool poisoning"). A digest of the reviewed definition closes this.
- **Credentials.** `v1alpha1` only has `auth.secretRef`, a static credential. MCP defines OAuth 2.1
  based authorization for HTTP transports with audience-bound tokens (resource indicators,
  RFC 8707) and discovery through protected resource metadata (RFC 9728). Manifests need to say
  which method and which scopes a server connection uses so that reviewers see the authority a
  workflow obtains.

Organisations that run many workflows also want to describe a server once (classes, clearance,
profiles, pinned definitions) and reuse that description, instead of repeating action groups in
every workflow.

## Goals and non-goals

- Goals: a portable governance description of an MCP server in MCP's own terms; pinned tool
  definitions; named tool sets for least-privilege grants and publish-time enumeration (AEP-0002);
  an enforceable read-only step; data clearance per tool and resource as policy input; an `auth`
  form that matches MCP authorization.
- Non-goals: redefining MCP messages or data types; trusting server annotations; implementing an
  authorization server; MCP prompts and sampling (open question 3); discovering tools at publish
  time (a runtime or tooling concern; the catalog records the result).

## Terminology

Terms in `code` that are not defined by AWP are MCP terms with the meaning of the MCP
specification revision named in the header: *tool* and its fields `name`, `title`, `description`,
`inputSchema`, `outputSchema`, `annotations`; *tool annotations* (`readOnlyHint`,
`destructiveHint`, `idempotentHint`, `openWorldHint`); *resource* (`uri`, `name`, `mimeType`) and
*resource template* (`uriTemplate`); the methods `tools/list`, `tools/call`, `resources/read`;
`serverInfo`; *MCP client*, *MCP server*, *authorization server*, *protected resource metadata*,
*canonical server URI*. AWP adds: *access class*, *clearance*, *catalog profile*, *tool definition
digest*.

## Specification

### Changes to section 5.5.1 (MCP servers)

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `catalog` | object | no | Inline catalog (fields below), or `ref` (`name`, `version`, `digest`, all REQUIRED) to an `McpCatalog` manifest. |
| `auth` | object | no | Replaces the `v1alpha1` form. `method` is `secret` (default; `secretRef` as in `v1alpha1`) or `oauth` (below). |

`auth` with `method: oauth` (transport `streamable-http` only; MCP recommends environment
credentials for `stdio`):

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `grant` | string | yes | `client_credentials` (unattended runs) or `authorization_code` (consent given once per connection by an operator, PKCE with `S256` REQUIRED). |
| `resource` | string | no | Canonical server URI used as the RFC 8707 `resource` parameter. Default: `url`. MUST be `https`, without fragment. |
| `scopes` | list of string or `from-catalog` | no | Scopes to request. `from-catalog` (default) is the union of the `scopes` of the catalog tools that the workflow grants. |
| `clientRef` | object | no | `secretRef` to the client credentials (client secret or private key for `private_key_jwt`) when the client is pre-registered. |
| `issuer` | string | no | Expected issuer of the authorization server. When absent, it is discovered through protected resource metadata; when present, a discovered issuer that differs MUST be rejected. |

Rules for `oauth`:

1. The runtime acts as the MCP client and MUST follow the MCP authorization specification:
   discovery through protected resource metadata, the `resource` parameter in authorization and
   token requests, issuer validation of authorization responses (RFC 9207), tokens only in the
   `Authorization` header.
2. Tokens are obtained for the declared `resource` only. The runtime MUST NOT send a token issued
   for another resource to the server, and MUST NOT pass tokens it received from one MCP server to
   another server, a tool argument, a model or a command step ("no token passthrough").
3. Tokens and refresh tokens are secrets (spec 7.9): never in manifests, audit events or model
   context.
4. On `insufficient_scope` the call fails with reason `authorization`; a runtime MUST NOT widen the
   scopes beyond those the manifest declares or derives (`from-catalog`). Re-authorization with the
   declared scopes is allowed.

### New section 5.5.5: MCP catalog

A catalog has these fields:

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `server` | object | no | Expected `serverInfo`: `name`, `version`. Informative unless `matchServerInfo: true`. |
| `matchServerInfo` | boolean | no | When `true`, a server whose `serverInfo` differs MUST NOT be used. Default `false`. |
| `protocolVersion` | string | no | MCP protocol revision the catalog was reviewed against (for example `2026-07-28`). |
| `tools` | map | yes | MCP tool `name` -> tool entry (below). |
| `resources` | list | no | Resource entries (below). |
| `profiles` | map | no | Profile name (`^[a-z][a-z0-9-]{0,62}$`) -> list of tool names of this catalog. |

Tool entry:

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `access` | string | yes | `read` or `write`: the AWP access class, decided by the reviewer of the catalog. |
| `definitionDigest` | digest | cond. | Digest (spec 3.8) of the MCP tool definition (rule 4). REQUIRED under the `security` profile; RECOMMENDED otherwise. |
| `definition` | object | no | A copy of the reviewed MCP tool definition (`title`, `description`, `inputSchema`, `outputSchema`, `annotations`) for reviewers. If present, its digest MUST equal `definitionDigest`. |
| `classification` | string | no | Highest data class the tool may receive (spec 7.2). Default: no clearance above `public`. |
| `actions` | list | no | Well-known actions (spec 5.5.3) the tool performs, for example `external.communication`. |
| `scopes` | list of string | no | OAuth scopes the tool needs (input for `auth.scopes: from-catalog`). |

Resource entry: exactly one of `uri` or `uriTemplate` (RFC 6570, as in MCP resource templates),
plus `classification` (highest data class the content may have; the operation's data class is
raised to it when the resource is read) and an optional `name`.

Rules:

1. Every profile member MUST be a tool of the catalog. A profile named `read` MUST contain only
   `read` tools.
2. Each profile `<p>` of server `<s>` defines the action group `<s>.<p>` (spec 5.5.4); this is the
   publish-time enumeration of AEP-0002: the group lists exactly the catalogued tools. It MUST NOT
   collide with an action group declared in `spec.actionGroups`. Each `actions` entry adds the tool
   to the corresponding well-known action group.
3. A tool that the server returns from `tools/list` but the catalog does not list is not exposed to
   agents (fail closed); runtimes SHOULD report it as `uncatalogued`. A catalogued tool that the
   server does not return is unavailable; calls fail with reason `toolUnavailable`.
4. **Tool definition digest.** The digest is computed with AEP-0010 over the JSON object returned
   for the tool by `tools/list`, restricted to the members `name`, `title`, `description`,
   `inputSchema`, `outputSchema` and `annotations` (absent members stay absent; `_meta`, `icons`
   and members added by later MCP revisions are excluded until an AEP adds them). Before exposing a
   catalogued tool to an agent, the runtime MUST compute the digest of the definition the server
   returned in the current session and MUST NOT expose the tool if it differs from
   `definitionDigest`. After `notifications/tools/list_changed` the runtime re-lists and applies the
   same check; a changed definition is not exposed for the rest of the execution. Each mismatch
   emits `mcp.tool.changed`.
5. **Annotations are not authority.** MCP tool annotations MUST NOT change the access class,
   clearance or grants. Validators SHOULD warn (`catalog.annotation-conflict`) when a `read` tool's
   pinned `definition.annotations` has `readOnlyHint: false` or `destructiveHint: true`.
6. Before each `tools/call`, the runtime MUST deny the action (`policy.denied`, `tool.denied` with
   `reason: dataPolicy`) when the data classification of the operation ranks higher than the tool's
   `classification`.
7. Reading a resource (`resources/read`) is the action `<server>.resources.read` with the resource
   URI as its resource scope (spec 7.5.2); its access class is always `read`. When a catalog lists
   `resources`, a URI that matches no entry MUST be denied. A catalog tool named `resources.read`
   is rejected (`catalog.reserved-name`).
8. A catalog is identified by its digest (AEP-0010 over the inline catalog object or the
   `McpCatalog` manifest). The reproducibility record (spec 10.7) lists, per MCP server, the catalog
   digest and the digests of the tool definitions that were exposed.

### Changes to section 5.6.1

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `access` | string | no | `read-only` or `write` (default). In a `read-only` step every action MUST be an MCP tool with access class `read` in a catalog, or a resource read; any other action, including `shell.execute` and remote agent messages, MUST be denied. Validators MUST reject a `read-only` agent step whose agent is permitted a tool that is classified `write` or not catalogued, when this can be decided statically. |

### Changes to section 10.4

| Type | When | Required `data` |
| ---- | ---- | --------------- |
| `mcp.tool.changed` | A catalogued tool's definition digest differs from the catalog. | `server`, `tool`, `expectedDigest`, `observedDigest` |

The event carries digests only, never the definition text.

### New kind `McpCatalog`

`spec` contains the catalog fields of section 5.5.5. It is referenced from
`mcpServers[].catalog.ref` with exact version and digest (spec 9.1, AEP-0010). Like other
referenced manifests it is resolved by the runtime and never fetched from a URL found in the
catalog.

## Examples

```yaml
mcpServers:
  - name: tickets
    transport: streamable-http
    url: https://mcp.example.com/tickets
    auth:
      method: oauth
      grant: client_credentials
      clientRef: { secretRef: tickets-client }
      scopes: from-catalog
    catalog:
      protocolVersion: "2026-07-28"
      tools:
        get_ticket:
          access: read
          classification: confidential
          scopes: [tickets:read]
          definitionDigest: sha256:1111111111111111111111111111111111111111111111111111111111111111
        search:
          access: read
          classification: confidential
          scopes: [tickets:read]
          definitionDigest: sha256:2222222222222222222222222222222222222222222222222222222222222222
        add_comment:
          access: write
          classification: internal
          actions: [external.communication]
          scopes: [tickets:write]
          definitionDigest: sha256:3333333333333333333333333333333333333333333333333333333333333333
      resources:
        - uriTemplate: "tickets://{key}"
          classification: confidential
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
        tickets.read: { allow: true }   # action group from the catalog profile "read"
workflow:
  - id: research
    agent: researcher
    access: read-only
```

With `scopes: from-catalog`, this workflow requests only `tickets:read`, because it grants only the
`read` profile.

## Schema changes

- `McpServer.catalog`; `McpServer.auth` as a `oneOf` of `SecretAuth` and `OAuthAuth`;
  `$defs/McpCatalogSpec`, `$defs/McpToolEntry`, `$defs/McpResourceEntry`; root kind `McpCatalog`;
  step `access`.
- Semantic rules: `catalog.profile-unknown-tool`, `catalog.read-profile-write-tool`,
  `catalog.group-collision`, `catalog.reserved-name`, `catalog.definition-digest-mismatch`
  (inline `definition` against `definitionDigest`), `access.write-tool-granted`,
  `auth.oauth-transport` (`oauth` with `stdio`), `auth.resource-invalid`, warning
  `catalog.annotation-conflict`; `security.definition-digest-required` under the security profile.

## Conformance impact

- `mcp`: catalog validation, profile groups, definition digest check at session start and after
  `list_changed`, clearance check per call, resource reads, read-only enforcement, OAuth rules
  (audience-bound tokens, no passthrough, no scope widening).
- `audit`: `mcp.tool.changed`; catalog and definition digests in the reproducibility record.
- New cases: `valid/5.5.5-catalog.yaml`, `valid/5.5.1-auth-oauth.yaml`; invalid:
  `5.5.5-profile-unknown-tool.yaml`, `5.5.5-read-profile-with-write-tool.yaml`,
  `5.5.5-profile-group-collision.yaml`, `5.5.5-definition-digest-mismatch.yaml`,
  `5.5.1-oauth-on-stdio.yaml`, `5.5.1-oauth-resource-with-fragment.yaml`,
  `5.6.1-read-only-step-with-write-grant.yaml`. Test vector: the digest of a fixed MCP tool
  definition (computed with the reference checker when the AEP is accepted).
- Runtime tests, once a runtime suite exists: changed definition not exposed; uncatalogued tool not
  exposed; token audience; scope widening refused.

## Compatibility and migration

Additive for `catalog` and `access`. `auth` keeps the `v1alpha1` meaning when `method` is absent
(`secret`). Without `catalog` the `v1alpha1` behaviour holds (no definition pinning).

## Security considerations

- A catalog is a declaration by the integrator; AWP cannot prove a `read` tool has no side
  effects. Catalogs are reviewed like permissions; digests prevent silent changes of the catalog
  and of the server's tool definitions.
- Tool poisoning: descriptions and schemas are untrusted text. The pinned definition is what a
  reviewer approved; a different one is not exposed.
- Uncatalogued tools are not exposed (fail closed); `read-only` also excludes shell and remote
  agents.
- Authorization: audience-bound tokens, no passthrough, PKCE, issuer checks and scope minimisation
  follow MCP; scopes are derived from the granted tools so a read-only workflow cannot hold write
  scopes by accident. Confused-deputy risks of proxies are the runtime's responsibility (MCP
  security considerations).

## Privacy considerations

Per-tool and per-resource clearance keeps personal data away from tools not cleared for it (for
example external communication tools). Audit events carry digests, not definitions or content.

## Compliance note

AWP provides machine-readable governance primitives that can help organizations implement and
enforce their own compliance requirements. This proposal makes no compliance promise.

## Alternatives

- **Trust MCP tool annotations**: the MCP specification itself says they are untrusted unless the
  server is trusted; they are not a governance input.
- **Action groups only**: express sets, but not access classes, clearance or pinned definitions.
- **New profile `catalog`**: rejected by owner decision D9; the catalog only applies to MCP tool
  sources and belongs to `mcp`.
- **Own names instead of MCP terms** (for example `toolId`, `readOnly`): rejected by D9; using MCP's
  names keeps the mapping obvious and avoids a second vocabulary.

## Implementation status

OpenAgentix (in progress, not conformant) has connection-level tool access classes, named profiles
expanded at publish time, a read-only step check, and a proposed design for pinned tool snapshots
and OAuth 2.1 for MCP connections (its ADR 0016), in its own format. No implementation of this AEP
exists.

## Open questions

1. Should built-in tools (`shell`) get catalog entries too?
2. Should `profiles` be renamed (for example `toolSets`) to avoid confusion with conformance
   profiles? MCP has no term for tool sets.
3. MCP prompts: should a catalog list server prompts, and how do they relate to the `Prompt` kind
   (AEP-0005)?
4. Should the definition digest include `icons` (display only) or members added by later MCP
   revisions?

## Decision

Owner direction of 2026-10-10 (D8, D9): in `v1alpha2`, part of the `mcp` profile, aligned with MCP
terms, authorization (OAuth 2.1) and tool definition digests. Not accepted; needs the reviews listed
in the header.

## References

- Spec sections 5.5, 5.6, 7.2, 9.1, 10.4, 10.7.
- Model Context Protocol specification, revision 2026-07-28: Server features "Tools" and
  "Resources"; Basic "Authorization" and its security considerations (reference data only).
- OAuth 2.1 (draft-ietf-oauth-v2-1-13), RFC 6750, RFC 8414, RFC 8707, RFC 9207, RFC 9728, RFC 6570.
- AEP-0002 (action groups, publish-time enumeration), AEP-0010 (digests).
