# SDI Director of Information Security – Mock Paper Test (Sample Answers)

## Prompt 1: 30/60/90 Day Plan

### 0–30 Days: Baseline and Risk Focus
- Establish OT/IT asset visibility and criticality mapping across mills, rolling/coating lines, recycling, and fabrication sites; identify crown-jewel systems and single points of failure.
- Review existing NIST-aligned policies, incident response, BC/DR, and training programs; validate current reporting cadence to the Board/Audit Committee.[1]
- Meet plant leaders and operations to map maintenance windows, acceptable change windows, and safety constraints.
- Deliver a top-5 production-impacting risk list with initial mitigation options, costs, and downtime risk estimates.

### 31–60 Days: Quick Wins and Governance
- Implement priority controls where risk is highest: segmentation of OT networks, privileged access hardening, and secure remote access for vendors.
- Launch a critical vendor/third-party risk triage process; focus on OT suppliers and maintenance partners.
- Stand up a monthly risk dashboard tied to business impact (downtime exposure, safety, revenue risk) and share with CFO and Audit Committee.

### 61–90 Days: Operationalization and Roadmap
- Run an OT incident tabletop focused on line disruption and recovery; update playbooks based on findings.
- Finalize a 12-month roadmap with budget, ROI, and measurable outcomes (asset coverage, MFA coverage, IR readiness).
- Formalize a risk acceptance and escalation process aligned to enterprise risk management and Audit Committee visibility.[1]

## Prompt 2: Incident Scenario (Malware Impacting Flat Roll Line)

### Immediate Response (First 0–4 Hours)
- Activate incident response; isolate affected segment while preserving safety and production-critical control systems.
- Coordinate with plant leadership on safe-mode operations and production priorities.
- Preserve logs and system state; engage OT engineers to validate control integrity.

### Containment and Recovery (First 4–48 Hours)
- Identify root cause (remote access, vendor tooling, endpoint infection, or lateral movement).
- Restore from known-good baselines; validate interlocks and safety systems before full ramp-up.
- Monitor for recurrence and confirm clean network segmentation boundaries.

### Communication and Reporting
- Provide hourly operational updates to plant leadership and COO; daily summary to CFO.
- Escalate to Audit Committee if materiality thresholds are met or if production impact is significant.
- Document timeline, decisions, and containment actions for regulatory and insurance requirements.

### Post-Incident Improvements
- Close root-cause gaps (access controls, segmentation, detection).
- Update playbooks and training; conduct a follow-up tabletop with lessons learned.

## Prompt 3: Board/Audit Committee Reporting

### Quarterly Cyber Risk Dashboard
- Top 3–5 risks linked to business impact (production downtime, safety, revenue).
- Trend metrics:
  - OT asset visibility coverage (% of critical OT assets monitored).
  - Segmentation coverage for high-risk network zones.
  - MFA and privileged access coverage.
  - Third-party risk ratings for critical vendors.
  - IR readiness: tabletop frequency, RTO/MTTR estimates.
- Exceptions and risk acceptances with rationale and expiration dates.
- Funding priorities and expected risk-reduction outcomes.

## Prompt 4: Third-Party Risk (OT Vendors)
- Tier vendors by production impact (Tier 1: line-critical, Tier 2: supporting, Tier 3: non-critical).
- Enforce secure remote access (MFA, just-in-time access, session recording).
- Require incident notification SLAs, patch timelines, and security attestations for Tier 1 vendors.
- Validate with periodic assessments and targeted audits without disrupting production.

## Prompt 5: OT/IT Convergence Strategy
- Shared governance with Operations; co-owned risk register and change management.
- Phased segmentation and monitoring aligned to planned outages.
- OT-specific incident response and recovery playbooks that prioritize safety and uptime.
- Continuous training for plant teams with practical, scenario-based drills.

## Sources
1. SDI FY2024 Form 10-K (SEC): https://www.sec.gov/Archives/edgar/data/1022671/000155837025001886/stld-20241231x10k.htm
