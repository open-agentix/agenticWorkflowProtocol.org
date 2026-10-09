// Short snippets for the homepage governance grid. Each is an excerpt of a valid v1alpha1 manifest;
// the normative text is linked from every card.
export const cards = [
  {
    title: 'Identity & ownership', href: '/governance/identity-and-ownership/',
    text: 'Every workflow names the team accountable for it.',
    code: 'metadata:\n  name: invoice-processing\n  version: 1.2.0\n  owner:\n    team: finance-ai\n    contact: finance-ai@example.com',
  },
  {
    title: 'Data classification', href: '/governance/data-classification/',
    text: 'Inputs and outputs carry a class; external transfer can be denied.',
    code: 'dataPolicy:\n  classification: confidential\n  restrictions:\n    externalTransfer: deny',
  },
  {
    title: 'Data residency', href: '/governance/data-residency/',
    text: 'Restrict where data is processed and by which providers. Undeterminable regions fail closed.',
    code: 'dataPolicy:\n  residency:\n    allowed: [EU]\n  processing:\n    forbiddenProviders:\n      - public-cloud-us',
  },
  {
    title: 'Model governance', href: '/governance/model-governance/',
    text: 'Only approved providers and models, checked before the run starts.',
    code: 'modelPolicy:\n  allowedProviders: [azure-openai, ollama]\n  requirements:\n    approvalStatus: approved\n    encryption: true',
  },
  {
    title: 'Tool governance', href: '/governance/tool-governance/',
    text: 'Permissions per action, with default deny and network limits.',
    code: 'permissions:\n  default: deny\n  tools:\n    github.read:\n      allow: true\n    production.deploy:\n      allow: false',
  },
  {
    title: 'Budgets & resources', href: '/concepts/budgets/',
    text: 'Cost, steps, time, tokens, tool calls, retries and concurrency are bounded.',
    code: 'budget:\n  maxCostUsd: 5.00\n  maxSteps: 50\n  maxDuration: 30m\n  resources:\n    maxToolCalls: 100',
  },
  {
    title: 'Risk levels', href: '/governance/risk-levels/',
    text: 'A possible governance model, not a regulatory classification.',
    code: 'metadata:\n  risk:\n    level: high\n    category: [security, financial]',
  },
  {
    title: 'Environments', href: '/governance/environments/',
    text: 'The same workflow runs with different autonomy per environment.',
    code: 'environments:\n  development:\n    autonomy: unrestricted\n  production:\n    autonomy: approval-required',
  },
  {
    title: 'Separation of duties', href: '/governance/separation-of-duties/',
    text: 'Whoever initiates an action cannot approve it.',
    code: 'approval:\n  separationOfDuties:\n    enabled: true\n    rules:\n      - actorCannotApproveOwnAction: true',
  },
];
