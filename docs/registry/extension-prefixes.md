# Extension prefixes (informative list)

| | |
| --- | --- |
| **Status** | Informative. Not part of the specification and not a registry with legal or technical effect. |
| **Applies to** | Extension fields (`x-...`) in AWP manifests of every API version ([spec 3.3](../../spec/v1alpha1/README.md#33-unknown-fields-and-extensions)) |
| **Decided** | 2026-10-10 ([decision log D12](../alignment/decisions.md#d12-neutral-list-of-extension-prefixes)) |

AWP lets every implementation add **extension fields** whose names start with `x-`. Runtimes that
do not interpret an extension ignore it (spec 3.3), unless the manifest lists it in
`metadata.requiredExtensions` (proposed by [AEP-0011](../../aep/0011-required-extensions.md)).
When two implementations pick the same name for different things, manifests become ambiguous. This
page is a neutral, informative list that helps implementations pick prefixes that do not collide.

It is open to every implementation, on equal terms. Being listed says nothing about the quality,
conformance or endorsement of an implementation, and an unlisted prefix is not invalid.

## 1. Conventions

1. An implementation uses one prefix of the form `x-<prefix>-`, where `<prefix>` is lowercase
   letters and digits (`^[a-z][a-z0-9]{1,31}$`), usually the implementation or organisation name.
   Field names continue in lowerCamelCase: `x-<prefix>-<name>`.
2. Short generic prefixes (`x-ai-`, `x-agent-`, `x-mcp-`, `x-awp-`) are not listed for anyone.
   `x-awp-` is reserved for the AWP project itself (for example for experiments in conformance
   material) and `x-example-` for examples in the specification and AEPs. `x-mcp-` is avoided
   because the MCP specification uses names of that form (for example `x-mcp-header` inside tool
   input schemas).
3. Extension fields MUST NOT weaken any requirement of the specification (spec 3.3). An extension
   that restricts behaviour should be listed in `metadata.requiredExtensions` once AEP-0011 is
   part of the API version in use, and should get a planned successor in core through an AEP.
4. Extension values are covered by the manifest digest ([AEP-0010](../../aep/0010-digest-canonicalization.md)).
5. Implementations document their fields in their own repositories. This page links to that
   documentation; it does not copy it.

## 2. Listed prefixes

| Prefix | Implementation | Documentation of the fields | Listed |
| --- | --- | --- | --- |
| `x-openagentix-` | [OpenAgentix](https://github.com/open-agentix/open-agentix) | Alignment description: [x-openagentix-extensions.md](../alignment/x-openagentix-extensions.md) (to move to the OpenAgentix repository with its extension schema) | 2026-10-10 |

Reserved (not for implementations): `x-awp-`, `x-example-`.

## 3. How to add a prefix

Open a pull request that adds one row to the table in section 2 with:

- the prefix, following section 1;
- the implementation name and a public link to it;
- a public link to the documentation of the extension fields (it may say "none yet");
- the date.

A maintainer checks only that the prefix follows section 1 and does not collide with a listed or
reserved prefix (editorial change, one approval, [GOVERNANCE.md](../../GOVERNANCE.md#decision-process)).
Maintainers who work on the implementation that requests the prefix do not approve its row.
A prefix is removed when the implementation asks for it or its links have been unreachable for 90
days after a reminder in an issue.

## 4. Compliance note

AWP provides machine-readable governance primitives that can help organizations implement and
enforce their own compliance requirements. Compliance depends on the implementation,
organizational controls and applicable regulatory requirements.
