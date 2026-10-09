# Website plan: agenticworkflowprotocol.org

Status: draft. This document defines the information architecture, the homepage structure, the
tone and the technology of the AWP website. It is the input for the site implementation and the
GitHub Pages deployment (separate pull requests).

## 1. Goals and audience

The site positions AWP as an **open, declarative standard** for defining, governing, executing and
auditing agentic workflows. It must be credible for:

- **Enterprise architects**: what does AWP cover, how does it fit next to MCP and A2A, is it
  vendor-neutral?
- **Security engineers**: which controls can be expressed, what does a runtime have to enforce,
  what is audited, where are the trust boundaries?
- **Open-source developers and implementers**: where is the normative text, the schema, the
  conformance profiles, how do I build my own runtime?

Reference points for tone and depth (not for visual design): Kubernetes, OpenTelemetry, Terraform,
MCP (modelcontextprotocol.io), A2A. Like modelcontextprotocol.io the site combines specification,
concept documentation and examples in one place.

Central messages, in this order of importance:

1. **MCP connects agents to tools. A2A connects agents to agents. AWP defines how agents work.**
   Sub-line: *A declarative, portable and policy-aware standard for agentic workflows.*
2. **AWP is a specification, not a platform. OpenAgentix is one implementation.**
3. **Agents need contracts. Workflows need boundaries. Execution needs auditability. AWP defines
   the contract.**

## 2. Content rules

These rules apply to every page and are checked in review.

- **Specification status is always visible**: a banner "Draft - `v1alpha1`. Fields and semantics
  may change." on all specification and concept pages until `v1beta1`.
- **No compliance claims.** Never "AWP is GDPR compliant" or "AWP makes your AI EU AI Act
  compliant". Use: *"AWP provides machine-readable governance primitives that can help
  organizations implement and enforce their own compliance requirements."* and *"Compliance
  depends on the implementation, organizational controls and applicable regulatory
  requirements."* Every governance-related page carries this note.
- **No claims of third-party support.** The implementations page lists only OpenAgentix
  (reference implementation, in progress) plus a call for implementations, until another project
  states its support publicly.
- **No marketing superlatives** ("the future of AI is here", "revolutionary"). Technical,
  confident, short sentences.
- **No chain-of-thought promises.** AWP standardizes events, inputs, outputs, decisions and policy
  results, not private model reasoning.
- **Code is the main visual language.** Every concept page leads with a YAML snippet that is valid
  against the current specification. Snippets are imported from `spec/` example files where
  possible, so the site and the specification cannot drift apart.
- **Risk levels are presented as a possible governance model**, not as a regulatory
  classification.
- **No personal data.** Contact: info@openagentix.si; questions via GitHub Discussions; security
  reports via GitHub private vulnerability reporting.
- The OpenAgentix tagline ("SuperIntelligence") does not appear on this site.

## 3. Navigation

Top navigation, left to right:

| Item | Target | Content |
| ---- | ------ | ------- |
| **AWP** (logo/wordmark) | `/` | Homepage |
| **Specification** | `/specification/` | Normative text `v1alpha1`, versions, changelog of the spec |
| **Concepts** | `/concepts/` | Manifest, kinds, agents, tools, workflow steps, triggers, inputs, budgets, execution model |
| **Governance** | `/governance/` | Identity & ownership, data classification, data residency, model governance, tool governance, human approval, risk levels, separation of duties, environments, policy-as-code |
| **Security** | `/security/` | Secrets, supply chain (digests, signatures, provenance), tamper-evident audit, threat model, fail-closed semantics |
| **Integrations** | `/integrations/` | MCP, A2A, OpenTelemetry mapping (later), policy engines (later) |
| **Examples** | `/examples/` | Annotated manifests (vulnerability fixer, invoice processing, data-residency policy, approval flow) |
| **Implementations** | `/implementations/` | OpenAgentix (reference implementation, in progress), call for implementations, conformance profiles, "Build your own AWP runtime" |
| **GitHub** | external link to the repository | Icon plus label, `rel="noopener"` |

Secondary elements: version switcher (`v1alpha1` only for now), theme toggle (light/dark/system),
language switcher (EN only at launch; DE added later), search (local, see section 6).

Footer: License (CC BY 4.0 for text, Apache-2.0 for code), Code of Conduct, Governance, Security
policy, Contributing, Changelog, contact info@openagentix.si, "AWP is a specification, not a
platform. OpenAgentix is one implementation."

## 4. Page tree

```
/
/specification/
  /specification/v1alpha1/            normative text (from spec/v1alpha1/)
  /specification/v1alpha1/glossary/
  /specification/versioning/
  /specification/changelog/
/concepts/
  /concepts/overview/                 what AWP is and is not
  /concepts/manifest/                 apiVersion, kind, metadata, spec
  /concepts/agents-and-tools/
  /concepts/workflow/                 steps, dependsOn, command steps, execution model
  /concepts/triggers-and-inputs/
  /concepts/budgets/
  /concepts/audit-events/
  /concepts/reproducibility/
  /concepts/decision-trace/
/governance/
  /governance/identity-and-ownership/
  /governance/data-classification/
  /governance/data-residency/
  /governance/model-governance/
  /governance/tool-governance/
  /governance/human-approval/
  /governance/risk-levels/
  /governance/separation-of-duties/
  /governance/environments/
  /governance/policy-as-code/
/security/
  /security/secrets/
  /security/supply-chain/
  /security/tamper-evident-audit/
  /security/threat-model/
/integrations/
  /integrations/mcp/
  /integrations/a2a/
/examples/
  /examples/vulnerability-fixer/
  /examples/invoice-processing/
  /examples/eu-data-residency/
  /examples/approval-flow/
/implementations/
  /implementations/conformance/
  /implementations/build-your-own-runtime/
/tooling/                             CLI concept: awp validate/lint/simulate/plan/run/audit (spec of output formats, AWP-04)
/community/                           contributing, governance, AEP process (AWP-09)
```

## 5. Homepage (14 sections)

Each section has one job, one headline, at most three sentences of copy and, where useful, one
code block or diagram. Code blocks use the specification examples. Diagrams are inline SVG with an
ASCII fallback in `<pre>` (readable without CSS, screen-reader friendly via `aria-label` /
`<figcaption>`).

### 1. Hero

- Eyebrow: `Agentic Workflow Protocol · v1alpha1 (draft)`
- Headline: **Define. Govern. Execute.**
- Sub-line: *AWP is an open standard for portable, auditable and policy-controlled agentic
  workflows.*
- Primary CTA: "Read the specification" (`/specification/v1alpha1/`). Secondary CTA: "View on
  GitHub".
- Right column (desktop) / below (mobile): a short manifest (about 25 lines), syntax-highlighted
  at build time, with a copy button.
- No illustrations, no glow effects.

### 2. What is AWP?

- Headline: **The declarative standard for agentic workflows.**
- Copy: AWP describes what an agentic workflow does, within which limits it may run, under which
  governance it runs and what it leaves behind. Agents are not plain LLM calls; they are
  controlled workflows with defined capabilities, limits and responsibilities.
- Four short columns: *Define* (agents, tools, steps), *Govern* (policies, approvals, budgets),
  *Execute* (portable across runtimes), *Audit* (standard events, decision traces).

### 3. MCP vs A2A vs AWP

- Headline: **MCP connects agents to tools. A2A connects agents to agents. AWP defines how agents
  work.**
- Three-column comparison table: scope, typical question answered, example artifact.
  - MCP: agents ↔ tools/resources; "How does an agent call this tool?"
  - A2A: agent ↔ agent; "How do two agents talk to each other?"
  - AWP: workflow definition, governance, execution, audit; "What may this workflow do, who owns
    it and what happened?"
- Note: AWP does not replace MCP or A2A; it references them.

### 4. Example manifest

- Headline: **One file describes the workflow, its limits and its rules.**
- The full `vulnerability-fixer` example from the specification, with numbered callouts:
  metadata/ownership, budget, agents and MCP tools, workflow steps with `dependsOn`, policies.
- Link: "Annotated walkthrough" (`/examples/vulnerability-fixer/`).

### 5. Governance by Design

- Headline: **Agentic systems need more than intelligence. They need boundaries.**
- Grid of cards (each: title, one sentence, 3-6 line YAML snippet, link to the governance page):
  identity & ownership, data classification, data residency, model governance, tool governance,
  budgets & resources, risk levels, environments, separation of duties.
- Mandatory note below the grid: *AWP provides machine-readable governance primitives that can
  help organizations implement and enforce their own compliance requirements. Compliance depends
  on the implementation, organizational controls and applicable regulatory requirements.*

### 6. Security

- Headline: **Trusted agent supply chain. Know what runs before you let it run.**
- Three items: secrets only by reference (`secretRef`, never inline tokens); integrity (digests,
  signatures, provenance, trusted registries, dependency declarations); fail-closed semantics
  (unknown fields in governance sections and unevaluable policies deny).

### 7. Auditability

- Headline: **Execution needs auditability.**
- Left: the execution trace example (execution ID, workflow, steps, result). Right: the event
  families `workflow.*`, `agent.*`, `tool.*`, `policy.*`, `approval.*`, `artifact.*`.
- One line on tamper evidence: *AWP defines the semantics of audit events; implementations may
  provide tamper-evident storage.*
- One line on reproducibility and decision traces (no chain-of-thought).

### 8. Human-in-the-Loop

- Headline: **Some actions need a human decision.**
- Diagram: Agent → Analyze → Implement → Test → Human Approval (Security Review, Policy Check) →
  Deploy, as inline SVG plus ASCII fallback.
- Snippet: `approval.requiredFor`, `approvers`, `timeout`, separation of duties.

### 9. Policy-as-Code

- Headline: **Policy-as-Code for agentic systems.**
- Two snippets side by side: `no-production-autonomy` (require approval) and `eu-data-residency`
  (deny personal data outside the EU).
- Copy: policies are declarative, evaluated by the runtime before an action, and every evaluation
  produces a `policy.evaluated` event.

### 10. MCP/A2A integration

- Headline: **Built on an open agentic stack.**
- Layer diagram: AWP (agentic workflows) on top, A2A (agent communication) and MCP (tools & data)
  below.
- Two snippets: `tools: - type: mcp` and `agents: - protocol: a2a`.

### 11. Simulation / Validation

- Headline: **Know the plan before it runs.**
- Terminal block with `awp validate`, `awp lint`, `awp simulate`, `awp plan`, `awp run`,
  `awp audit` and the example output of `awp plan` (agents, tools, policies, approvals, maximum
  steps/cost/duration).
- Note: the CLI is a specified interface (output formats), not a product; any implementation may
  provide it.

### 12. Conformance

- Headline: **Build your own AWP runtime.**
- Profiles as a list: core, governance, audit, security, mcp, a2a, each with one sentence.
- Snippet: the `conformance` declaration of an implementation.
- Copy: AWP is not tied to OpenAgentix. Conformance tests will be public.

### 13. Open Source

- Headline: **AWP is an open specification.**
- Flow: Specification → Open Governance → Reference Implementation → Conformance Tests →
  Ecosystem.
- Implementations: OpenAgentix (reference implementation, in progress). "Call for
  implementations" with a link to the implementation listing issue template.
- Licenses: specification text CC BY 4.0, code and schemas Apache-2.0.
- Closing statement: **AWP is a specification, not a platform. OpenAgentix is one
  implementation.**

### 14. GitHub CTA

- Headline: **Help define the contract.**
- Buttons: "Read the specification", "Open an issue", "Join the discussion" (GitHub Discussions).
- Small print: contact info@openagentix.si.

The technical vision diagram from the brief (AWP on top of several runtimes - OpenAgentix,
Kubernetes-based, custom - which use A2A and MCP) is placed on `/concepts/overview/` and at the
end of section 13 as a compact version. The runtime boxes are labelled as **examples of possible
runtimes**, not as existing implementations.

## 6. Technology choice

### Requirements

- Static output, deployable to GitHub Pages with GitHub-hosted runners.
- Markdown/MDX as source, so the normative text in `spec/` is rendered directly and not copied.
- **No external requests at runtime**: self-hosted fonts, no CDN scripts, no analytics, no
  third-party embeds, local search index.
- Accessibility (WCAG 2.2 AA target): semantic HTML, skip link, visible focus, keyboard
  navigation, contrast in both themes, reduced motion.
- Dark and light theme with system preference and a manual toggle.
- i18n: English first; German added later as a separate locale without restructuring.
- Versioned documentation (`v1alpha1`, later `v1alpha2`, `v1beta1`).
- Small dependency surface, pinned versions, lockfile checked in.

### Options

| Criterion | Astro Starlight | Docusaurus |
| --------- | --------------- | ---------- |
| JavaScript shipped by default | minimal (islands; zero JS for content pages) | React runtime on every page |
| Search without external service | Pagefind built in (static index) | needs a plugin (local search plugin) or Algolia (external) |
| i18n | built in (locales, fallback, RTL) | built in |
| Doc versioning | via directory structure / plugin, manual | built in (`docs:version`) |
| Dark/light theme | built in | built in |
| Accessibility defaults | strong (skip link, landmarks, focus) | good |
| Custom homepage with code and diagrams | Astro pages/components, any framework or none | React pages |
| Fonts/assets self-hosted | yes | yes |
| Dependency footprint | smaller | larger (React, webpack/rspack) |

### Recommendation: Astro Starlight

- Content pages ship **without client-side JavaScript**, which fits the "no external requests,
  fast, accessible" requirements and keeps the attack surface small.
- **Pagefind** produces a static search index at build time; no search service is called at
  runtime.
- Built-in i18n, dark/light theme and accessible defaults cover the non-functional requirements
  without extra plugins.
- The homepage can be a custom Astro page with server-rendered syntax highlighting (Expressive
  Code/Shiki at build time) and inline SVG diagrams, independent of the docs layout.
- Same approach as the MCP documentation, which is a stated inspiration for the site.

Trade-off: Docusaurus has first-class doc versioning. For AWP this matters less at the start
(one API version); versions are modelled as directories (`/specification/v1alpha1/`). If several
API versions need to be maintained in parallel later, this decision can be revisited.

### Build and deployment (planned, separate PR)

- GitHub Actions on GitHub-hosted runners: install with lockfile, build, link check, YAML
  validation of all examples (against the JSON Schema once available), deploy to GitHub Pages.
- Custom domain `agenticworkflowprotocol.org` via the `CNAME` file; HTTPS enforced.
- HTTP caching is controlled by GitHub Pages (no custom headers possible).

## 7. Visual design

- Very technical, open-source feel; clear typography; monospace for code.
- Dark background optional (dark theme is a first-class theme, light is the default for print
  and readability, system preference wins).
- No stock photos, no robot imagery, no AI glow effects or gradients.
- Architecture diagrams as inline SVG using currentColor and theme tokens.
- YAML/JSON as the central visual element; code blocks are full-contrast and copyable.
- Inspiration from Kubernetes, OpenTelemetry, Terraform, MCP and A2A without copying their
  design.

## 8. Open points

- German translation: scope (all pages or homepage plus concepts first) and timing.
- Whether `/tooling/` is part of the first release or follows with the JSON Schema (AWP-04).
- Logo/wordmark: a simple typographic wordmark is assumed; no logo design exists yet.
