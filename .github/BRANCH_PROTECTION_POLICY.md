# Branch Protection Policy

## Overview
This repository enforces mandatory Claudia workflow compliance through branch protection rules.

## Protected Branches

### Main Branch (`main`)
**Protection Level**: Maximum
**Direct Push Access**: ❌ Disabled
**Force Push**: ❌ Disabled

**Requirements**:
- ✅ Pull request required
- ✅ At least 1 approving review required
- ✅ Dismiss stale reviews when new commits are pushed
- ✅ Require review from CODEOWNERS
- ✅ Required status checks must pass
- ✅ Conversations must be resolved
- ✅ Up-to-date branches required

**Required Status Checks**:
- `Claudia Workflow Validation` - Validates proper Claudia command usage
- `Pre-commit Hooks` - Ensures pre-commit validation passed
- `Code Quality Check` - Code quality and linting validation
- `Security Scan` - Security vulnerability scanning

## Workflow Enforcement

### Mandatory Claudia Commands
All changes to protected branches must follow the Claudia workflow:

1. **Issue Creation**: `/claudia:issues:create` or `/claudia:requirements:define`
2. **Implementation**: `/claudia:implement:manual` or `/claudia:implement:auto`
3. **Commit**: `/claudia:commit "ISSUE_ID"`
4. **Pull Request**: `/claudia:pr:create "ISSUE_ID"`

### Bypass Procedures
Emergency bypass is available for critical production issues:

1. Use emergency issue template
2. Get approval from incident commander
3. Follow post-incident review process
4. Document bypass in incident log

See [Emergency Procedures](.github/EMERGENCY_PROCEDURES.md) for details.

## Code Review Requirements

### Review Criteria
- [ ] Claudia workflow compliance verified
- [ ] Requirements traceability confirmed
- [ ] Code quality standards met
- [ ] Tests included and passing
- [ ] Documentation updated
- [ ] Security considerations reviewed

### Reviewer Responsibilities
- Verify Claudia command chain of custody
- Confirm issue/requirement linkage
- Validate implementation against acceptance criteria
- Ensure audit trail completeness

## Compliance Monitoring

### Automated Checks
- Pre-commit hooks validate Claudia workflow
- GitHub Actions verify command usage
- Status checks prevent non-compliant merges
- Audit logs track all workflow steps

### Manual Review
- Code owners review all changes
- PR template compliance checked
- Requirements traceability validated
- Emergency bypasses logged and reviewed

## Policy Updates

This policy is maintained as part of the Claudia workflow system.
Updates require:
1. Discussion in GitHub Discussions
2. Approval from repository maintainers
3. Documentation update
4. Team notification

---

**Policy Version**: 1.0
**Last Updated**: $(date)
**Review Cycle**: Quarterly
