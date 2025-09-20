# Revenue → Yield Model Transformation

**Ticket ID:** `031-01-03-yield-model-transformation`  
**Requirement:** `031-01-model-refactoring-integration` - Model Refactoring & Integration  
**Sprint:** 030  
**Type:** Database/Models  
**Target Environment:** dev  
**Branch Type:** refactor  
**Complexity:** Medium  
**Created:** August 20, 2025  
**Status:** Created  

## Description

Complete transformation of Revenue model to Yield model with enhanced functionality. Implement configurable yield distribution models (fixed_interest, revenue_share, mixed) for renewable energy bonds and improve yield calculation systems.

## Environment & Branching

**Target Environment:** dev  
**Branch Name:** `refactor/031-01-03-yield-model-transformation`  
**Base Branch:** dev  
**PR Target:** dev  

## Acceptance Criteria

### Functional Requirements
- [ ] Create new Yield model replacing Revenue model structure
- [ ] Implement three distribution models: fixed_interest, revenue_share, mixed
- [ ] Add configurable yield calculation parameters
- [ ] Implement funding ratio adjustments for yield calculations
- [ ] Create investor yield tracking with detailed breakdowns
- [ ] Add manual distribution workflow with issuer approval

### Technical Requirements
- [ ] Code follows project conventions (ES modules, async/await)
- [ ] Proper schema validation for distribution models
- [ ] Database indexes optimized for projectId, tokenId, distributionDate
- [ ] Backward compatibility maintained for existing revenue data

### Testing Requirements
- [ ] Unit tests for Yield model validation (>90% coverage)
- [ ] Integration tests for all three distribution models
- [ ] Calculation tests for yield distribution scenarios
- [ ] History and audit trail tests

### Documentation Requirements
- [ ] Model documentation with distribution models explained
- [ ] API documentation for yield calculations
- [ ] Migration guide from Revenue to Yield

## Technical Implementation Notes

### Dependencies
- Must be completed after: 031-01-01-token-model-refactoring
- Blocks the following tickets: 031-01-04-database-migration-scripts

### Code Areas to Modify
- **Models:** Create new `api/models/yield.model.js`
- **Services:** Create `api/services/yieldService.js`
- **Controllers:** Update revenue controllers to yield controllers
- **Routes:** No route changes in this ticket (handled in later requirements)

### New Yield Model Architecture
```javascript
const yieldSchema = new Schema({
  // Core References
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  tokenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token',
    required: true
  },
  
  // Yield Distribution Model
  distributionModel: {
    type: {
      type: String,
      enum: ['fixed_interest', 'revenue_share', 'mixed'],
      required: true
    },
    parameters: {
      // For fixed_interest
      annualRate: Number,  // e.g., 0.08 for 8%
      
      // For revenue_share  
      sharePercentage: Number,  // e.g., 0.15 for 15%
      
      // For mixed model
      fixedComponent: {
        rate: Number,
        percentage: Number  // % of total that's fixed
      },
      variableComponent: {
        shareRate: Number,
        percentage: Number  // % of total that's variable
      }
    }
  },
  
  // Financial Data
  financials: {
    totalRevenue: { type: Number, default: 0 },
    operatingExpenses: { type: Number, default: 0 },
    netRevenue: { type: Number, default: 0 },
    distributableAmount: { type: Number, default: 0 },
    fundingRatio: { type: Number, default: 1.0 }  // For yield adjustments
  },
  
  // Distribution Tracking
  distribution: {
    scheduledDate: Date,
    approvalDate: Date,
    distributionDate: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'distributed', 'failed'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    totalDistributed: { type: Number, default: 0 },
    investorCount: { type: Number, default: 0 }
  },
  
  // Period Information
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    quarter: String,  // e.g., "2025-Q1"
    year: Number
  },
  
  // Calculation Results
  calculations: {
    yieldPerToken: Number,
    totalYieldPool: Number,
    calculationDate: Date,
    calculatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }
}, {
  timestamps: true
})

// Indexes
yieldSchema.index({ projectId: 1 })
yieldSchema.index({ tokenId: 1 })
yieldSchema.index({ 'period.startDate': 1, 'period.endDate': 1 })
yieldSchema.index({ 'distribution.distributionDate': 1 })
yieldSchema.index({ 'distributionModel.type': 1 })
```

### Database Considerations
- [ ] New model creation required (Yield replaces Revenue)
- [ ] Indexes needed: projectId, tokenId, period dates, distribution dates
- [ ] Migration from Revenue to Yield handled in separate ticket

### Enhanced Yield Distribution Models

1. **Fixed Interest Model**
   - Simple annual percentage rate
   - Predictable returns for investors
   - Not tied to project performance

2. **Revenue Share Model**
   - Percentage of actual project revenue
   - Variable returns based on performance
   - Aligned with project success

3. **Mixed Model**
   - Combination of fixed and variable components
   - Balanced risk/return profile
   - Configurable weighting between components

### Testing Strategy
- **Unit Tests:** Model validation, distribution calculations, status transitions
- **Integration Tests:** Complete yield distribution workflow
- **Calculation Tests:** All three distribution models with various scenarios
- **Performance Tests:** Query performance for yield calculations

## Definition of Done

- [ ] Yield model created with three distribution models
- [ ] All distribution calculations properly implemented
- [ ] Manual approval workflow functional
- [ ] Investor yield tracking accurate
- [ ] All tests pass (unit, integration, calculation tests)
- [ ] Code review completed and approved
- [ ] Documentation updated with yield system
- [ ] Backward compatibility maintained

---

## Traceability

**Sprint:** 030  
**Requirement UUID:** `031-01-model-refactoring-integration`  
**Ticket UUID:** `031-01-03-yield-model-transformation`  
**GitHub Issue:** #573 - https://github.com/penomoprotocol/penomo-api/issues/573  
**Notion Page:** https://www.notion.so/031-01-03-yield-model-transformation-Revenue-Yield-Model-Transformation-257c168ca8cd81e5a4d0c50af6c4b3d6  
**Implementation PR:** (Will be populated by /claudia:commit)  

---
*Generated by Claudia Automation System - August 20, 2025*