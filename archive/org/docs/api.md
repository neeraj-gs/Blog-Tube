---
description: Generate API documentation from routes and controllers
---

# API Documentation Generator

Automatically generates API documentation by analyzing route definitions, controllers, and middleware in the Express.js application.

## Documentation Generation Process

### 1. Route Discovery
!echo "🔍 Discovering API routes..."
!echo "## API Endpoints" > API_DOCS.md
!echo "" >> API_DOCS.md
!echo "Generated on $(date)" >> API_DOCS.md
!echo "" >> API_DOCS.md

### 2. Extract Routes from Files
!echo "📋 Extracting routes from route files..."
!find routes/ -name "*.js" -type f | while read file; do
!  echo "### Routes from $file" >> API_DOCS.md
!  grep -E "(router\.|app\.)(get|post|put|delete|patch)" "$file" | \
!    sed 's/.*\.\([A-Z]*\)[^"]*["\x27]\([^"]*\)["\x27].*/- \1 \2/' | \
!    tr '[:lower:]' '[:upper:]' >> API_DOCS.md
!  echo "" >> API_DOCS.md
!done

### 3. Middleware Analysis
!echo "🔧 Analyzing middleware usage..."
!echo "## Middleware" >> API_DOCS.md
!grep -r "app\.use\|router\.use" --include="*.js" . | \
  grep -v node_modules | \
  cut -d: -f2- | \
  sort -u >> API_DOCS.md
!echo "" >> API_DOCS.md

### 4. Controller Methods
!echo "🎮 Documenting controller methods..."
!echo "## Controllers" >> API_DOCS.md
!find controllers/ -name "*.js" -type f 2>/dev/null | while read file; do
!  echo "### $(basename "$file" .js) Controller" >> API_DOCS.md
!  grep -E "^(exports\.|const |function )" "$file" | \
!    grep -v "require" | \
!    head -10 >> API_DOCS.md
!  echo "" >> API_DOCS.md
!done

### 5. Authentication Routes
!echo "🔐 Documenting authentication endpoints..."
!echo "## Authentication Endpoints" >> API_DOCS.md
!grep -r "login\|register\|auth\|token" --include="*.js" routes/ | \
  grep -E "(get|post|put|delete)" | \
  cut -d: -f2- >> API_DOCS.md
!echo "" >> API_DOCS.md

## API Analysis

### 6. Endpoint Statistics
!echo ""
!echo "📊 API endpoint analysis:"
!echo "- GET routes: $(grep -r "\.get(" --include="*.js" routes/ | wc -l)"
!echo "- POST routes: $(grep -r "\.post(" --include="*.js" routes/ | wc -l)"
!echo "- PUT routes: $(grep -r "\.put(" --include="*.js" routes/ | wc -l)"
!echo "- DELETE routes: $(grep -r "\.delete(" --include="*.js" routes/ | wc -l)"
!echo "- Total controllers: $(find controllers/ -name "*.js" -type f 2>/dev/null | wc -l)"

### 7. Security Middleware Check
!echo ""
!echo "🔒 Security middleware analysis:"
!grep -r "helmet\|cors\|rateLimit" --include="*.js" . | wc -l | xargs echo "- Security middleware instances:"
!grep -r "verifyToken\|authenticate\|authorize" --include="*.js" . | wc -l | xargs echo "- Authentication middleware instances:"

### 8. Validation Analysis
!echo ""
!echo "✅ Input validation analysis:"
!grep -r "express-validator\|joi\|yup" --include="*.js" . | wc -l | xargs echo "- Validation middleware instances:"

## Documentation Enhancement

### 9. Add API Standards
!cat >> API_DOCS.md << 'EOF'

## API Standards

### Response Format
All API responses follow this structure:
```json
{
  "success": boolean,
  "message": string,
  "data": object|array,
  "error": object (if success: false)
}
```

### Authentication
- **Bearer Token**: Include `Authorization: Bearer <token>` header
- **API Key**: Include `X-API-Key: <key>` header for admin endpoints
- **Master Key**: `MASTER_API_KEY` for administrative operations

### Error Codes
- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **429**: Too Many Requests (rate limited)
- **500**: Internal Server Error

### Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Authentication endpoints: 5 requests per 15 minutes per IP
- Admin endpoints: 50 requests per 15 minutes per IP

EOF

### 10. OpenAPI/Swagger Integration Check
!echo ""
!echo "📋 Checking for OpenAPI/Swagger integration..."
!grep -r "swagger\|openapi" --include="*.js" --include="*.json" . && echo "✅ OpenAPI/Swagger configuration found" || echo "ℹ️ No OpenAPI/Swagger configuration detected"

## Postman Collection Generation

### 11. Generate Postman Collection Template
!echo "📮 Generating Postman collection template..."
!cat > postman_collection_template.json << 'EOF'
{
  "info": {
    "name": "Penomo API Collection",
    "description": "Generated API collection for Penomo application",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "authToken",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": []
    },
    {
      "name": "Users",
      "item": []
    },
    {
      "name": "Projects",
      "item": []
    }
  ]
}
EOF

## Documentation Validation

### 12. Validate Generated Documentation
!echo ""
!echo "✅ Documentation validation:"
!echo "- API_DOCS.md created: $(test -f API_DOCS.md && echo "✅" || echo "❌")"
!echo "- Postman template created: $(test -f postman_collection_template.json && echo "✅" || echo "❌")"
!echo "- Documentation size: $(wc -l < API_DOCS.md) lines"

## Next Steps

!echo ""
!echo "📚 Documentation generation completed"
!echo ""
!echo "📋 Generated files:"
!echo "- API_DOCS.md: Basic API documentation"
!echo "- postman_collection_template.json: Postman collection template"
!echo ""
!echo "🔧 Recommended next steps:"
!echo "1. Review and enhance API_DOCS.md with descriptions"
!echo "2. Add request/response examples to documentation"
!echo "3. Configure Swagger/OpenAPI for interactive documentation"
!echo "4. Set up automated documentation generation in CI/CD"
!echo "5. Share Postman collection with frontend team"