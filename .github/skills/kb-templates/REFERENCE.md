# kb-templates Reference

## KB Entry Format
| Field | Content |
|-------|---------|
| Title | descriptive name |
| Tags | domain tags for retrieval |
| Class | K=verified · I=derived · S=hypothesis |
| Priority | H/M/L |
| Date | ISO-8601 + method(observed\|inferred\|reported) |
| Source | origin reference |
| Context | when/why this knowledge matters |
| Knowledge | the actual insight or fact |
| Application | how to use it |
| Invalidation | conditions that make this stale |

## ADR Format
| Field | Content |
|-------|---------|
| ID | ADR-NNN:Title |
| Date | ISO-8601 |
| Status | Proposed\|Accepted\|Deprecated |
| Context | what forces are at play |
| Options | N≥2 alternatives with ± |
| Decision | which option and why |
| Consequences | what follows from this decision |
| Trigger | conditions to revisit this decision |

## Playbook Format
| Field | Content |
|-------|---------|
| Scenario | what situation this addresses |
| Triggers | how to recognize this scenario |
| Outcomes | expected results when resolved |
| Diagnosis | investigation steps |
| Resolution | fix/mitigation steps |
| Verification | how to confirm resolution |
| Failures | known failure modes of this playbook |

