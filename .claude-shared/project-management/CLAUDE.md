# CLAUDE.md - Enhanced Sprint-Based Project Management System

This file provides comprehensive guidance for working with the enhanced Claudia sprint-based project management system supporting multi-commit/multi-PR development workflows.

## Enhanced Project Management Structure

### 🔥 CRITICAL: ALWAYS USE THIS DIRECTORY (.claude-shared/project-management/)

**MANDATORY LOCATION FOR ALL CLAUDIA DOCUMENTS:**
- **Roadmap:** `1-roadmap/` (THIS directory, not docs/)
- **Planning:** `2-planning/` (THIS directory, not docs/)
- **Sprints:** `3-sprints/` (THIS directory, not docs/)
- **Requirements:** `4-requirements/` (THIS directory, not docs/)
- **Tickets:** `5-tickets/` (THIS directory, not docs/)
- **Audit Logs:** `data/` (THIS directory, not docs/)

**❌ NEVER CREATE DOCUMENTS IN:** `docs/project-management/` or `docs/` directories  
**✅ ALWAYS CREATE DOCUMENTS IN:** `.claude-shared/project-management/` (THIS directory)

### 🔥 CRITICAL: NOTION TICKET FORMATTING REQUIREMENTS

**MANDATORY NOTION FORMATTING:**
- ✅ **Convert markdown to native Notion blocks** - Use proper headings, bullet points, todos instead of code blocks
- ✅ **Structured traceability links** - Format as clear sections: "Planning Document: [link]", "Sprint Document: [link]", etc.
- ✅ **Proper Notion rendering** - Ensure all content renders as native Notion elements, not markdown code
- ✅ **Fixed link URLs** - Ensure all document links work and point to correct GitHub file paths
- ❌ **Markdown code blocks for ticket content** - Never embed ticket content as markdown code blocks

This directory implements an enhanced 4-level hierarchy with sprint-based organization for complete project traceability and real-world development support:

```
project-management/
├── 2-planning/              # Optional strategic planning documents (quarters, initiatives)
├── 3-sprints/              # Numbered sprint definitions (030.md, 031.md, 032.md)
├── 4-requirements/         # Sprint-based detailed requirements specifications
├── 5-tickets/              # Environment-aware actionable development tickets
└── data/                   # Enhanced audit trail and multi-development traceability data
    ├── sprints-log.jsonl        # Sprint lifecycle and metrics tracking
    ├── requirements-log.jsonl   # Requirement lifecycle tracking  
    ├── tickets-log.jsonl        # Multi-commit, multi-PR ticket tracking
    ├── commits-log.jsonl        # All commits with environment context
    ├── github-sync.jsonl        # GitHub issue lifecycle management
    └── notion-sync.jsonl        # Notion workspace integration
```

## Enhanced Sprint-Based UUID Hierarchical Format (MANDATORY)

### Revolutionary Sprint-Based Structure Rules
```
Planning:     [Optional] - High-level quarterly/initiative documents
Sprints:      XXX-description (e.g., 030-auth-system-sprint)
Requirements: XXX-YY-description (e.g., 030-01-user-authentication)  
Tickets:      XXX-YY-ZZ-description (e.g., 030-01-01-database-design)
```

Where:
- `XXX` = 3-digit sequential sprint number (030, 031, 032, 033...)
- `YY` = 2-digit requirement number within sprint (01, 02, 03...)
- `ZZ` = 2-digit ticket number within requirement (01, 02, 03...)

### Enhanced Inheritance Chain Examples

**Complete Enhanced Sprint Hierarchy:**
```
Sprint 030: Authentication & Authorization System          (3-sprints/030.md)
├── Requirement 030-01: User Authentication               (4-requirements/030-01-user-auth.md)
│   ├── Ticket 030-01-01: Database schema design         (5-tickets/030-01-01-database.md) [dev]
│   ├── Ticket 030-01-02: API endpoint implementation    (5-tickets/030-01-02-api.md) [dev]
│   ├── Ticket 030-01-03: Frontend integration           (5-tickets/030-01-03-frontend.md) [staging]
│   └── Ticket 030-01-04: Security testing               (5-tickets/030-01-04-testing.md) [staging]
├── Requirement 030-02: Role-Based Permissions           (4-requirements/030-02-permissions.md)
│   ├── Ticket 030-02-01: Permission middleware          (5-tickets/030-02-01-middleware.md) [dev]
│   └── Ticket 030-02-02: Admin interface                (5-tickets/030-02-02-admin.md) [dev]
└── Requirement 030-03: Session Management               (4-requirements/030-03-sessions.md)
    ├── Ticket 030-03-01: JWT implementation             (5-tickets/030-03-01-jwt.md) [dev]
    └── Ticket 030-03-02: Session cleanup                (5-tickets/030-03-02-cleanup.md) [staging]
```

**With Optional Planning Integration:**
```
Planning: Q4-2024-Security-Initiative                     (2-planning/q4-2024-security.md)
    ↓
Sprint 030: Authentication System                         (3-sprints/030.md)
    ↓  
Requirement 030-01: User Authentication                   (4-requirements/030-01-user-auth.md)
    ↓
Ticket 030-01-01: Database Design [dev environment]      (5-tickets/030-01-01-database.md)
```

**Enhanced Key Rules:**
1. **Sprint-based inheritance:** All work inherits from numbered sprint (030, 031, 032...)
2. **Sequential sprint numbering:** Never skip sprint numbers - always use next available
3. **Environment awareness:** All tickets specify target environment ([dev] or [staging])
4. **Multi-commit/Multi-PR support:** Tickets support multiple commits and PRs throughout lifecycle
5. **Immutable sprint UUIDs:** Once assigned, sprint-based UUIDs never change
6. **GitHub Issue lifecycle:** Issues remain open until manual ticket completion

## Enhanced Document Templates

### 1. Planning Documents (`2-planning/`) - Optional Strategic Initiatives  
- **Purpose:** High-level strategic direction, quarterly initiatives, major business objectives
- **Scope:** Business requirements, goals, constraints, risk assessment, cross-sprint coordination
- **Duration:** Typically covers multiple sprints, quarters, or major product initiatives
- **Stakeholders:** Product owners, executives, architects, business analysts
- **Sprint Integration:** Planning documents provide context for multiple numbered sprints
- **Examples:** `q4-2024-security-initiative.md`, `2025-api-modernization.md`

### 2. Sprint Documents (`3-sprints/`) - Numbered Sprint Definitions **[PRIMARY ORGANIZATION]**
- **Purpose:** Core sprint organization with numbered identification system
- **Scope:** Sprint goals, requirements list, timeline, success metrics, team assignments
- **Format:** `XXX.md` where XXX is 3-digit sequential number (030.md, 031.md, 032.md)
- **Duration:** Standard sprint cycles (1-4 weeks depending on team methodology)
- **Stakeholders:** Sprint managers, scrum masters, development teams, product owners
- **Enhanced Features:** Sprint velocity tracking, automated metrics, requirement inheritance
- **Examples:** `030.md` (Auth Sprint), `031.md` (Payment Sprint), `032.md` (Analytics Sprint)

### 3. Requirements Documents (`4-requirements/`) - Sprint-Based Specifications
- **Purpose:** Detailed specifications with acceptance criteria, inheriting from specific sprints
- **Scope:** Technical requirements, user stories, API specifications, environment considerations
- **Format:** `XXX-YY-description.md` (e.g., `030-01-user-authentication.md`)
- **Duration:** Typically contained within single sprint, can span multiple if complex
- **Stakeholders:** Engineers, QA, product managers, UX designers
- **Enhanced Features:** Environment targeting, interactive definition mode, auto-linking to sprint
- **Sprint Inheritance:** Always inherit sprint number (XXX) from parent sprint document

### 4. Ticket Documents (`5-tickets/`) - Environment-Aware Development Tasks **[IMPLEMENTATION LEVEL]**
- **Purpose:** Actionable development tasks with environment awareness and multi-development support
- **Scope:** Specific implementation steps, test cases, definition of done, environment targeting
- **Format:** `XXX-YY-ZZ-description.md` (e.g., `030-01-01-database-design.md`)
- **Duration:** 1-5 days of development work, supports iterative development with multiple commits/PRs
- **Environment:** Mandatory specification of target environment (`--env dev` or `--env staging`)
- **Stakeholders:** Individual developers, code reviewers, DevOps engineers
- **Enhanced Features:** 
  - **Multi-commit support:** Track multiple commits per ticket for iterative development
  - **Multi-PR support:** Support multiple PRs per ticket for complex features
  - **GitHub Issue lifecycle:** Issues remain open until manual completion
  - **Branch auto-detection:** System determines appropriate branch types (feature/, fix/, etc.)
  - **Environment context:** All commits and PRs tagged with target environment

## Enhanced Claudia Commands Integration

### Enhanced Sprint-Based Workflow
The enhanced Claudia system provides complete sprint-based development workflow:

```bash
# 1. Create numbered sprint (primary organization unit)
/claudia:sprint:create "030"
# → Result: 3-sprints/030.md + sprint tracking initialization

# 2. Create requirements within sprint (with interactive mode)
/claudia:requirements:define "User Authentication System" --sprint 030
# → Result: 4-requirements/030-01-user-auth.md

# 3. Create environment-aware tickets
/claudia:tickets:create "030-01" --env dev
# → Result: 5-tickets/030-01-01-database.md (targets dev environment)

# 4. Assign tickets to GitHub Issues + Notion
/claudia:tickets:assign "030-01-01-database"
# → Result: GitHub Issue #123 + Notion page created + integrations logged

# 5. Multi-commit development (supports iterative development)
/claudia:commit "030-01-01-database"      # Initial implementation
/claudia:commit "030-01-01-database"      # Bug fixes after testing  
/claudia:commit "030-01-01-database"      # Code review feedback
/claudia:commit "030-01-01-database"      # Performance improvements

# 6. Multi-PR support (supports complex feature development)
/claudia:pr:create "030-01-01-database"   # PR #1: Basic implementation
# Review feedback: needs significant changes...
/claudia:pr:create "030-01-01-database"   # PR #2: Refined implementation

# 7. Manual ticket completion (proper GitHub issue closure)
/claudia:ticket:complete "030-01-01-database"
# → Result: GitHub Issue #123 closed + completion summary + metrics updated
```

### Environment-Aware Development Integration
```bash
# Development environment workflow
/claudia:tickets:create "030-01" --env dev     # Targets dev branch
/claudia:commit "030-01-01-database"           # Commits tagged with dev context
/claudia:pr:create "030-01-01-database"        # PR targets dev branch

# Staging environment workflow  
/claudia:tickets:create "030-02" --env staging # Targets staging branch
/claudia:commit "030-02-01-deployment"         # Commits tagged with staging context
/claudia:pr:create "030-02-01-deployment"      # PR targets staging branch
```

### Enhanced Traceability Links
Every document includes enhanced traceability sections that are automatically populated with multi-development tracking:

```markdown
## Enhanced Traceability
**Sprint UUID:** `030` (Sprint 030: Authentication System)
**Requirement UUID:** `030-01-user-auth` (User Authentication)  
**Ticket UUID:** `030-01-01-database` (Database Design)
**Target Environment:** `dev`
**GitHub Issue:** #123 (Status: Open - supports multiple PRs)
**Implementation Commits:** 
  - abc123def (Initial implementation)
  - xyz789abc (Bug fixes after testing)
  - def456ghi (Code review feedback) 
  - ghi789jkl (Performance improvements)
**Pull Requests:**
  - PR #45: Basic implementation (Merged)
  - PR #46: Refined implementation (Open)
**Branch:** `feature/030-01-01-database` (Auto-detected: feature type)
**Multi-Development Notes:** Supports iterative development with multiple commits and PRs
**Completion Status:** In Progress (Issue remains open until manual completion)
```

### Enhanced Multi-Development Tracking
```markdown
## Multi-Development Audit Trail
**Total Commits:** 4
**Total PRs:** 2 (1 merged, 1 open)
**Development Pattern:** Iterative (multiple commits, multiple PRs)
**Environment Context:** All development tagged with `dev` environment
**Issue Lifecycle:** Open → Multiple PRs → Manual Completion
**Sprint Metrics Impact:** Contributes to Sprint 030 velocity tracking
```

## Enhanced Data Integrity Rules

### Enhanced JSONL Log Files
Located in `data/` with comprehensive multi-development tracking:
- `sprints-log.jsonl` - Sprint creation, metrics, and lifecycle tracking
- `requirements-log.jsonl` - All requirement document creation, updates, and sprint relationships
- `tickets-log.jsonl` - Multi-commit, multi-PR ticket tracking with environment context
- `commits-log.jsonl` - All commits with environment context and ticket relationships
- `github-sync.jsonl` - GitHub issue lifecycle management (open → multiple PRs → manual close)
- `notion-sync.jsonl` - Notion workspace integration and page management

**Enhanced Critical Rules:**
- **Append-only architecture:** Never delete or modify existing lines (supports multi-development audit trails)
- **One JSON object per line:** Proper JSONL format for efficient processing
- **Complete multi-development audit trail:** Every commit, PR, and ticket action logged
- **Environment context:** All entries include target environment (dev/staging)
- **Sprint relationship tracking:** All entries linked to sprint UUIDs
- **Timestamps:** All entries include ISO 8601 timestamps
- **Multi-commit/PR support:** Log files track multiple commits and PRs per ticket
- **GitHub issue lifecycle:** Complete tracking from creation to manual completion

### Enhanced Example Log Entries

**Sprint Creation:**
```jsonl
{"timestamp":"2025-08-20T14:30:18Z","action":"sprint_created","sprint_number":"030","title":"Authentication & Authorization System","file":"3-sprints/030.md","status":"active","planned_requirements":0,"completed_requirements":0,"author":"claudia"}
```

**Requirement Creation with Sprint Inheritance:**
```jsonl
{"timestamp":"2025-08-20T14:35:22Z","action":"requirement_created","uuid":"030-01-user-auth","sprint_uuid":"030","title":"User Authentication System","file":"4-requirements/030-01-user-auth.md","status":"draft","interactive_mode":true,"author":"claudia"}
```

**Environment-Aware Ticket Creation:**
```jsonl
{"timestamp":"2025-08-20T14:40:15Z","action":"ticket_created","uuid":"030-01-01-database","requirement_uuid":"030-01-user-auth","sprint_uuid":"030","title":"Database Schema Design","file":"5-tickets/030-01-01-database.md","target_env":"dev","branch_type":"feature","status":"created","author":"claudia"}
```

**Multi-Commit Tracking:**
```jsonl
{"timestamp":"2025-08-20T15:15:33Z","action":"commit_logged","ticket_uuid":"030-01-01-database","commit_hash":"abc123def","commit_message":"Initial database schema implementation","target_env":"dev","commit_number":1,"branch":"feature/030-01-01-database","author":"claudia"}
{"timestamp":"2025-08-20T16:45:18Z","action":"commit_logged","ticket_uuid":"030-01-01-database","commit_hash":"xyz789abc","commit_message":"Fix schema validation issues","target_env":"dev","commit_number":2,"branch":"feature/030-01-01-database","author":"claudia"}
```

**Multi-PR Support:**
```jsonl
{"timestamp":"2025-08-20T17:20:45Z","action":"pr_created","ticket_uuid":"030-01-01-database","pr_number":123,"pr_title":"Initial database schema implementation","target_branch":"dev","github_issue":456,"auto_close_issue":false,"commit_count":2,"author":"claudia"}
{"timestamp":"2025-08-20T18:30:22Z","action":"pr_created","ticket_uuid":"030-01-01-database","pr_number":124,"pr_title":"Enhanced database schema with validation","target_branch":"dev","github_issue":456,"auto_close_issue":false,"commit_count":3,"author":"claudia"}
```

**Manual Ticket Completion:**
```jsonl
{"timestamp":"2025-08-21T10:15:30Z","action":"ticket_completed","ticket_uuid":"030-01-01-database","github_issue":456,"total_commits":5,"total_prs":2,"development_days":2,"target_env":"dev","completion_summary":"Database schema implemented with validation and testing","author":"claudia"}
```

## Enhanced Quality Gates

### Enhanced Pre-Creation Validation
1. **Sprint hierarchy check:** Verify sprint documents exist before creating requirements/tickets
2. **Sprint-based UUID format:** Validate proper sprint inheritance (030 → 030-01 → 030-01-01)
3. **Environment specification:** Ensure tickets specify target environment (dev/staging)
4. **Content completeness:** Ensure all required sections including multi-development support
5. **Enhanced traceability links:** Verify proper sprint-based relationships
6. **Branch type compatibility:** Ensure branch type aligns with requirement content

### Enhanced Post-Creation Verification
1. **Correct directory placement:** Files in proper 4-level hierarchy (2-planning/, 3-sprints/, 4-requirements/, 5-tickets/)
2. **Enhanced JSONL logging:** Multi-development audit trail with complete traceability
3. **Sprint-based UUID format:** Sequential numbering maintained within sprint context
4. **Environment context:** All environment specifications properly recorded
5. **Multi-development readiness:** Tickets prepared for multiple commits and PRs
6. **GitHub integration:** Issue creation logged with proper lifecycle management
7. **Sprint relationship links:** Parent-child sprint relationships recorded in all JSONL entries

## Enhanced Sprint Management and Tracking

### Enhanced Sprint Progress Tracking
With numbered sprint system providing primary organization:
- **Sprint UUID:** All related work shares the same 3-digit sprint prefix (030, 031, 032...)
- **Sprint-based Progress Queries:** Filter JSONL logs by sprint number to track comprehensive progress
- **Cross-Sprint Visibility:** See all requirements and tickets for any numbered sprint
- **Enhanced Completion Metrics:** Calculate sprint completion with multi-commit/PR context
- **Environment-specific Progress:** Track progress separately for dev and staging environments
- **Multi-Development Metrics:** Track average commits per ticket, PRs per ticket, development velocity

### Enhanced Sprint Metrics
```bash
# Sprint 030 Metrics Example:
- **Requirements:** 3 (030-01, 030-02, 030-03)
- **Total Tickets:** 7 (030-01-01 through 030-03-02)
- **Environment Distribution:** 5 dev tickets, 2 staging tickets
- **Development Stats:** 
  - Total Commits: 23 (avg 3.3 per ticket)
  - Total PRs: 12 (avg 1.7 per ticket, supports multi-PR pattern)
  - Open Issues: 2 (GitHub issues awaiting completion)
  - Completed Tickets: 5 (manual completion with proper closure)
- **Sprint Velocity:** 5 tickets completed in 2 weeks
- **Multi-Development Pattern:** High iterative development (multiple commits/PRs per ticket)
```

### Enhanced Sprint Reporting Commands
- `/claudia:status` - Shows progress across all numbered sprints with multi-development context
- `/claudia:report` - Generate comprehensive sprint-based traceability reports
- `/claudia:sprint:metrics "030"` - Detailed metrics for specific numbered sprint
- Filter by sprint number (030, 031, 032...) to see sprint-specific progress with full audit trails

## Enhanced Workflow Integration

### Enhanced GitHub Integration
- **Issues:** Automatically created from environment-aware tickets with proper lifecycle management
- **Pull Requests:** Support multiple PRs per ticket, linked to requirements and sprints
- **Issue Lifecycle:** Issues remain OPEN until manual ticket completion (supports multi-PR development)
- **Labels:** Applied based on document metadata, environment context, and branch type
- **Milestones:** Mapped to numbered sprint documents (Sprint 030, Sprint 031, etc.)
- **Branch Management:** Auto-detected branch types (feature/, fix/, hotfix/, security/, etc.)
- **Environment Targeting:** PRs automatically target correct environment branches (dev/staging)

### Enhanced Notion Integration (Optional)
- **Pages:** Rich document representation with sprint-based organization
- **Databases:** Structured project tracking with multi-development support
- **Sprint Relations:** Hierarchical relationships maintained across numbered sprints
- **Multi-Development Status:** Real-time tracking of multiple commits and PRs per ticket
- **Environment Context:** All entries tagged with target environment information
- **Completion Tracking:** Manual completion status with comprehensive metrics

## Enhanced Maintenance & Monitoring

### Enhanced Regular Checks
- **Sprint-based UUID uniqueness:** No duplicate UUIDs across numbered sprint system (030, 031, 032...)
- **Sprint hierarchy integrity:** All requirements and tickets have valid parent sprints
- **Enhanced log consistency:** JSONL files properly formatted with multi-development tracking
- **4-level file organization:** Documents in correct enhanced directories (2-planning/, 3-sprints/, 4-requirements/, 5-tickets/)
- **Environment context validation:** All tickets properly specify target environments
- **Multi-development audit trails:** Complete tracking of multiple commits and PRs per ticket
- **GitHub issue lifecycle compliance:** Verify issues remain open until manual completion

### Enhanced Performance Optimization
- **Archive completed sprints:** Move finished numbered sprints to archive while maintaining audit trails
- **Sprint-based index maintenance:** Keep sprint-based search indexes current
- **Enhanced backup procedures:** Regular backups of multi-development audit trails
- **Cross-repository sync verification:** Ensure enhanced sprint-based system consistency
- **Environment deployment tracking:** Monitor success rates for dev vs staging environments
- **Multi-development metrics:** Track performance of multi-commit/PR development patterns

### Enhanced Quality Assurance
- **Sprint metrics validation:** Verify sprint velocity calculations include multi-development context
- **Environment deployment success:** Monitor deployment success rates by environment
- **Multi-PR pattern analysis:** Analyze effectiveness of multiple PRs per ticket
- **GitHub issue lifecycle compliance:** Ensure proper open → multiple PRs → manual close patterns
- **Audit trail completeness:** Validate complete traceability from sprint to deployment

### Enhanced Recovery Procedures
- **Sprint-based recovery:** Use numbered sprint hierarchy for systematic issue recovery
- **JSONL-based reconstruction:** Leverage append-only logs to rebuild project state
- **Environment-specific recovery:** Separate recovery procedures for dev vs staging issues
- **Multi-development state reconstruction:** Rebuild complete multi-commit/PR relationships

---

**CRITICAL:** This enhanced sprint-based system is essential for compliance, comprehensive audit trails, and real-world development workflow support. The numbered sprint system (030, 031, 032...) with multi-commit/multi-PR capabilities provides complete traceability while supporting iterative development practices. Always follow the established sprint-based patterns and never bypass the hierarchical structure or environment specifications.