# YouTube Channel Follow Challenge Implementation

**Planning Document ID:** 250909-01-youtube-channel-follow-challenge  
**Author:** Sascha Kubisch / Claude  
**Date:** September 9, 2025  
**Status:** Planning  
**Priority:** High  
**Sprint:** TBD  

## Executive Summary

Implementation of YouTube channel subscription functionality as a social media challenge in the Penomo platform, following existing patterns from Twitter/X, Telegram, and Discord integrations.

## Business Requirements

### Objectives
- Enable users to complete challenges by subscribing to Penomo's YouTube channel
- Provide XP rewards through flip cards upon successful subscription
- Prevent duplicate claims using the same YouTube account
- Maintain consistency with existing social media challenge patterns

### Success Criteria
- Users can authenticate with YouTube via OAuth2
- System verifies channel subscription status
- Rewards are distributed upon successful subscription
- Duplicate prevention works across multiple user accounts
- Full integration with existing challenge/flip card system

## Technical Architecture

### System Components

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Frontend App   │────▶│   Backend API    │────▶│  YouTube API v3  │
│  (React/Next)   │     │   (Node/Express) │     │   (OAuth2)       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         
         ▼                       ▼                         
┌─────────────────┐     ┌──────────────────┐              
│   User Store    │     │    MongoDB       │              
│  (Zustand)      │     │   Database       │              
└─────────────────┘     └──────────────────┘              
```

### Authentication Flow

1. **OAuth2 Authorization**
   - User initiates YouTube authentication
   - Backend generates OAuth2 authorization URL
   - User grants permissions to access subscription data
   - YouTube redirects back with authorization code

2. **Token Exchange**
   - Backend exchanges authorization code for access token
   - Token stored in session for API calls
   - User identity retrieved from YouTube API

3. **Subscription Verification**
   - Check subscription status for Penomo's channel
   - Verify user hasn't already claimed with this YouTube account
   - Create subscription if not already subscribed
   - Update challenge completion and distribute rewards

## Implementation Details

### Backend Components

#### 1. Environment Configuration
```javascript
// New environment variables required
YOUTUBE_CLIENT_ID=<oauth_client_id>
YOUTUBE_CLIENT_SECRET=<oauth_client_secret>
YOUTUBE_CALLBACK_URL=<callback_url>
YOUTUBE_API_KEY=<api_key>
YOUTUBE_CHANNEL_ID=<penomo_channel_id>
```

#### 2. Service Layer (`youtube.service.js`)

**Key Methods:**
- `youtubeAuthUrlGeneratorHelper()` - Generate OAuth2 URL with proper scopes
- `youtubeCallbackHelper()` - Handle OAuth callback and token exchange
- `subscribeToChannelOnYouTubeHelper()` - Main subscription logic

**OAuth2 Scopes Required:**
- `https://www.googleapis.com/auth/youtube.force-ssl` - Manage subscriptions
- `https://www.googleapis.com/auth/userinfo.profile` - Get user identity

**API Endpoints Used:**
- `/oauth2/v2/auth` - Authorization endpoint
- `/oauth2/v4/token` - Token exchange
- `/youtube/v3/subscriptions` - Subscription management
- `/youtube/v3/channels` - Channel information

#### 3. Controller Layer (`youtube.controller.js`)

**Endpoints:**
- `youtubeAuthUrlGenerator` - Returns OAuth URL
- `youtubeCallback` - Processes OAuth callback
- `subscribeToYouTubeChannel` - Executes subscription

#### 4. Routes (`youtube.routes.js`)

```javascript
GET /api/youtube/auth
GET /api/youtube/callback?code={code}
GET /api/youtube/subscribe/:challengeId
```

**Middleware Stack:**
1. `verifyJwtToken` - Authenticate user
2. `dynamicRateLimiter` - Prevent abuse
3. `allowedRoles(['investor'])` - Check permissions
4. `validateYouTubeSubscribe` - Validate input

#### 5. Validation (`youtube.validator.js`)

**Validation Rules:**
- Challenge ID must be valid MongoDB ObjectId
- OAuth code must be present and non-empty
- State parameter must match for CSRF protection

#### 6. Rate Limiting (`config/rateLimit/youtube.js`)

```javascript
{
  youtube_auth: { points: 10, duration: 60 },
  youtube_callback: { points: 10, duration: 60 },
  youtube_subscribe: { points: 5, duration: 60 }
}
```

### Frontend Components

#### 1. API Integration (`services/api.ts`)

```typescript
export const getYouTubeAuthURL = () => 
  http.get(`${ENDPOINT.YOUTUBE}auth`);

export const youtubeCallback = (code: string) => 
  http.get(`${ENDPOINT.YOUTUBE}callback?code=${code}`);

export const subscribeYouTube = (challengeId: string) => 
  http.get(`${ENDPOINT.YOUTUBE}subscribe/${challengeId}`);
```

#### 2. Quest Component Updates

**State Management:**
- Handle YouTube OAuth callback in URL params
- Process subscription status
- Update challenge completion state
- Trigger flip card reveals

**UI Elements:**
- YouTube icon/branding
- Subscribe button
- Status indicators
- Error handling

### Database Schema

#### Challenge Model Updates
```javascript
{
  challengePlatform: 'youtube',
  challengeType: 'subscribe',
  pageLink: 'https://youtube.com/@penomo', // Channel URL
  completedSocialIds: [
    {
      socialId: 'UC_xxxxx', // YouTube channel ID
      platform: 'youtube',
      completedAt: Date
    }
  ]
}
```

## Security Considerations

### OAuth2 Security
- **State Parameter:** Use random state to prevent CSRF attacks
- **PKCE:** Consider implementing PKCE for additional security
- **Token Storage:** Store tokens in secure session storage
- **Scope Limitation:** Request minimal required scopes

### Data Protection
- **PII Handling:** Store minimal YouTube user data
- **Duplicate Prevention:** Hash YouTube channel IDs
- **Rate Limiting:** Implement aggressive rate limits
- **Input Validation:** Validate all inputs thoroughly

### API Security
- **JWT Verification:** Verify user tokens on all requests
- **Role-Based Access:** Restrict to 'investor' role
- **Error Handling:** Don't expose internal errors
- **Audit Logging:** Log all challenge completions

## Testing Strategy

### Unit Tests

#### Backend Tests
```javascript
// Service Tests
- youtubeAuthUrlGeneratorHelper generates valid URL
- youtubeCallbackHelper exchanges code for token
- subscribeToChannelOnYouTubeHelper handles subscription
- Duplicate prevention works correctly
- Error handling for API failures

// Controller Tests
- Controllers call services with correct parameters
- Error responses handled properly
- Response format matches standards

// Validation Tests
- Invalid challenge IDs rejected
- Missing OAuth codes handled
- CSRF protection works
```

#### Frontend Tests
```javascript
// Component Tests
- YouTube button renders correctly
- OAuth flow initiated properly
- Callback handling works
- Error states displayed
- Success states update UI
```

### Integration Tests

```javascript
// End-to-End Flow
1. User clicks "Subscribe to YouTube"
2. OAuth authorization completed
3. Subscription created/verified
4. Challenge marked complete
5. Flip cards revealed
6. XP points awarded
```

### Manual Testing Checklist

- [ ] OAuth flow works in different browsers
- [ ] Mobile responsiveness
- [ ] Error handling for network failures
- [ ] Duplicate claim prevention
- [ ] Challenge expiration handling
- [ ] Rate limiting effectiveness

## Rollout Plan

### Phase 1: Backend Implementation
- Service layer development
- Controller and routes
- Validation and rate limiting
- Backend testing

### Phase 2: Frontend Implementation
- API integration
- UI components
- State management
- Frontend testing

### Phase 3: Integration & Testing
- End-to-end testing
- Security audit
- Performance testing
- Bug fixes

### Phase 4: Deployment
- Staging deployment
- UAT testing
- Production deployment
- Monitoring setup

## Risk Analysis

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| YouTube API rate limits | High | Medium | Implement caching, queue system |
| OAuth token expiration | Medium | High | Implement token refresh |
| API deprecation | High | Low | Monitor API changelog |
| Duplicate claims | Medium | Medium | Strong validation logic |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| User confusion | Medium | Medium | Clear UI/UX design |
| Low adoption | Medium | Low | Marketing campaign |
| Support burden | Low | Medium | FAQ documentation |

## Success Metrics

### Technical Metrics
- API response time < 2 seconds
- OAuth success rate > 95%
- Zero duplicate claims
- Error rate < 1%

### Business Metrics
- Challenge completion rate > 60%
- User satisfaction score > 4/5
- Minimal support tickets
- Positive channel subscriber growth

## Dependencies

### External Dependencies
- YouTube Data API v3 availability
- OAuth2 service stability
- Network connectivity

### Internal Dependencies
- Challenge management system
- Flip card distribution system
- User authentication system
- MongoDB database

## Documentation Requirements

### API Documentation
- OpenAPI/Swagger specification
- Postman collection
- Integration guide

### User Documentation
- How-to guide for users
- FAQ section
- Troubleshooting guide

### Developer Documentation
- Code comments
- Architecture diagrams
- Deployment guide

## Approval Requirements

- [ ] Technical Lead approval
- [ ] Product Manager approval
- [ ] Security review completed
- [ ] QA sign-off
- [ ] DevOps readiness

## Appendix

### A. YouTube API Reference
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [OAuth 2.0 for Mobile & Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Subscriptions Resource](https://developers.google.com/youtube/v3/docs/subscriptions)

### B. Existing Implementation References
- Twitter Service: `/api/services/twitter.service.js`
- Discord Service: `/api/services/discord.service.js`
- Telegram Service: `/api/services/telegram.service.js`

### C. Environment Setup

```bash
# Required npm packages
npm install googleapis
npm install google-auth-library

# Environment variables
YOUTUBE_CLIENT_ID=xxx.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-xxx
YOUTUBE_CALLBACK_URL=https://api.penomo.io/api/youtube/callback
YOUTUBE_API_KEY=AIzaSyXXX
YOUTUBE_CHANNEL_ID=UC_penomo_channel_id
```

---

**Document Version:** 1.0  
**Last Updated:** September 9, 2025  
**Next Review:** Upon implementation completion