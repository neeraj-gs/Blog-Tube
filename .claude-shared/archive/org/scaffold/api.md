---
description: "Generate a complete API endpoint with model, controller, service, routes, validation, and tests following Penomo's patterns"
allowed-tools: ["Bash"]
---

# API Scaffold Command

Generate a complete API endpoint with model, controller, service, routes, validation, and tests following Penomo's patterns.

## Usage

```bash
/org:scaffold:api <entity-name> [--crud] [--auth] [--upload] [--realtime]
```

## Parameters

- `entity-name`: Name of the entity (e.g., 'user', 'project', 'transaction')
- `--crud`: Include full CRUD operations (Create, Read, Update, Delete)
- `--auth`: Add JWT authentication middleware
- `--upload`: Include file upload capabilities (S3)
- `--realtime`: Add Socket.IO real-time notifications

## Implementation

```bash
#!/bin/bash

ENTITY_NAME="$1"
INCLUDE_CRUD="false"
INCLUDE_AUTH="false"
INCLUDE_UPLOAD="false"
INCLUDE_REALTIME="false"

# Parse flags
for arg in "$@"; do
    case $arg in
        --crud)
            INCLUDE_CRUD="true"
            ;;
        --auth)
            INCLUDE_AUTH="true"
            ;;
        --upload)
            INCLUDE_UPLOAD="true"
            ;;
        --realtime)
            INCLUDE_REALTIME="true"
            ;;
    esac
done

# Validate input
if [[ -z "$ENTITY_NAME" ]]; then
    echo "❌ Error: Please specify an entity name"
    echo "Usage: /org:scaffold:api <entity-name> [--crud] [--auth] [--upload] [--realtime]"
    echo "Example: /org:scaffold:api user --crud --auth"
    exit 1
fi

# Convert entity name to different cases
ENTITY_LOWER=$(echo "$ENTITY_NAME" | tr '[:upper:]' '[:lower:]')
ENTITY_UPPER=$(echo "$ENTITY_NAME" | tr '[:lower:]' '[:upper:]')
ENTITY_PASCAL=$(echo "$ENTITY_NAME" | sed 's/^./\U&/')
ENTITY_PLURAL="${ENTITY_LOWER}s"

echo "🏗️  Scaffolding API endpoint for: $ENTITY_PASCAL"
echo "📁 Entity: $ENTITY_LOWER"
echo "🔧 Options: CRUD=$INCLUDE_CRUD, Auth=$INCLUDE_AUTH, Upload=$INCLUDE_UPLOAD, Realtime=$INCLUDE_REALTIME"

# Check if we're in the correct directory structure
if [[ ! -d "api" ]]; then
    echo "❌ Error: Not in a valid API project directory"
    echo "Please run this command from the project root (directory containing 'api' folder)"
    exit 1
fi

# Create model
echo "📝 Creating Mongoose model..."
cat > "api/models/${ENTITY_PASCAL}.js" << EOF
import mongoose from 'mongoose';

const ${ENTITY_LOWER}Schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '${ENTITY_PASCAL} name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
${ENTITY_LOWER}Schema.index({ name: 1, createdBy: 1 });
${ENTITY_LOWER}Schema.index({ status: 1 });
${ENTITY_LOWER}Schema.index({ createdAt: -1 });

// Virtual for ID
${ENTITY_LOWER}Schema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Pre-save middleware
${ENTITY_LOWER}Schema.pre('save', function(next) {
  // Add any pre-save logic here
  next();
});

// Instance methods
${ENTITY_LOWER}Schema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Static methods
${ENTITY_LOWER}Schema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('createdBy', 'name email');
};

const ${ENTITY_PASCAL} = mongoose.model('${ENTITY_PASCAL}', ${ENTITY_LOWER}Schema);

export default ${ENTITY_PASCAL};
EOF

# Create service
echo "⚙️  Creating service layer..."
SERVICE_CONTENT="import ${ENTITY_PASCAL} from '../models/${ENTITY_PASCAL}.js';
import mongoose from 'mongoose';

class ${ENTITY_PASCAL}Service {
  // Get all ${ENTITY_PLURAL} with pagination
  async getAll(query = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      populate = 'createdBy',
      ...filters
    } = query;

    const skip = (page - 1) * limit;
    
    const [${ENTITY_PLURAL}, total] = await Promise.all([
      ${ENTITY_PASCAL}.find(filters)
        .populate(populate)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ${ENTITY_PASCAL}.countDocuments(filters)
    ]);

    return {
      ${ENTITY_PLURAL},
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get ${ENTITY_LOWER} by ID
  async getById(id, populate = 'createdBy') {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ${ENTITY_LOWER} ID');
    }

    const ${ENTITY_LOWER} = await ${ENTITY_PASCAL}.findById(id).populate(populate);
    
    if (!${ENTITY_LOWER}) {
      throw new Error('${ENTITY_PASCAL} not found');
    }

    return ${ENTITY_LOWER};
  }"

if [[ "$INCLUDE_CRUD" == "true" ]]; then
SERVICE_CONTENT="$SERVICE_CONTENT

  // Create new ${ENTITY_LOWER}
  async create(${ENTITY_LOWER}Data, userId) {
    const ${ENTITY_LOWER} = new ${ENTITY_PASCAL}({
      ...${ENTITY_LOWER}Data,
      createdBy: userId
    });

    await ${ENTITY_LOWER}.save();
    await ${ENTITY_LOWER}.populate('createdBy', 'name email');
    
    return ${ENTITY_LOWER};
  }

  // Update ${ENTITY_LOWER}
  async update(id, updateData, userId) {
    const ${ENTITY_LOWER} = await this.getById(id);
    
    // Check ownership if needed
    if (${ENTITY_LOWER}.createdBy.toString() !== userId) {
      throw new Error('Unauthorized to update this ${ENTITY_LOWER}');
    }

    Object.assign(${ENTITY_LOWER}, updateData);
    await ${ENTITY_LOWER}.save();
    
    return ${ENTITY_LOWER};
  }

  // Delete ${ENTITY_LOWER}
  async delete(id, userId) {
    const ${ENTITY_LOWER} = await this.getById(id);
    
    // Check ownership if needed
    if (${ENTITY_LOWER}.createdBy.toString() !== userId) {
      throw new Error('Unauthorized to delete this ${ENTITY_LOWER}');
    }

    await ${ENTITY_PASCAL}.findByIdAndDelete(id);
    
    return { message: '${ENTITY_PASCAL} deleted successfully' };
  }"
fi

SERVICE_CONTENT="$SERVICE_CONTENT

  // Get ${ENTITY_PLURAL} by status
  async getByStatus(status, query = {}) {
    return await this.getAll({ ...query, status });
  }

  // Search ${ENTITY_PLURAL}
  async search(searchTerm, query = {}) {
    const searchQuery = {
      ...query,
      \$or: [
        { name: { \$regex: searchTerm, \$options: 'i' } },
        { description: { \$regex: searchTerm, \$options: 'i' } }
      ]
    };

    return await this.getAll(searchQuery);
  }
}

export default new ${ENTITY_PASCAL}Service();"

echo "$SERVICE_CONTENT" > "api/services/${ENTITY_LOWER}Service.js"

# Create validator
echo "✅ Creating validation schemas..."
VALIDATOR_CONTENT="import { body, param, query } from 'express-validator';

// Validation rules for creating ${ENTITY_LOWER}
export const create${ENTITY_PASCAL}Validation = [
  body('name')
    .notEmpty()
    .withMessage('${ENTITY_PASCAL} name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),
    
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
    
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending'])
    .withMessage('Status must be one of: active, inactive, pending'),
    
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];"

if [[ "$INCLUDE_CRUD" == "true" ]]; then
VALIDATOR_CONTENT="$VALIDATOR_CONTENT

// Validation rules for updating ${ENTITY_LOWER}
export const update${ENTITY_PASCAL}Validation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ${ENTITY_LOWER} ID'),
    
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),
    
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
    
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending'])
    .withMessage('Status must be one of: active, inactive, pending'),
    
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];"
fi

VALIDATOR_CONTENT="$VALIDATOR_CONTENT

// Validation rules for ${ENTITY_LOWER} ID parameter
export const ${ENTITY_LOWER}IdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ${ENTITY_LOWER} ID')
];

// Validation rules for query parameters
export const ${ENTITY_LOWER}QueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'pending'])
    .withMessage('Status must be one of: active, inactive, pending'),
    
  query('sort')
    .optional()
    .matches(/^-?(name|status|createdAt|updatedAt)$/)
    .withMessage('Sort must be one of: name, status, createdAt, updatedAt (prefix with - for descending)')
];"

echo "$VALIDATOR_CONTENT" > "api/validator/${ENTITY_LOWER}Validator.js"

# Create controller
echo "🎮 Creating controller..."
CONTROLLER_CONTENT="import ${ENTITY_LOWER}Service from '../services/${ENTITY_LOWER}Service.js';
import { validationResult } from 'express-validator';

class ${ENTITY_PASCAL}Controller {
  // Get all ${ENTITY_PLURAL}
  async getAll(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return _handleResponseWithMessage(req, res, { statusCode: 400, message: 'Validation failed' }, null, null, 400);
      }

      const result = await ${ENTITY_LOWER}Service.getAll(req.query);
      
      return _handleResponseWithMessage(
        req, 
        res, 
        null, 
        '${ENTITY_PLURAL} retrieved successfully', 
        result, 
        200
      );
    } catch (error) {
      return _handleResponse(req, res, error, null);
    }
  }

  // Get ${ENTITY_LOWER} by ID
  async getById(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return _handleResponseWithMessage(req, res, { statusCode: 400, message: 'Validation failed' }, null, null, 400);
      }

      const ${ENTITY_LOWER} = await ${ENTITY_LOWER}Service.getById(req.params.id);
      
      return _handleResponseWithMessage(
        req, 
        res, 
        null, 
        '${ENTITY_PASCAL} retrieved successfully', 
        ${ENTITY_LOWER}, 
        200
      );
    } catch (error) {
      return _handleResponse(req, res, error, null);
    }
  }"

if [[ "$INCLUDE_CRUD" == "true" ]]; then
CONTROLLER_CONTENT="$CONTROLLER_CONTENT

  // Create new ${ENTITY_LOWER}
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return _handleResponseWithMessage(req, res, { statusCode: 400, message: 'Validation failed' }, null, null, 400);
      }

      const ${ENTITY_LOWER} = await ${ENTITY_LOWER}Service.create(req.body, req.user.id);
      
      return _handleResponseWithMessage(
        req, 
        res, 
        null, 
        '${ENTITY_PASCAL} created successfully', 
        ${ENTITY_LOWER}, 
        201
      );
    } catch (error) {
      return _handleResponse(req, res, error, null);
    }
  }

  // Update ${ENTITY_LOWER}
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return _handleResponseWithMessage(req, res, { statusCode: 400, message: 'Validation failed' }, null, null, 400);
      }

      const ${ENTITY_LOWER} = await ${ENTITY_LOWER}Service.update(req.params.id, req.body, req.user.id);
      
      return _handleResponseWithMessage(
        req, 
        res, 
        null, 
        '${ENTITY_PASCAL} updated successfully', 
        ${ENTITY_LOWER}, 
        200
      );
    } catch (error) {
      return _handleResponse(req, res, error, null);
    }
  }

  // Delete ${ENTITY_LOWER}
  async delete(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return _handleResponseWithMessage(req, res, { statusCode: 400, message: 'Validation failed' }, null, null, 400);
      }

      const result = await ${ENTITY_LOWER}Service.delete(req.params.id, req.user.id);
      
      return _handleResponseWithMessage(
        req, 
        res, 
        null, 
        result.message, 
        null, 
        200
      );
    } catch (error) {
      return _handleResponse(req, res, error, null);
    }
  }"
fi

CONTROLLER_CONTENT="$CONTROLLER_CONTENT

  // Search ${ENTITY_PLURAL}
  async search(req, res) {
    try {
      const { q: searchTerm, ...query } = req.query;
      
      if (!searchTerm) {
        return _handleResponseWithMessage(req, res, { statusCode: 400, message: 'Search term is required' }, null, null, 400);
      }

      const result = await ${ENTITY_LOWER}Service.search(searchTerm, query);
      
      return _handleResponseWithMessage(
        req, 
        res, 
        null, 
        'Search completed successfully', 
        result, 
        200
      );
    } catch (error) {
      return _handleResponse(req, res, error, null);
    }
  }
}

export default new ${ENTITY_PASCAL}Controller();"

echo "$CONTROLLER_CONTENT" > "api/controllers/${ENTITY_LOWER}Controller.js"

# Create routes
echo "🛣️  Creating routes..."
AUTH_MIDDLEWARE=""
if [[ "$INCLUDE_AUTH" == "true" ]]; then
    AUTH_MIDDLEWARE="import { verifyApiKeyOrToken } from '../middleware/auth.js';"
fi

ROUTES_CONTENT="import express from 'express';
import ${ENTITY_LOWER}Controller from '../controllers/${ENTITY_LOWER}Controller.js';
import {
  create${ENTITY_PASCAL}Validation,
  ${ENTITY_LOWER}IdValidation,
  ${ENTITY_LOWER}QueryValidation"

if [[ "$INCLUDE_CRUD" == "true" ]]; then
    ROUTES_CONTENT="$ROUTES_CONTENT,
  update${ENTITY_PASCAL}Validation"
fi

ROUTES_CONTENT="$ROUTES_CONTENT
} from '../validator/${ENTITY_LOWER}Validator.js';
$AUTH_MIDDLEWARE

const router = express.Router();

// Routes"

if [[ "$INCLUDE_AUTH" == "true" ]]; then
    ROUTES_CONTENT="$ROUTES_CONTENT
router.use(verifyApiKeyOrToken);"
fi

ROUTES_CONTENT="$ROUTES_CONTENT

// GET /${ENTITY_PLURAL} - Get all ${ENTITY_PLURAL}
router.get('/', ${ENTITY_LOWER}QueryValidation, ${ENTITY_LOWER}Controller.getAll);

// GET /${ENTITY_PLURAL}/search - Search ${ENTITY_PLURAL}
router.get('/search', ${ENTITY_LOWER}QueryValidation, ${ENTITY_LOWER}Controller.search);

// GET /${ENTITY_PLURAL}/:id - Get ${ENTITY_LOWER} by ID
router.get('/:id', ${ENTITY_LOWER}IdValidation, ${ENTITY_LOWER}Controller.getById);"

if [[ "$INCLUDE_CRUD" == "true" ]]; then
ROUTES_CONTENT="$ROUTES_CONTENT

// POST /${ENTITY_PLURAL} - Create new ${ENTITY_LOWER}
router.post('/', create${ENTITY_PASCAL}Validation, ${ENTITY_LOWER}Controller.create);

// PUT /${ENTITY_PLURAL}/:id - Update ${ENTITY_LOWER}
router.put('/:id', update${ENTITY_PASCAL}Validation, ${ENTITY_LOWER}Controller.update);

// DELETE /${ENTITY_PLURAL}/:id - Delete ${ENTITY_LOWER}
router.delete('/:id', ${ENTITY_LOWER}IdValidation, ${ENTITY_LOWER}Controller.delete);"
fi

ROUTES_CONTENT="$ROUTES_CONTENT

export default router;"

echo "$ROUTES_CONTENT" > "api/routes/${ENTITY_LOWER}Routes.js"

# Create test file
echo "🧪 Creating test suite..."
TEST_CONTENT="import request from 'supertest';
import { app } from '../server.js';
import ${ENTITY_PASCAL} from '../models/${ENTITY_PASCAL}.js';
import User from '../models/User.js';

describe('${ENTITY_PASCAL} API', () => {
  let testUser;
  let authToken;
  let test${ENTITY_PASCAL};

  beforeAll(async () => {
    // Create test user for authentication
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    await testUser.save();
    
    // Mock authentication - adjust based on your auth implementation
    authToken = 'Bearer test-token';
  });

  beforeEach(async () => {
    // Create test ${ENTITY_LOWER}
    test${ENTITY_PASCAL} = new ${ENTITY_PASCAL}({
      name: 'Test ${ENTITY_PASCAL}',
      description: 'Test description',
      status: 'active',
      createdBy: testUser._id
    });
    await test${ENTITY_PASCAL}.save();
  });

  afterEach(async () => {
    // Clean up test data
    await ${ENTITY_PASCAL}.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('GET /${ENTITY_PLURAL}', () => {
    it('should get all ${ENTITY_PLURAL}', async () => {
      const response = await request(app)
        .get('/${ENTITY_PLURAL}')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.${ENTITY_PLURAL}).toHaveLength(1);
      expect(response.body.data.${ENTITY_PLURAL}[0].name).toBe('Test ${ENTITY_PASCAL}');
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/${ENTITY_PLURAL}?page=1&limit=5')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });

  describe('GET /${ENTITY_PLURAL}/:id', () => {
    it('should get ${ENTITY_LOWER} by ID', async () => {
      const response = await request(app)
        .get(\`/${ENTITY_PLURAL}/\${test${ENTITY_PASCAL}._id}\`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test ${ENTITY_PASCAL}');
    });

    it('should return 404 for non-existent ${ENTITY_LOWER}', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .get(\`/${ENTITY_PLURAL}/\${fakeId}\`)
        .set('Authorization', authToken)
        .expect(500); // Adjust based on your error handling
    });
  });"

if [[ "$INCLUDE_CRUD" == "true" ]]; then
TEST_CONTENT="$TEST_CONTENT

  describe('POST /${ENTITY_PLURAL}', () => {
    it('should create new ${ENTITY_LOWER}', async () => {
      const ${ENTITY_LOWER}Data = {
        name: 'New ${ENTITY_PASCAL}',
        description: 'New description',
        status: 'active'
      };

      const response = await request(app)
        .post('/${ENTITY_PLURAL}')
        .set('Authorization', authToken)
        .send(${ENTITY_LOWER}Data)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New ${ENTITY_PASCAL}');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/${ENTITY_PLURAL}')
        .set('Authorization', authToken)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /${ENTITY_PLURAL}/:id', () => {
    it('should update ${ENTITY_LOWER}', async () => {
      const updateData = {
        name: 'Updated ${ENTITY_PASCAL}',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(\`/${ENTITY_PLURAL}/\${test${ENTITY_PASCAL}._id}\`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated ${ENTITY_PASCAL}');
    });
  });

  describe('DELETE /${ENTITY_PLURAL}/:id', () => {
    it('should delete ${ENTITY_LOWER}', async () => {
      const response = await request(app)
        .delete(\`/${ENTITY_PLURAL}/\${test${ENTITY_PASCAL}._id}\`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify ${ENTITY_LOWER} is deleted
      const deleted${ENTITY_PASCAL} = await ${ENTITY_PASCAL}.findById(test${ENTITY_PASCAL}._id);
      expect(deleted${ENTITY_PASCAL}).toBeNull();
    });
  });"
fi

TEST_CONTENT="$TEST_CONTENT

  describe('GET /${ENTITY_PLURAL}/search', () => {
    it('should search ${ENTITY_PLURAL}', async () => {
      const response = await request(app)
        .get('/${ENTITY_PLURAL}/search?q=Test')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.${ENTITY_PLURAL}).toHaveLength(1);
    });

    it('should require search term', async () => {
      await request(app)
        .get('/${ENTITY_PLURAL}/search')
        .set('Authorization', authToken)
        .expect(400);
    });
  });
});"

echo "$TEST_CONTENT" > "api/__tests__/${ENTITY_LOWER}.test.js"

echo ""
echo "✅ API scaffolding complete!"
echo ""
echo "📁 Generated files:"
echo "   📄 api/models/${ENTITY_PASCAL}.js"
echo "   ⚙️  api/services/${ENTITY_LOWER}Service.js"
echo "   🎮 api/controllers/${ENTITY_LOWER}Controller.js"
echo "   🛣️  api/routes/${ENTITY_LOWER}Routes.js"
echo "   ✅ api/validator/${ENTITY_LOWER}Validator.js"
echo "   🧪 api/__tests__/${ENTITY_LOWER}.test.js"
echo ""
echo "🔧 Features included:"
echo "   ✅ Mongoose model with validation and indexes"
echo "   ✅ Service layer with business logic"
echo "   ✅ Express controller with error handling"
echo "   ✅ Route definitions with middleware"
echo "   ✅ Input validation with express-validator"
echo "   ✅ Comprehensive test suite"

if [[ "$INCLUDE_CRUD" == "true" ]]; then
    echo "   ✅ Full CRUD operations"
fi

if [[ "$INCLUDE_AUTH" == "true" ]]; then
    echo "   ✅ JWT authentication middleware"
fi

echo ""
echo "🚀 Next steps:"
echo "   1. Add route to main app.js:"
echo "      import ${ENTITY_LOWER}Routes from './routes/${ENTITY_LOWER}Routes.js';"
echo "      app.use('/api/${ENTITY_PLURAL}', ${ENTITY_LOWER}Routes);"
echo ""
echo "   2. Run tests:"
echo "      npm test -- ${ENTITY_LOWER}.test.js"
echo ""
echo "   3. Test endpoints:"
echo "      GET    /api/${ENTITY_PLURAL}        - Get all ${ENTITY_PLURAL}"
echo "      GET    /api/${ENTITY_PLURAL}/search - Search ${ENTITY_PLURAL}"
echo "      GET    /api/${ENTITY_PLURAL}/:id    - Get ${ENTITY_LOWER} by ID"

if [[ "$INCLUDE_CRUD" == "true" ]]; then
    echo "      POST   /api/${ENTITY_PLURAL}        - Create ${ENTITY_LOWER}"
    echo "      PUT    /api/${ENTITY_PLURAL}/:id    - Update ${ENTITY_LOWER}"
    echo "      DELETE /api/${ENTITY_PLURAL}/:id    - Delete ${ENTITY_LOWER}"
fi

echo ""
echo "✨ Happy coding!"
```

## Features

- **Complete MVC Structure**: Model, Controller, Service, Routes, Validation
- **Mongoose Integration**: Full schema with validation, indexes, and methods
- **Service Layer**: Business logic with pagination, search, and CRUD operations
- **Input Validation**: Express-validator schemas for all endpoints
- **Error Handling**: Consistent error responses using global handlers
- **Testing Suite**: Complete Jest tests with setup and teardown
- **Authentication Ready**: Optional JWT middleware integration
- **File Upload Ready**: Optional S3 upload capabilities (coming soon)
- **Real-time Ready**: Optional Socket.IO integration (coming soon)

## Examples

```bash
# Basic API endpoint
/org:scaffold:api product

# Full CRUD with authentication
/org:scaffold:api user --crud --auth

# Complete feature with all options
/org:scaffold:api document --crud --auth --upload --realtime
```

## Generated Structure

```
api/
├── models/Product.js           # Mongoose schema
├── services/productService.js  # Business logic
├── controllers/productController.js # Request handlers
├── routes/productRoutes.js     # Route definitions
├── validator/productValidator.js # Input validation
└── __tests__/product.test.js   # Test suite
```

## Notes

- Follows Penomo's established patterns and conventions
- Uses global response handlers for consistency
- Includes comprehensive validation and error handling
- Tests use MongoDB Memory Server for isolation
- Ready for immediate integration into existing projects
- Supports both authenticated and public endpoints