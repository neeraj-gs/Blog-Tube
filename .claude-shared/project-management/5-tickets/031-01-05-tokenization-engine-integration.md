# Tokenization Engine Integration Layer

**Ticket ID:** `031-01-05-tokenization-engine-integration`  
**Requirement:** `031-01-model-refactoring-integration` - Model Refactoring & Integration  
**Sprint:** 030  
**Type:** Integration  
**Target Environment:** dev  
**Branch Type:** feature  
**Complexity:** Medium  
**Created:** August 20, 2025  
**Status:** Created  

## Description

**PRIMARY FOCUS:** Create production-ready integration layer with the ERC-3643 tokenization engine (./tokenization-engine/) for immediate deployment capability. Implement EngineManager service with ERC-3643 as the primary engine and create foundation for future engine integrations. NYALA maintained as placeholder only.

## Environment & Branching

**Target Environment:** dev  
**Branch Name:** `feature/031-01-05-tokenization-engine-integration`  
**Base Branch:** dev  
**PR Target:** dev  

## Acceptance Criteria

### Functional Requirements (2-Week ERC-3643 Priority)
- [ ] **PRIMARY: ERC-3643 Production Integration** - Full connection with ./tokenization-engine/erc3643-backend/
- [ ] Create EngineManager service with ERC-3643 as default primary engine
- [ ] Implement ITokenizationEngine interface for generic architecture
- [ ] **ERC-3643 Configuration:** Complete configuration system for factory deployment
- [ ] Implement health monitoring for ERC-3643 engine specifically
- [ ] **NYALA Placeholder:** Basic interface implementation, no functional testing required
- [ ] **Future-Ready:** Architecture prepared for BMCP/Tokeny engine additions

### Technical Requirements
- [ ] Code follows project conventions (ES modules, async/await)
- [ ] Proper error handling with centralized response handlers
- [ ] Configuration management through environment variables
- [ ] Service layer abstraction for engine operations
- [ ] Logging and monitoring for engine interactions

### Testing Requirements
- [ ] Unit tests for EngineManager and engine interface (>90% coverage)
- [ ] Integration tests with ERC-3643 backend
- [ ] Mock engine tests for development
- [ ] Engine health check and fallback tests

### Documentation Requirements
- [ ] Architecture documentation for engine integration
- [ ] Configuration guide for different engines
- [ ] API documentation for engine operations

## Technical Implementation Notes

### Dependencies
- Must be completed after: 031-01-01-token-model-refactoring
- Blocks the following tickets: None (prepares for future engine implementations)

### Code Areas to Modify
- **Services:** Create `api/services/engineManager.js`
- **Engines:** Create `api/engines/` directory structure
- **Config:** Update configuration for engine settings
- **Interfaces:** Create `api/interfaces/ITokenizationEngine.js`

### Integration Architecture
```javascript
// Engine Manager Service
// api/services/engineManager.js
class EngineManager {
  constructor() {
    this.engines = new Map();
    this.defaultEngine = 'inhouse_erc3643';
    this.initializeEngines();
  }

  async initializeEngines() {
    // Initialize available engines based on configuration
    const erc3643Engine = new InHouseERC3643Engine(config);
    this.engines.set('inhouse_erc3643', erc3643Engine);
    
    // Future engines will be added here
    // this.engines.set('bmcp', new BMCPEngine(config));
    // this.engines.set('tokeny', new TokenyEngine(config));
    // this.engines.set('nyala', new NyalaEngine(config));
  }

  async deployToken(tokenConfig) {
    const engine = this.selectEngine(tokenConfig.engineType);
    return await engine.deployToken(tokenConfig);
  }

  selectEngine(engineType) {
    if (this.engines.has(engineType) && this.isEngineHealthy(engineType)) {
      return this.engines.get(engineType);
    }
    
    // Fallback logic
    return this.engines.get(this.defaultEngine);
  }
}

// Tokenization Engine Interface
// api/interfaces/ITokenizationEngine.js
class ITokenizationEngine {
  async deployToken(config) { throw new Error('Must implement deployToken'); }
  async mintTokens(tokenAddress, amount, recipient) { throw new Error('Must implement mintTokens'); }
  async whitelistInvestor(tokenAddress, investorData) { throw new Error('Must implement whitelistInvestor'); }
  async transferTokens(tokenAddress, from, to, amount) { throw new Error('Must implement transferTokens'); }
  async getTokenInfo(tokenAddress) { throw new Error('Must implement getTokenInfo'); }
  async isHealthy() { throw new Error('Must implement isHealthy'); }
}

// ERC-3643 Engine Implementation
// api/engines/InHouseERC3643Engine.js
class InHouseERC3643Engine extends ITokenizationEngine {
  constructor(config) {
    super();
    this.backendUrl = config.erc3643BackendUrl;
    this.apiKey = config.erc3643ApiKey;
  }

  async deployToken(tokenConfig) {
    // Interface with ./tokenization-engine/erc3643-backend/
    const response = await fetch(`${this.backendUrl}/deployment/deploy-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: tokenConfig.name,
        symbol: tokenConfig.symbol,
        decimals: tokenConfig.decimals,
        totalSupply: tokenConfig.totalSupply
      })
    });

    return await response.json();
  }

  async isHealthy() {
    try {
      const response = await fetch(`${this.backendUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
```

### Configuration System
```javascript
// Environment configuration
const engineConfig = {
  engines: {
    inhouse_erc3643: {
      enabled: process.env.ERC3643_ENABLED === 'true',
      backendUrl: process.env.ERC3643_BACKEND_URL || 'http://localhost:3001',
      apiKey: process.env.ERC3643_API_KEY,
      priority: 1  // Highest priority
    },
    testengine: {
      enabled: process.env.NODE_ENV === 'development',
      priority: 999  // Lowest priority (fallback for testing)
    }
  },
  defaultEngine: 'inhouse_erc3643',
  healthCheckInterval: 30000,  // 30 seconds
  retryAttempts: 3,
  timeoutMs: 10000
};
```

### Database Considerations
- [ ] Engine configuration stored in database
- [ ] Engine health status tracking
- [ ] Token-engine relationship mapping

### Integration with ./tokenization-engine/
- Connect with NestJS backend at `./tokenization-engine/erc3643-backend/`
- Use deployment endpoints for token creation
- Integrate with blockchain service for token operations
- Leverage existing smart contract infrastructure

### Testing Strategy
- **Unit Tests:** EngineManager, interface implementations, configuration
- **Integration Tests:** Communication with ERC-3643 backend
- **Mock Tests:** Simulate engine responses for development
- **Health Tests:** Engine availability and fallback scenarios

## Definition of Done

- [ ] EngineManager service fully implemented
- [ ] ITokenizationEngine interface defined and documented
- [ ] ERC-3643 engine integration working
- [ ] Configuration system supports multiple engines
- [ ] Health monitoring and fallback logic functional
- [ ] All tests pass (unit, integration, health checks)
- [ ] Code review completed and approved
- [ ] Documentation complete with architecture diagrams
- [ ] Integration with ./tokenization-engine/ verified

---

## Traceability

**Sprint:** 030  
**Requirement UUID:** `031-01-model-refactoring-integration`  
**Ticket UUID:** `031-01-05-tokenization-engine-integration`  
**GitHub Issue:** #575 - https://github.com/penomoprotocol/penomo-api/issues/575  
**Notion Page:** https://www.notion.so/031-01-05-tokenization-engine-integration-Tokenization-Engine-Integration-Layer-257c168ca8cd81b99cc1ed84162e024b  
**Implementation PR:** (Will be populated by /claudia:commit)  

---
*Generated by Claudia Automation System - August 20, 2025*