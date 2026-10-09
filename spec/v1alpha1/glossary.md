# AWP v1alpha1 glossary

Status: draft / alpha, non-normative. Normative definitions are in the
[specification](README.md); this glossary summarizes them.

| Term | Definition |
| ---- | ---------- |
| **A2A** | Agent2Agent protocol for communication between agents. AWP references A2A endpoints as remote agents. |
| **Action** | An operation with an effect outside the model: a tool call, a command step or a message to a remote agent. Model invocations are not actions. |
| **Action group** | A named set of action identifiers declared in `spec.actionGroups`, usable wherever an action identifier is accepted. |
| **Action identifier** | Dotted name of an action, for example `github.search_code`, `shell.execute`, `a2a.security-agent.send`. |
| **Actor** | Who performs or triggers something in an execution: `agent`, `human`, `runtime` or `system`. |
| **Agent** | A configured use of a model with instructions, tools, permissions and limits. Also the kind `Agent` for reusable agent definitions. |
| **Agent reference** | An entry in `spec.agents` that points to a published `Agent` manifest by name, exact version and optional digest. |
| **Approval** | A decision by an authenticated human that allows a gated action or approval step to proceed. |
| **Audit event** | A structured record of something that happened in an execution, with a standard envelope and type (`workflow.*`, `agent.*`, `tool.*`, `policy.*`, `approval.*`, `artifact.*`). |
| **Budget** | Limits on cost, steps, duration, tokens, tool calls, retries and concurrency. |
| **Conformance profile** | A named set of requirements a runtime can implement: `core`, `governance`, `audit`, `security`, `mcp`, `a2a`. |
| **Conformance statement** | A document published by a runtime declaring the API version and profiles it conforms to and its limitations. |
| **Data class** | One of `public`, `internal`, `confidential`, `personal`, `restricted`, `sensitive`, `secret`; an organizational vocabulary, not a legal definition. |
| **Declassification** | Declaring an output with a lower data class than the data it was derived from; always recorded. |
| **Decision record** | A structured explanation of a consequential action in terms of evidence and policy checks. Not chain-of-thought. |
| **Digest** | `<algorithm>:<hex>` hash, for manifests computed over the JCS serialization without integrity, signature and provenance fields. |
| **Environment** | The organizational context of an execution (for example `development`, `staging`, `production`) with its own autonomy level. |
| **Execution** | One run of a workflow, identified by an execution identifier (`awp-exec-<ULID>`). |
| **Expression** | `${{ ... }}` reference to an input, a step output or execution facts in expression-enabled fields. |
| **Fail closed** | Rejecting or denying when something cannot be verified or determined, instead of proceeding. |
| **Kind** | The type of a manifest: `Workflow`, `Agent` or `Policy`. |
| **Manifest** | An AWP document with `apiVersion`, `kind`, `metadata` and `spec`. |
| **MCP** | Model Context Protocol for connecting agents to tools and resources. AWP references MCP servers as tool sources. |
| **Permissions** | The `permissions` object that grants or denies actions and restricts network, filesystem, secrets and environments. Permissions grant; policies only restrict. |
| **Policy** | A rule set that denies operations or requires approval under conditions. Also the kind `Policy`. |
| **Policy shorthand** | Well-known policy settings in `spec.policies` (`git`, `pullRequest`, `merge`, `production`) that expand to deny rules. |
| **Remote agent** | An agent run by another system and reached through A2A. |
| **Reproducibility record** | A record produced at the end of an execution that identifies the workflow, agents, models, prompts, tools, images, policies, inputs and artifacts it used. |
| **Risk level** | `low`, `medium`, `high` or `critical`: an organizational risk declaration with recommended default treatments. |
| **Runtime** | Software that validates and executes manifests and enforces their rules. |
| **Secret reference** | `secretRef: <name>`: a pointer to a secret declared in `spec.secrets`. Secret values never appear in manifests. |
| **Separation of duties** | Rules that prevent the same human from both initiating or performing and approving an action. |
| **Step** | A node of the workflow graph: `agent`, `command` or `approval`. |
| **Tool source** | An entry in an agent's `tools`: an MCP server (`type: mcp`) or a runtime built-in (`type: builtin`). |
| **Well-known action** | Reserved action identifiers with defined meaning, for example `git.merge`, `production.deploy`, `external.communication`. |
| **Workflow** | The kind `Workflow`: agents, tools, steps, limits and governance of a unit of agentic work. |
