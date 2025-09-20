# Claude Code Slash Command Ideas for Penomo API

This document contains an extensive list of slash command suggestions specifically tailored to our Node.js Express API tech stack and development processes. These commands can automate standard workflows and improve development efficiency.

## 🚀 **Project Initialization & Setup**

### `/init-express-api`
Sets up a new Express.js API project with your standard tech stack (MongoDB, JWT, Socket.IO, AWS integrations)

### `/setup-env`
Creates comprehensive `.env` template with all required variables for MongoDB, AWS services, Web3Auth, social APIs

### `/init-testing`
Configures Jest testing environment with MongoDB Memory Server, Supertest, and coverage reporting

### `/setup-docker`
Creates Dockerfile and docker-compose.yml for local development with MongoDB and Redis containers

## 📁 **Code Generation & Scaffolding**

### `/create-model`
Generates Mongoose schema with validation, middleware, and standard fields (createdAt, updatedAt, deletedAt)

### `/create-controller`
Creates Express controller with standard CRUD operations, error handling, and response formatters

### `/create-service`
Generates service layer with business logic, transaction management, and external integrations

### `/create-route`
Creates Express route with middleware, validation, rate limiting, and authentication

### `/create-validator`
Generates express-validator schema for request validation

### `/create-middleware`
Creates custom middleware with error handling and logging

### `/create-api-endpoint`
Full-stack API endpoint creation (route + controller + service + validation + tests)

## 🧪 **Testing & Quality Assurance**

### `/generate-tests`
Creates comprehensive test suite for controllers, services, and routes with mocked dependencies

### `/test-api-endpoint`
Generates integration tests for API endpoints using Supertest

### `/test-auth-flow`
Creates tests for JWT authentication and Web3Auth integration

### `/mock-external-services`
Sets up mocks for AWS services, email providers, and third-party APIs

### `/coverage-report`
Runs Jest coverage analysis and generates detailed reports

### `/test-db-operations`
Creates tests for MongoDB operations with memory server

## 🔒 **Security & Authentication**

### `/security-audit`
Comprehensive security scan for dependencies, code vulnerabilities, and configuration issues

### `/auth-setup`
Configures JWT authentication with Web3Auth integration and role-based permissions

### `/api-key-management`
Sets up master API key authentication and rotation strategies

### `/rate-limit-config`
Configures dynamic rate limiting for different endpoints and user types

### `/security-headers`
Sets up Helmet.js with CSP configuration and security best practices

### `/input-validation`
Implements comprehensive input validation and sanitization

## 🗄️ **Database & Data Management**

### `/mongo-migration`
Creates MongoDB migration scripts for schema changes

### `/seed-database`
Generates database seeding scripts for development and testing

### `/optimize-queries`
Analyzes and optimizes MongoDB queries and indexes

### `/backup-strategy`
Sets up automated database backup and restore procedures

### `/data-validation`
Creates data integrity checks and validation scripts

## ☁️ **AWS & Cloud Services**

### `/s3-integration`
Sets up AWS S3 file upload with CloudFront CDN and signed URLs

### `/ses-email-setup`
Configures AWS SES with Pug email templates and delivery tracking

### `/cloudfront-config`
Optimizes CloudFront distribution for file delivery and caching

### `/aws-secrets`
Manages AWS Secrets Manager integration for sensitive configuration

## 🔄 **Git & Version Control**

### `/commit-smart`
Creates intelligent conventional commits based on file changes and diff analysis

### `/create-feature-branch`
Creates feature branch with standard naming conventions and sets upstream

### `/pr-template`
Generates pull request with comprehensive description, test plan, and review checklist

### `/release-notes`
Automatically generates release notes from commit history and PR descriptions

### `/hotfix-deploy`
Quick hotfix workflow with immediate deployment and rollback capability

## 🚀 **CI/CD & Deployment**

### `/docker-build`
Builds optimized Docker images with multi-stage builds and security scanning

### `/deploy-staging`
Deploys to staging environment with health checks and rollback capability

### `/deploy-production`
Production deployment with blue-green strategy and monitoring

### `/health-check`
Creates comprehensive health check endpoints for load balancers

### `/monitoring-setup`
Configures application monitoring with logging and alerting

## 📊 **Performance & Optimization**

### `/performance-audit`
Analyzes API performance, identifies bottlenecks, and suggests optimizations

### `/bundle-analysis`
Analyzes dependency bundles and identifies optimization opportunities

### `/memory-profiling`
Profiles memory usage and identifies potential leaks

### `/load-testing`
Sets up load testing scenarios for API endpoints

### `/caching-strategy`
Implements caching layers for database queries and API responses

## 🔧 **Development Tools**

### `/lint-fix`
Runs ESLint with auto-fix for code quality and consistency

### `/format-code`
Applies Prettier formatting across the entire codebase

### `/dependency-update`
Updates npm dependencies with security and compatibility checks

### `/dev-server`
Starts development server with hot reload and debugging enabled

### `/api-docs`
Generates API documentation from code comments and OpenAPI specs

## 📱 **Socket.IO & Real-time Features**

### `/socket-setup`
Configures Socket.IO with JWT authentication and room management

### `/real-time-events`
Creates real-time event handlers for notifications and updates

### `/socket-testing`
Sets up testing for Socket.IO events and connections

## 🎯 **Business Logic Specific**

### `/investment-workflow`
Creates investment transaction processing with quarterly interest calculations

### `/kyc-document-flow`
Sets up KYC document upload, validation, and approval workflow

### `/notification-system`
Implements email and in-app notification system with templates

### `/gamification-features`
Creates challenge and XP system for user engagement

### `/payment-integration`
Sets up payment processing with transaction logging and reconciliation

## 🤖 **AI & Automation**

### `/ai-dd-setup`
Configures AI-based Due Diligence system with AWS Textract integration

### `/automated-testing`
Sets up automated test generation and execution

### `/code-review-bot`
Creates automated code review with quality checks and suggestions

## 📋 **Documentation & Maintenance**

### `/api-changelog`
Maintains API changelog with version tracking and breaking changes

### `/architecture-docs`
Generates architecture documentation with diagrams and dependencies

### `/troubleshooting-guide`
Creates troubleshooting documentation for common issues

### `/maintenance-tasks`
Sets up automated maintenance tasks and cleanup jobs

## 🔍 **Debugging & Analysis**

### `/debug-api`
Comprehensive API debugging with request/response logging and error tracking

### `/analyze-logs`
Analyzes application logs for patterns, errors, and performance issues

### `/dependency-graph`
Visualizes project dependencies and identifies circular dependencies

### `/error-tracking`
Sets up comprehensive error tracking and alerting system

## 🏃‍♂️ **Sprint Planning & Management Commands**

*These commands enable the comprehensive sprint management strategy outlined in our sprint planning documentation.*

### `/create-spec`
Generates comprehensive technical specifications from business requirements with codebase analysis and consistency checks

### `/analyze-requirements`
Converts high-level stakeholder goals into actionable technical specifications with database design and security planning

### `/break-down-tasks`
Decomposes specifications into development-ready tasks with dependency analysis and effort estimation

### `/create-github-tickets`
Creates structured GitHub issues from specifications with proper labeling, assignment, and sprint organization

### `/generate-notion-data`
Exports ticket data in formats compatible with Notion import (CSV/JSON) with all required properties

### `/setup-notion-sync`
Configures bidirectional GitHub-Notion synchronization with webhooks and API integration scripts

### `/create-sprint-template`
Generates standardized sprint template structure with ticket templates and workflow definitions

### `/sprint-init`
Initializes a new sprint with ticket creation, branch setup, and team assignments from specifications

### `/sprint-status`
Provides real-time sprint progress analysis with burndown data, velocity tracking, and blocker identification

### `/generate-sprint-report`
Creates comprehensive sprint reports for stakeholders with progress summaries and delivery timelines

### `/create-feature-branch`
Auto-creates feature branches with proper naming conventions and links to corresponding tickets

### `/scaffold-implementation`
Generates implementation stubs and boilerplate code following project patterns for specific tickets

### `/create-pr-template`
Generates pull request templates with acceptance criteria and quality gate checklists

### `/track-dependencies`
Analyzes and visualizes task dependencies with critical path identification

### `/estimate-complexity`
Provides effort estimation based on codebase complexity analysis and historical velocity data

### `/setup-quality-gates`
Configures automated quality checks, testing pipelines, and code coverage requirements

### `/generate-acceptance-criteria`
Creates detailed acceptance criteria from user stories with testable conditions

### `/velocity-analysis`
Analyzes historical team velocity to suggest realistic sprint goals and capacity planning

### `/blocker-detection`
Automated detection of potential blockers, dependencies, and risks in current sprint

### `/cross-team-sync`
Manages and communicates inter-team dependencies and shared deliverables

### `/release-notes-generate`
Automatically generates release notes from completed sprint tickets and merged PRs

### `/technical-debt-report`
Tracks and reports technical debt status with remediation planning

### `/stakeholder-summary`
Generates executive-level sprint progress summaries for non-technical stakeholders

## Implementation Notes

These commands are specifically designed for our Node.js Express API stack and can automate the most common workflows in our development process, from initial setup to production deployment and maintenance.

To implement any of these commands:
1. Create a markdown file in `.claude/commands/` with the command name
2. Include the command description and implementation details
3. Use `$ARGUMENTS` placeholder for dynamic parameters
4. Prefix bash commands with `!` for execution
5. Reference files with `@` prefix when needed

Example command structure:
```markdown
---
description: Brief description of what the command does
---
# Command Implementation

Detailed instructions for Claude on how to execute this command.

!bash command if needed
```