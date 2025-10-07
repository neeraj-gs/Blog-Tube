# Emergency Bypass Procedures

## Overview

This document outlines the emergency bypass procedures for the Claudia mandatory workflow system. These procedures should **ONLY** be used for critical production issues that require immediate attention and cannot wait for the standard Claudia workflow.

## ⚠️ CRITICAL WARNINGS

- **Emergency bypasses are LOGGED and TRACKED**
- **Post-incident review is MANDATORY**
- **Misuse of emergency procedures may result in access restrictions**
- **Bypasses have automatic expiration**

## When to Use Emergency Bypass

### ✅ Appropriate Use Cases

- **P0 Incidents**: Complete system outage affecting all users
- **Security Vulnerabilities**: Critical security issues requiring immediate patching
- **Data Loss Prevention**: Imminent risk of data corruption or loss
- **Regulatory Compliance**: Legal or regulatory requirements with immediate deadlines
- **Critical Infrastructure**: Core infrastructure failures affecting business operations

### ❌ Inappropriate Use Cases

- **Feature Deadlines**: Regular feature delivery timelines
- **Convenience**: Skipping Claudia workflow for ease
- **Learning Curve**: Not knowing how to use Claudia commands
- **Minor Bugs**: Non-critical issues that can wait
- **Documentation Updates**: Regular documentation changes

## Emergency Bypass Process

### Phase 1: Assessment and Authorization (5-10 minutes)

#### 1.1 Incident Assessment
```bash
# Document the incident
echo "INCIDENT_ID: INC-$(date +%Y%m%d-%H%M%S)" > incident-report.txt
echo "SEVERITY: [P0/P1/P2]" >> incident-report.txt
echo "IMPACT: [Description of current impact]" >> incident-report.txt
echo "BUSINESS_JUSTIFICATION: [Why bypass is necessary]" >> incident-report.txt
```

#### 1.2 Incident Commander Assignment
- **P0/P1**: Senior developer or team lead must act as incident commander
- **P2**: Any senior team member can serve as incident commander
- Commander must be available for entire incident duration

#### 1.3 Stakeholder Notification
```bash
# Notify stakeholders (adapt to your notification system)
echo "🚨 EMERGENCY BYPASS INITIATED"
echo "Incident: $INCIDENT_ID"
echo "Commander: $INCIDENT_COMMANDER"
echo "Estimated Duration: $ESTIMATED_HOURS hours"
```

### Phase 2: Bypass Creation and Activation (2-5 minutes)

#### 2.1 Create Emergency Bypass
```bash
# Run the emergency bypass creator
.github/scripts/create-emergency-bypass.sh
```

**Script will prompt for**:
- Incident ID
- Incident Commander name/email
- Reason for bypass
- Duration (in hours, max 24)

#### 2.2 Verify Bypass Activation
```bash
# Verify bypass is active
cat .github/emergency-bypass.active

# Test bypass functionality
git add . && git commit -m "emergency: test bypass functionality"
```

### Phase 3: Emergency Resolution (Variable Duration)

#### 3.1 Make Required Changes
- Work directly on main branch if necessary
- Use emergency commit message format: `emergency: [description]`
- Document all changes made during bypass

#### 3.2 Monitor and Update
```bash
# Update incident status
echo "$(date): [Status update]" >> incident-report.txt

# Monitor bypass expiration
grep "EXPIRES_HUMAN" .github/emergency-bypass.active
```

### Phase 4: Bypass Deactivation and Cleanup (10-15 minutes)

#### 4.1 Deactivate Bypass
```bash
# Remove bypass file immediately after emergency is resolved
rm .github/emergency-bypass.active

# Verify removal
ls -la .github/emergency-bypass* || echo "✅ Bypass successfully removed"
```

#### 4.2 Document Resolution
```bash
# Complete incident report
echo "RESOLUTION_TIME: $(date)" >> incident-report.txt
echo "CHANGES_MADE: [List all changes]" >> incident-report.txt
echo "BYPASS_DURATION: [Actual duration used]" >> incident-report.txt
```

#### 4.3 Create Permanent Record
```bash
# Move incident report to permanent location
mkdir -p .claude-shared/project-management/incidents/
mv incident-report.txt .claude-shared/project-management/incidents/$(date +%Y%m%d)-$INCIDENT_ID.md
```

### Phase 5: Post-Incident Review (Within 48 hours)

#### 5.1 Schedule Review Meeting
- **Required Attendees**: Incident commander, affected team members, stakeholders
- **Timeline**: Within 48 hours of incident resolution
- **Duration**: 30-60 minutes

#### 5.2 Review Agenda Template
```markdown
# Post-Incident Review: $INCIDENT_ID

## Incident Summary
- **Date/Time**: [When incident occurred]
- **Duration**: [Total incident duration]
- **Bypass Duration**: [How long bypass was active]
- **Impact**: [Business and technical impact]

## Timeline of Events
- [Chronological list of events and actions taken]

## Root Cause Analysis
- **Primary Cause**: [What caused the incident]
- **Contributing Factors**: [Other factors that contributed]

## Emergency Response Evaluation
- **What Went Well**: [Positive aspects of emergency response]
- **What Could Be Improved**: [Areas for improvement]
- **Bypass Usage**: [Was bypass necessary? Appropriate duration?]

## Prevention Measures
- **Immediate Actions**: [Actions to prevent recurrence]
- **Long-term Improvements**: [Process/system improvements]
- **Claudia Workflow Updates**: [Any workflow improvements needed]

## Action Items
- [ ] [Specific action item with owner and deadline]
- [ ] [Update documentation/runbooks]
- [ ] [Technical improvements]

## Lessons Learned
- [Key takeaways for future incidents]
```

## Emergency Bypass Audit Trail

### Automatic Logging
All bypass activities are automatically logged to:
- `.claude-shared/project-management/data/emergency-bypasses.jsonl`
- GitHub Actions workflow logs
- Pre-commit hook logs

### Log Format
```json
{
  "timestamp": "2024-XX-XXTXX:XX:XZZ",
  "action": "bypass_created|bypass_used|bypass_removed",
  "incident_id": "INC-XXXXXXXX-XXXX",
  "commander": "commander@company.com",
  "reason": "Brief description of emergency",
  "duration_hours": 2,
  "user": "user@company.com",
  "git_commit": "commit-hash-if-applicable"
}
```

### Monitoring and Alerts
```bash
# Check recent bypass usage
tail -10 .claude-shared/project-management/data/emergency-bypasses.jsonl

# Monthly bypass usage report
grep "$(date -d 'last month' +%Y-%m)" .claude-shared/project-management/data/emergency-bypasses.jsonl | wc -l
```

## Emergency Contact Information

### Incident Commanders (Update with actual contacts)
- **Primary**: [Senior Developer] - [email] - [phone]
- **Secondary**: [Team Lead] - [email] - [phone]
- **Escalation**: [Engineering Manager] - [email] - [phone]

### Emergency Escalation Path
1. **Incident Occurs** → Assess severity and impact
2. **P0/P1 Incident** → Contact primary incident commander immediately
3. **Commander Unavailable** → Contact secondary commander within 15 minutes
4. **No Response** → Escalate to engineering manager
5. **Extended Outage** → Notify business stakeholders

## Bypass Usage Guidelines

### Severity Levels and Response Times

#### P0 - Complete System Outage
- **Response Time**: Immediate (0-15 minutes)
- **Bypass Authorization**: Pre-authorized for incident commanders
- **Maximum Duration**: 24 hours
- **Review Required**: Within 24 hours

#### P1 - Critical Feature Broken
- **Response Time**: Within 1 hour
- **Bypass Authorization**: Incident commander approval required
- **Maximum Duration**: 12 hours
- **Review Required**: Within 48 hours

#### P2 - Major Feature Degraded
- **Response Time**: Within 4 hours
- **Bypass Authorization**: Senior developer approval required
- **Maximum Duration**: 8 hours
- **Review Required**: Within 72 hours

### Duration Guidelines
- **Minimum Duration**: 30 minutes (for testing and validation)
- **Maximum Duration**: 24 hours (hard limit, no extensions)
- **Typical Duration**: 2-4 hours for most incidents
- **Extension Process**: Requires new bypass creation with justification

## Bypass Validation Checklist

### Before Creating Bypass
- [ ] Incident severity assessed (P0/P1/P2)
- [ ] Business impact documented
- [ ] Alternative solutions considered
- [ ] Incident commander assigned
- [ ] Stakeholders notified
- [ ] Rollback plan prepared

### During Bypass
- [ ] Changes documented in real-time
- [ ] Regular status updates provided
- [ ] Bypass expiration monitored
- [ ] Security considerations reviewed
- [ ] Testing of changes performed

### After Bypass
- [ ] Bypass immediately deactivated
- [ ] All changes documented
- [ ] Incident report completed
- [ ] Post-incident review scheduled
- [ ] Lessons learned captured
- [ ] Process improvements identified

## Common Emergency Scenarios

### Scenario 1: Database Corruption
```bash
# Quick response for database issues
.github/scripts/create-emergency-bypass.sh
# Reason: "Critical database corruption affecting all users"
# Duration: 4 hours
# Commander: [Database specialist]

# Emergency actions
kubectl scale deployment app --replicas=0  # Stop traffic
pg_dump backup_$(date +%Y%m%d_%H%M%S)     # Emergency backup
# ... fix corruption ...
kubectl scale deployment app --replicas=3  # Restore traffic
```

### Scenario 2: Security Vulnerability
```bash
# Quick response for security issues
.github/scripts/create-emergency-bypass.sh
# Reason: "Critical security vulnerability requiring immediate patch"
# Duration: 2 hours
# Commander: [Security specialist]

# Emergency actions
# Apply security patch
# Update firewall rules
# Invalidate compromised tokens
# Monitor for exploitation
```

### Scenario 3: Infrastructure Failure
```bash
# Quick response for infrastructure issues
.github/scripts/create-emergency-bypass.sh
# Reason: "Critical infrastructure failure affecting core services"
# Duration: 6 hours
# Commander: [DevOps lead]

# Emergency actions
# Failover to backup systems
# Update DNS records
# Scale replacement infrastructure
# Monitor system stability
```

## Process Improvement and Feedback

### Quarterly Review Process
- Review all emergency bypasses from previous quarter
- Analyze patterns and trends
- Update procedures based on lessons learned
- Train team on any process changes

### Metrics to Track
- **Bypass Frequency**: Number of bypasses per month/quarter
- **Duration Efficiency**: Actual vs. estimated bypass duration
- **False Alarms**: Bypasses that could have used standard workflow
- **Resolution Time**: Time from incident to full resolution
- **Process Compliance**: Adherence to bypass procedures

### Continuous Improvement
- Regular updates to emergency procedures
- Training sessions for new team members
- Simulation exercises for major incident scenarios
- Integration with monitoring and alerting systems

---

## Quick Reference Commands

```bash
# Create emergency bypass
.github/scripts/create-emergency-bypass.sh

# Check bypass status
cat .github/emergency-bypass.active

# Remove bypass
rm .github/emergency-bypass.active

# Check bypass logs
tail -20 .claude-shared/project-management/data/emergency-bypasses.jsonl

# Create incident report
mkdir -p .claude-shared/project-management/incidents/
echo "# Incident Report $(date)" > .claude-shared/project-management/incidents/$(date +%Y%m%d)-incident.md
```

---

**Document Version**: 1.0
**Last Updated**: $(date)
**Review Schedule**: Quarterly
**Next Review**: $(date -d '+3 months' +%Y-%m-%d)

**Important**: This document should be reviewed and updated quarterly or after any major incident to ensure procedures remain effective and current.
