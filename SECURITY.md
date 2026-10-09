# Security Policy

AWP is a specification. Security issues can nevertheless exist: in the specification itself (for
example semantics that make a policy bypass likely or unavoidable), in the JSON Schemas, in the
conformance tests, in tooling or in the website of this repository.

## Reporting a vulnerability

**Please do not open public issues for security problems.**

Report privately via GitHub private vulnerability reporting:
[Report a vulnerability](https://github.com/open-agentix/agenticWorkflowProtocol.org/security/advisories/new).

Include a description, the affected section, file or version, and the impact you expect. We
acknowledge reports within 3 working days and coordinate disclosure with you. We credit you in the
advisory unless you prefer otherwise.

## Scope

In scope:

- specification semantics that allow governance controls (tool permissions, approvals, budgets,
  data policies, separation of duties) to be bypassed by a conforming implementation,
- ambiguities that lead conforming implementations to fail open instead of closed,
- requirements that would force secrets or private data into manifests or audit events,
- schemas, conformance tests, tooling and website code in this repository.

Out of scope:

- vulnerabilities in a specific AWP implementation. Report them to that project; for the
  OpenAgentix reference implementation see
  [its security policy](https://github.com/open-agentix/open-agentix/security/policy).

## Supported versions

Until `v1`, only the latest draft API version of the specification receives fixes.
