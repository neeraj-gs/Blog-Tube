# 🔗 Agent Communication Protocols

This document defines the communication protocols and standards for inter-agent communication within the BlogTube automation system.

## 📋 Overview

The BlogTube automation system uses a structured communication protocol to enable agents to share information, coordinate work, and ensure consistency across implementations. This document outlines the communication standards, message formats, and interaction patterns.

## 🏗️ Communication Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Agent A       │◄──►│  Coordinator    │◄──►│   Agent B       │
│                 │    │                 │    │                 │
│ • Frontend      │    │ • Message Queue │    │ • Backend       │
│ • Backend       │    │ • State Mgmt    │    │ • Database      │
│ • Database      │    │ • Coordination  │    │ • DevOps        │
│ • DevOps        │    │ • Logging       │    │ • Documentation │
│ • Documentation │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🌟 Core Principles

1. **Asynchronous Communication**: Agents communicate through message passing
2. **State Sharing**: Critical state information is shared between dependent agents
3. **Error Propagation**: Failures are communicated to dependent agents
4. **Resource Coordination**: Agents coordinate access to shared resources
5. **Change Notification**: Agents notify others of important changes

## 📨 Message Types

### 1. Information Messages
Share context and state information between agents.

```typescript
interface InformationMessage {
  type: 'information';
  from: AgentType;
  to: AgentType | 'broadcast';
  timestamp: string;
  data: {
    context: string;
    information: any;
    priority: 'low' | 'medium' | 'high';
  };
}
```

**Example:**
```json
{
  "type": "information",
  "from": "database",
  "to": "backend",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "context": "schema_changes",
    "information": {
      "modelsModified": ["User", "Blog"],
      "newFields": ["User.preferences", "Blog.seoMeta"],
      "migrations": ["add-user-preferences.js"]
    },
    "priority": "high"
  }
}
```

### 2. Dependency Messages
Communicate dependencies and requirements between agents.

```typescript
interface DependencyMessage {
  type: 'dependency';
  from: AgentType;
  to: AgentType;
  timestamp: string;
  data: {
    requirement: string;
    status: 'needed' | 'satisfied' | 'blocked';
    details: any;
  };
}
```

**Example:**
```json
{
  "type": "dependency",
  "from": "frontend",
  "to": "backend",
  "timestamp": "2024-01-15T10:32:00Z",
  "data": {
    "requirement": "api_endpoint",
    "status": "needed",
    "details": {
      "endpoint": "/api/users/preferences",
      "methods": ["GET", "PUT"],
      "expectedSchema": {
        "preferences": {
          "theme": "string",
          "notifications": "boolean"
        }
      }
    }
  }
}
```

### 3. Status Messages
Report agent status and progress updates.

```typescript
interface StatusMessage {
  type: 'status';
  from: AgentType;
  to: 'coordinator' | 'broadcast';
  timestamp: string;
  data: {
    status: 'starting' | 'in_progress' | 'completed' | 'failed' | 'blocked';
    progress?: number; // 0-100
    message: string;
    details?: any;
  };
}
```

**Example:**
```json
{
  "type": "status",
  "from": "backend",
  "to": "coordinator",
  "timestamp": "2024-01-15T10:35:00Z",
  "data": {
    "status": "completed",
    "progress": 100,
    "message": "API endpoints created successfully",
    "details": {
      "endpointsCreated": ["/api/users/preferences"],
      "filesModified": ["backend/src/routes/users.js"],
      "testsAdded": ["backend/tests/users.test.js"]
    }
  }
}
```

### 4. Error Messages
Communicate errors and failures to relevant agents.

```typescript
interface ErrorMessage {
  type: 'error';
  from: AgentType;
  to: AgentType | 'coordinator' | 'broadcast';
  timestamp: string;
  data: {
    error: string;
    severity: 'warning' | 'error' | 'critical';
    impact: string[];
    recovery?: string;
  };
}
```

**Example:**
```json
{
  "type": "error",
  "from": "database",
  "to": "coordinator",
  "timestamp": "2024-01-15T10:37:00Z",
  "data": {
    "error": "Schema validation failed",
    "severity": "error",
    "impact": ["backend", "frontend"],
    "recovery": "Revert schema changes and retry with corrected model"
  }
}
```

### 5. Resource Messages
Coordinate access to shared resources.

```typescript
interface ResourceMessage {
  type: 'resource';
  from: AgentType;
  to: 'coordinator';
  timestamp: string;
  data: {
    action: 'request' | 'release' | 'lock' | 'unlock';
    resource: string;
    duration?: number; // in milliseconds
  };
}
```

**Example:**
```json
{
  "type": "resource",
  "from": "frontend",
  "to": "coordinator",
  "timestamp": "2024-01-15T10:40:00Z",
  "data": {
    "action": "request",
    "resource": "frontend-ui",
    "duration": 600000
  }
}
```

## 🔄 Communication Patterns

### 1. Sequential Dependency Pattern
When agents have strict dependencies and must execute in order.

```
Database Agent → Backend Agent → Frontend Agent
     │               │              │
     └─── Schema ─────┴─── API ─────┘
     Info Message    Info Message
```

**Workflow:**
1. Database agent completes schema changes
2. Sends information message to backend agent with schema details
3. Backend agent creates APIs based on schema
4. Sends information message to frontend agent with API specifications
5. Frontend agent implements UI components

### 2. Parallel Coordination Pattern
When agents can work in parallel but need to coordinate.

```
Frontend Agent ←──── Coordinator ────→ Documentation Agent
     │                   │                        │
     └─── Status ────────┼─── Broadcast ─────────┘
          Messages       Messages
```

**Workflow:**
1. Both agents start simultaneously
2. Send regular status updates to coordinator
3. Coordinator broadcasts important updates
4. Agents adjust their work based on updates

### 3. Error Recovery Pattern
When an agent encounters an error that affects others.

```
Failed Agent → Error Message → Coordinator → Broadcast → Other Agents
     │               │              │           │           │
     └─── Recovery ──┴─── Decision ──┴─── Adapt ┴─── Continue
```

**Workflow:**
1. Agent encounters error and sends error message
2. Coordinator evaluates impact and recovery options
3. Broadcasts recovery plan to affected agents
4. Agents adapt their work or wait for recovery

## 📚 Agent-Specific Protocols

### Frontend Agent Communications

**Incoming Messages:**
- API specifications from Backend Agent
- Design tokens from DevOps Agent
- Content updates from Documentation Agent

**Outgoing Messages:**
- Component requirements to Backend Agent
- UI feedback to Documentation Agent
- Deployment needs to DevOps Agent

**Example Communication:**
```json
{
  "type": "dependency",
  "from": "frontend",
  "to": "backend",
  "data": {
    "requirement": "user_authentication_status",
    "status": "needed",
    "details": {
      "endpoint": "/api/auth/status",
      "responseFormat": {
        "authenticated": "boolean",
        "user": "object",
        "permissions": "array"
      }
    }
  }
}
```

### Backend Agent Communications

**Incoming Messages:**
- Schema updates from Database Agent
- API requirements from Frontend Agent
- Performance metrics from DevOps Agent

**Outgoing Messages:**
- API specifications to Frontend Agent
- Database requirements to Database Agent
- Deployment configuration to DevOps Agent

**Example Communication:**
```json
{
  "type": "information",
  "from": "backend",
  "to": "frontend",
  "data": {
    "context": "api_ready",
    "information": {
      "baseUrl": "/api",
      "endpoints": {
        "/users/preferences": {
          "methods": ["GET", "PUT"],
          "authentication": "required",
          "rateLimit": "100/minute"
        }
      },
      "errorCodes": {
        "PREF_001": "Invalid preference value",
        "PREF_002": "Preference not found"
      }
    },
    "priority": "high"
  }
}
```

### Database Agent Communications

**Incoming Messages:**
- Data requirements from Backend Agent
- Performance requirements from DevOps Agent

**Outgoing Messages:**
- Schema updates to Backend Agent
- Migration status to all agents
- Performance metrics to DevOps Agent

**Example Communication:**
```json
{
  "type": "information",
  "from": "database",
  "to": "broadcast",
  "data": {
    "context": "migration_complete",
    "information": {
      "migration": "add-user-preferences",
      "modelsAffected": ["User"],
      "newIndexes": ["user_preferences_idx"],
      "backupCreated": true
    },
    "priority": "high"
  }
}
```

### DevOps Agent Communications

**Incoming Messages:**
- Deployment requirements from all agents
- Performance issues from monitoring

**Outgoing Messages:**
- Environment updates to all agents
- Performance metrics to relevant agents
- Deployment status to coordinator

**Example Communication:**
```json
{
  "type": "information",
  "from": "devops",
  "to": "broadcast",
  "data": {
    "context": "environment_update",
    "information": {
      "environment": "production",
      "version": "v2.1.0",
      "newEnvVars": ["FEATURE_USER_PREFERENCES"],
      "endpoints": {
        "api": "https://api.blogtube.com",
        "frontend": "https://blogtube.com"
      }
    },
    "priority": "medium"
  }
}
```

### Documentation Agent Communications

**Incoming Messages:**
- Feature descriptions from all agents
- API specifications from Backend Agent
- UI changes from Frontend Agent

**Outgoing Messages:**
- Documentation updates to relevant agents
- Content requirements to Frontend Agent

**Example Communication:**
```json
{
  "type": "information",
  "from": "documentation",
  "to": "frontend",
  "data": {
    "context": "content_update",
    "information": {
      "newDocumentation": [
        "user-preferences-guide.md",
        "api-preferences-endpoints.md"
      ],
      "updatedContent": {
        "helpText": "Customize your BlogTube experience",
        "tooltips": ["theme", "notifications", "language"]
      }
    },
    "priority": "low"
  }
}
```

## 🚀 Implementation in Claude Code

### Message Passing through Task Tool

Agents use the Task tool to send messages to other agents through the coordinator:

```typescript
// Agent A sending message to Agent B
await this.spawnAgent('general-purpose', `
  You are acting as a message relay in the BlogTube automation system.
  
  MESSAGE TO DELIVER:
  From: ${agentType}
  To: ${targetAgent}
  Type: ${messageType}
  Content: ${JSON.stringify(messageData)}
  
  Please process this message and coordinate with the ${targetAgent} agent accordingly.
`);
```

### State Sharing through Coordination Files

Agents can share state through temporary coordination files:

```javascript
// Write shared state
const sharedState = {
  agentType: 'database',
  status: 'completed',
  outputs: {
    modelsModified: ['User', 'Blog'],
    migrationsCreated: ['add-user-preferences.js']
  }
};

fs.writeFileSync(
  `automation/coordination/state-${issueId}-${agentType}.json`,
  JSON.stringify(sharedState, null, 2)
);
```

### Communication Logging

All inter-agent communication is logged for debugging and coordination:

```javascript
// Log communication
this.coordinator.addAgentCommunication(
  issueId,
  fromAgent,
  toAgent,
  messageType,
  messageData
);
```

## ✅ Communication Best Practices

### 1. Message Design
- **Be Specific**: Include all necessary context in messages
- **Use Standards**: Follow the defined message formats
- **Include Metadata**: Always include timestamps and agent identifiers
- **Prioritize**: Use appropriate priority levels for different message types

### 2. Error Handling
- **Graceful Degradation**: Handle missing or delayed messages gracefully
- **Timeout Management**: Set appropriate timeouts for message responses
- **Retry Logic**: Implement retry mechanisms for critical communications
- **Fallback Plans**: Have fallback strategies when communication fails

### 3. Performance Considerations
- **Batch Messages**: Group related messages when possible
- **Async Processing**: Don't block agent execution for communication
- **Resource Cleanup**: Clean up old messages and state files
- **Monitoring**: Track communication performance and bottlenecks

### 4. Security Guidelines
- **Data Sanitization**: Sanitize all message content
- **Access Control**: Ensure agents only access relevant messages
- **Audit Trail**: Maintain comprehensive communication logs
- **Sensitive Data**: Avoid including sensitive information in messages

## 🔧 Testing Communication Protocols

### Unit Testing
```javascript
describe('Agent Communication', () => {
  test('should send information message correctly', async () => {
    const message = {
      type: 'information',
      from: 'database',
      to: 'backend',
      data: { context: 'schema_changes', information: {...} }
    };
    
    const result = await coordinator.sendMessage(message);
    expect(result.success).toBe(true);
  });
});
```

### Integration Testing
```javascript
describe('Agent Workflow Communication', () => {
  test('should coordinate database → backend → frontend workflow', async () => {
    // Test complete communication flow
    const workflow = new AgentWorkflow(['database', 'backend', 'frontend']);
    const result = await workflow.execute();
    
    expect(result.communicationLogs).toHaveLength(4); // Expected message count
    expect(result.allAgentsCompleted).toBe(true);
  });
});
```

## 📊 Communication Monitoring

### Metrics to Track
- Message delivery time
- Message failure rate
- Agent response time
- Communication bottlenecks
- Error propagation efficiency

### Alerts and Notifications
- Failed message delivery
- Communication timeouts
- Agent unresponsiveness
- Critical error propagation

---

**This protocol ensures reliable, efficient, and secure communication between all agents in the BlogTube automation system.**