# KPI Analysis Command

## Usage
```bash
/org:kpi:create <MM-YYYY> [environment] [--output-format=markdown|json|html]
```

## Examples
```bash
/org:kpi:create 07-2024                    # July 2024 KPIs for all environments
/org:kpi:create 08-2024 production         # August 2024 production KPIs only
/org:kpi:create 06-2024 --output-format=json  # Output as JSON
```

## Description
Generates comprehensive monthly KPI analysis based on Git data and development metrics. Analyzes development velocity, code quality, team performance, and release cycles to provide actionable insights.

## What It Analyzes

### 🚀 Development Velocity KPIs
- **Feature Delivery Rate**: Features implemented per month
- **Code Contribution Rate**: Lines changed per developer
- **Release Cycle Time**: Time from feature branch to production
- **Development Efficiency**: Feature vs maintenance work ratio

### 🔍 Quality KPIs
- **Bug Rate**: Bug fixes vs total commits ratio
- **Rework Rate**: Files modified multiple times in short periods
- **Hotfix Frequency**: Emergency fixes and patches
- **Code Stability**: Change frequency analysis by module

### 👥 Team Performance KPIs
- **Developer Activity**: Contribution patterns and trends
- **Collaboration Index**: Cross-team work and knowledge sharing
- **Specialization Analysis**: Domain expertise distribution
- **Knowledge Distribution**: Bus factor and risk assessment

### 📦 Release & Deployment KPIs
- **Release Frequency**: How often releases are shipped
- **Release Cycle Duration**: Time from development to production
- **Branch Management**: Feature branch lifecycle analysis
- **Deployment Success**: Release quality indicators

## Implementation

```bash
# The command executes the KPI analysis runner script
cd .claude/scripts
chmod +x run-kpi-analysis.js
node run-kpi-analysis.js "$1" "$2" "$3"
```

**Command Logic:**
1. Parse MM-YYYY format and validate date
2. Extract Git data for the specified period
3. Analyze development velocity, quality, team performance, and releases
4. Generate comprehensive report with insights and recommendations
5. Save raw data for further analysis
6. Display summary to console

## Output Structure

### 📊 Executive Summary
- Overall performance rating
- Key achievements and concerns
- Month-over-month trends
- Critical recommendations

### 📈 Detailed Metrics
- Visual charts and graphs (when applicable)
- Raw numbers with context
- Historical comparisons
- Peer benchmarking (when available)

### 🎯 Actionable Insights
- Process improvement recommendations
- Risk identification and mitigation
- Team development suggestions
- Technical debt highlights

### 📋 Appendix
- Methodology explanation
- Data sources and limitations
- Glossary of terms
- Historical trend data

## Files Generated
- `kpi-analysis-MM-YYYY.md` - Main report
- `kpi-data-MM-YYYY.json` - Raw data for further analysis
- `kpi-charts-MM-YYYY/` - Charts and visualizations (if applicable)

## Integration Points
- **JIRA/GitHub Issues**: Links issue resolution to commits
- **CI/CD Pipelines**: Deployment frequency and success rates
- **Code Review Tools**: Review cycle time analysis
- **Monitoring Systems**: Incident correlation with deployments

## Configuration
The command can be customized via `.claude/config/kpi-settings.json`:
```json
{
  "includeMetrics": ["velocity", "quality", "team", "releases"],
  "excludeAuthors": ["bot", "automated"],
  "releasePatterns": ["release/*", "hotfix/*"],
  "bugPatterns": ["fix:", "bug:", "hotfix:"],
  "featurePatterns": ["feat:", "feature:"],
  "environments": ["production", "staging", "development"]
}
```

## Prerequisites
- Git repository with commit history
- Conventional commit messages (recommended)
- Access to deployment/release data
- Node.js environment for data processing

## Notes
- Analysis covers the full calendar month specified
- Requires at least 30 days of commit history for meaningful metrics
- Performance scales with repository size and commit volume
- Generated reports are automatically timestamped and versioned