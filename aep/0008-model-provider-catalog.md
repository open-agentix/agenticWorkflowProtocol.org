# AEP-0008: Model and provider catalog as policy input

| | |
| --- | --- |
| **AEP** | 0008 |
| **Title** | Model and provider catalog as policy input |
| **Authors** | @agentix-zero |
| **Shepherd** | Project lead (proposed; not an author, [aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)) |
| **Type** | Specification |
| **Status** | Review (proposed for `v1alpha3`; not accepted) |
| **Reviewer roles needed** | runtime implementer, security reviewer. None identified yet; an external review is required before `Accepted` ([aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)). |
| **Owner decisions** | [D10](../docs/alignment/decisions.md#d10-model-catalog-prices-in-an-own-kind-referenced-by-digest) (2026-10-10) |
| **Target API version** | `v1alpha3` |
| **Profiles affected** | `governance`, `audit` |
| **Created** | 2026-10-09 |
| **Discussion** | issue to be opened |
| **Supersedes** | - |
| **Superseded-by** | - |

## Summary

Define a kind `ModelCatalog` that lists allowed providers and models with region, prices,
governance status and optional aliases, referenced from a workflow (`spec.modelPolicy.catalog`) by
name, version and a required digest. The catalog becomes an input of model policy, data residency and budget
checks; it replaces per-runtime lookup tables that differ between runtimes.

## Motivation

Spec 5.4.3 says provider identifiers are opaque and region and cost are runtime knowledge. The
consequences:

- `modelPolicy.allowedProviders` and data residency rules depend on how each runtime maps a
  provider name to an endpoint and region; the same manifest can be allowed on one runtime and
  denied on another.
- Spec 5.7 requires documented cost computation, but the price used is invisible to reviewers, so
  `maxCostUsd` means different things on different runtimes.
- Platforms with tenant-specific provider connections (for example several Azure deployments) need
  a stable identifier for policies.

## Goals and non-goals

- Goals: a reviewable, versioned list of providers and models with the facts governance needs;
  stable provider identifiers; prices as declared inputs for budget checks.
- Non-goals: endpoints, credentials or connection details (runtime configuration), live price
  feeds, model benchmarks.

## Specification

### New kind `ModelCatalog`

| `spec` field | Type | Req. | Description |
| ------------ | ---- | ---- | ----------- |
| `providers` | list | yes | Entries below. |
| `currency` | string | no | ISO 4217 code of all prices. Default `USD`. |
| `effective` | date | no | Date from which prices apply. |

Provider entry:

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `id` | string | yes | Stable provider identifier used in `model.provider`, `modelPolicy` and `dataPolicy.processing` (section 3.4 name). |
| `region` | string | no | Region where this provider processes data. |
| `aliases` | list of string | no | Other identifiers that resolve to this entry (for example tenant connection names). |
| `models` | list | yes | Model entries below. |

Model entry:

| Field | Type | Req. | Description |
| ----- | ---- | ---- | ----------- |
| `name` | string | yes | Model name as used in `model.name`. |
| `versions` | list of string | no | Allowed exact versions. |
| `region` | string | no | Overrides the provider region. |
| `price` | object | no | `inputPerMTok`, `outputPerMTok`, `cacheReadPerMTok`, `cacheWritePerMTok` (numbers, per million tokens). |
| `approval`, `riskClassification`, `evaluation`, `allowedUseCases` | | no | As in the model object (spec 5.4.3). |
| `contextTokens`, `maxOutputTokens` | integer | no | Informative limits. |

### Changes to section 7.4

| Field | Type | Description |
| ----- | ---- | ----------- |
| `catalog` | object | `name`, `version` (exact) and `digest` (REQUIRED, spec 3.8, AEP-0010) of a `ModelCatalog`. |

The runtime MUST resolve the catalog by name and version and MUST verify its digest; on a mismatch
or when the catalog cannot be resolved, the execution MUST NOT start. Prices, regions and approvals
therefore always come from exactly the catalog the workflow was reviewed with.

Rules when `modelPolicy.catalog` is set:

1. Every agent's `model.provider` MUST resolve to a catalog provider (by `id` or `aliases`) and
   `model.name` to a model of it; otherwise the execution MUST NOT start.
2. The catalog's governance fields are authoritative over the declarations in the manifest's model
   objects (spec 5.4.3 already allows a model inventory to replace them).
3. The region for residency checks (spec 7.3) is the model's or provider's `region` in the catalog;
   if absent, the region cannot be determined (fail closed when `residency.allowed` is set).
4. Budget checks MUST use the catalog `price` when present. The reproducibility record and
   `workflow.completed` usage name the catalog (name, version, digest) used for cost.
5. Runtime fallbacks (spec 7.4) MUST resolve to catalog entries as well.

## Examples

```yaml
apiVersion: awp.agenticworkflowprotocol.org/v1alpha3
kind: ModelCatalog
metadata:
  name: eu-models
  version: 2026.10.0
  owner:
    team: platform-governance
spec:
  currency: USD
  effective: "2026-10-01"
  providers:
    - id: example-cloud-eu
      region: EU
      aliases: [team-a-azure, team-b-azure]
      models:
        - name: example-large
          versions: ["2026-08"]
          price: { inputPerMTok: 3.0, outputPerMTok: 15.0 }
          approval: { status: approved, expires: "2027-06-30" }
    - id: on-prem
      region: on-premise
      models:
        - name: example-local
          price: { inputPerMTok: 0, outputPerMTok: 0 }
```

```yaml
modelPolicy:
  catalog:
    name: eu-models
    version: 2026.10.0
    digest: sha256:0000000000000000000000000000000000000000000000000000000000000000
  requirements:
    approvalStatus: approved
dataPolicy:
  residency:
    allowed: [EU, on-premise]
```

## Schema changes

- Root kind `ModelCatalog`; `$defs/ModelCatalogSpec`; `ModelPolicy.catalog`.
- Semantic rules: `catalog.duplicate-provider`, `catalog.alias-collision`, `catalog.duplicate-model`,
  `price.negative`.

## Conformance impact

- `governance`: catalog resolution, authoritative fields, region and price use.
- `audit`: catalog identity in usage data and the reproducibility record.
- New cases: `valid/7.4-model-catalog.yaml`, `valid/7.4-model-policy-catalog-ref.yaml`; invalid:
  `7.4-catalog-alias-collision.yaml`, `7.4-catalog-negative-price.yaml`.

## Compatibility and migration

Additive. Without `catalog` the `v1alpha1` behaviour holds. Runtimes with their own price tables
can export them as catalogs.

## Security considerations

- A catalog controls what is allowed; it is a governed dependency (version, digest, owner).
- Aliases must not collide, otherwise a tenant connection could be mapped to the wrong provider.
- Prices from public sources are data, not instructions; catalogs are updated by reviewed changes,
  never fetched at run time.

## Privacy considerations

None beyond the residency rules it feeds.

## Compliance note

AWP provides machine-readable governance primitives that can help organizations implement and
enforce their own compliance requirements. This proposal makes no compliance promise.

## Alternatives

- **Prices inline in every model object**: duplicated and stale quickly.
- **Runtime-only catalogs**: keeps the status quo of non-portable decisions (rejected by owner
  decision D10).
- **A registry of well-known provider identifiers maintained by AWP**: useful as informative
  guidance, but cannot cover tenant-specific deployments; could complement this AEP.

## Implementation status

OpenAgentix (in progress, not conformant) uses a pinned, vendored snapshot of a public model
catalog plus overrides for prices, and tenant-scoped provider connections, in its own format. No
implementation of this AEP exists.

## Open questions

1. CalVer versions (`2026.10.0`) are valid SemVer; should catalogs recommend them?
2. Should price units include per-request or per-image prices?

## Decision

Owner direction of 2026-10-10 (D10): prices live in an own kind `ModelCatalog` that workflows reference by digest (the digest is therefore REQUIRED). Not in the `v1alpha2` scope of D8; target `v1alpha3` ([conflict C3](../docs/alignment/decisions.md#c3-d10-and-d11-decide-details-but-not-the-target-version)). Not accepted; needs the reviews listed in the header ([aep-process 5.1](../docs/aep-process.md#51-review-before-acceptance)).

## References

- Spec sections 5.4.3, 5.7, 7.3, 7.4, 10.7.
- ISO 4217.
