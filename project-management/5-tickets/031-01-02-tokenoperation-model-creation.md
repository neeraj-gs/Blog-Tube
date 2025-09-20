# TokenOperation Model Creation (Replacing TokenTransfer)

**Ticket ID:** `031-01-02-tokenoperation-model-creation`  
**Requirement:** `031-01-model-refactoring-integration` - Model Refactoring & Integration  
**Sprint:** 030  
**Type:** Database/Models  
**Target Environment:** dev  
**Branch Type:** feature  
**Complexity:** Medium  
**Created:** August 20, 2025  
**Status:** Created  

## Description

Create new TokenOperation model to replace the existing TokenTransfer model. Replace 25+ boolean flags with clean state machine and event-driven operation types. This simplifies token operation tracking and improves maintainability.

## Environment & Branching

**Target Environment:** dev  
**Branch Name:** `feature/031-01-02-tokenoperation-model-creation`  
**Base Branch:** dev  
**PR Target:** dev  

## Acceptance Criteria

### Functional Requirements
- [ ] Create TokenOperation model with operation types: purchase, mint, transfer, redeem, freeze, unfreeze
- [ ] Replace 25+ boolean flags with single status field and history tracking
- [ ] Implement participants structure (initiator, investor, addresses)
- [ ] Create amounts structure (requested, approved, executed, currency)
- [ ] Implement payment information structure
- [ ] Add proper validation for all operation types

### Technical Requirements
- [ ] Code follows project conventions (ES modules, async/await)
- [ ] Proper schema validation for operation types and status transitions
- [ ] Database indexes optimized for tokenId, operation.type, status.current
- [ ] Support for operation history and audit trail

### Testing Requirements
- [ ] Unit tests for TokenOperation model validation (>90% coverage)
- [ ] Integration tests for different operation types
- [ ] Status transition tests (draft → pending → approved → completed)
- [ ] History tracking tests

### Documentation Requirements
- [ ] Model documentation with operation types and status flows
- [ ] API documentation for new operation structure
- [ ] Migration guide from TokenTransfer to TokenOperation

## Technical Implementation Notes

### Dependencies
- Must be completed after: 031-01-01-token-model-refactoring
- Blocks the following tickets: 031-01-04-database-migration-scripts

### Code Areas to Modify
- **Models:** Create new `api/models/tokenOperation.model.js`
- **Services:** Create `api/services/tokenOperationService.js`
- **Controllers:** Create controllers for token operations
- **Routes:** No route changes in this ticket (handled in later requirements)

### New TokenOperation Model Architecture
```javascript
const tokenOperationSchema = new Schema({
  // Token Reference
  tokenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token',
    required: true
  },
  
  // Operation Type (replaces multiple boolean flags)
  operation: {
    type: {
      type: String,
      enum: ['purchase', 'mint', 'transfer', 'redeem', 'freeze', 'unfreeze'],
      required: true
    },
    subtype: {
      type: String  // e.g., 'primary_sale', 'secondary_market'
    }
  },
  
  // Participants
  participants: {
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investor'
    },
    fromAddress: String,
    toAddress: String
  },
  
  // Amounts
  amounts: {
    requested: { type: String, required: true },
    approved: String,
    executed: String,
    currency: { type: String, default: 'USD' }
  },
  
  // Single Status Field (replaces 25+ booleans)
  status: {
    current: {
      type: String,
      enum: [
        'draft', 'pending_approval', 'approved', 'pending_payment',
        'payment_received', 'pending_execution', 'executing', 
        'completed', 'failed', 'cancelled', 'refunded'
      ],
      required: true,
      default: 'draft'
    },
    history: [{
      status: String,
      timestamp: Date,
      reason: String,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
  },
  
  // Payment Information
  payment: {
    method: {
      type: String,
      enum: ['wire', 'ach', 'crypto', 'credit_card']
    },
    reference: String,
    receivedAt: Date,
    amount: String
  }
}, {
  timestamps: true
})

// Indexes
tokenOperationSchema.index({ tokenId: 1 })
tokenOperationSchema.index({ 'operation.type': 1 })
tokenOperationSchema.index({ 'status.current': 1 })
tokenOperationSchema.index({ 'participants.initiator': 1 })
```

### Database Considerations
- [ ] New model creation required
- [ ] Indexes needed: tokenId, operation.type, status.current, participants.initiator
- [ ] No immediate migration (handled in separate ticket)

### Testing Strategy
- **Unit Tests:** Model validation, status transitions, operation types
- **Integration Tests:** Complete operation lifecycle testing
- **History Tests:** Verify audit trail functionality
- **Performance Tests:** Query performance with new indexes

## Definition of Done

- [ ] TokenOperation model created with clean architecture
- [ ] All operation types supported (purchase, mint, transfer, redeem, freeze, unfreeze)
- [ ] Status state machine properly implemented
- [ ] History tracking functional
- [ ] All tests pass (unit, integration)
- [ ] Code review completed and approved
- [ ] Documentation updated with new model
- [ ] Performance benchmarks acceptable

---

## Traceability

**Sprint:** 030  
**Requirement UUID:** `031-01-model-refactoring-integration`  
**Ticket UUID:** `031-01-02-tokenoperation-model-creation`  
**GitHub Issue:** #572 - https://github.com/penomoprotocol/penomo-api/issues/572  
**Notion Page:** https://www.notion.so/031-01-02-tokenoperation-model-creation-TokenOperation-Model-Creation-from-TokenTransfer-257c168ca8cd811db95bfe60a40bb51f  
**Implementation PR:** (Will be populated by /claudia:commit)  

---
*Generated by Claudia Automation System - August 20, 2025*