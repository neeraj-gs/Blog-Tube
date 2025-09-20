#!/usr/bin/env node

/**
 * Claudia Notion Integration Client
 * Handles all Notion API operations for project management
 */

const { Client } = require('@notionhq/client');
const fs = require('fs').promises;
const path = require('path');

class ClaudiaNotionClient {
    constructor() {
        this.notion = null;
        this.config = null;
        this.initialized = false;
    }

    /**
     * Load environment variables from local.env file
     */
    loadLocalEnv() {
        try {
            const envPath = path.join(__dirname, '../../../local.env');
            const envContent = require('fs').readFileSync(envPath, 'utf8');
            
            // Parse environment variables
            envContent.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                    const [key, ...valueParts] = trimmed.split('=');
                    const value = valueParts.join('=');
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            });
            
            console.log('✅ Loaded local environment configuration');
        } catch (error) {
            console.log('ℹ️  No local.env file found - using system environment variables');
        }
    }

    /**
     * Initialize the Notion client with configuration
     */
    async initialize() {
        try {
            // Load local environment variables first
            this.loadLocalEnv();

            const configPath = path.join(__dirname, '../config/notion.json');
            const configData = await fs.readFile(configPath, 'utf8');
            this.config = JSON.parse(configData);

            // Get Notion token from environment or config
            const token = process.env.NOTION_TOKEN || this.config.token;
            if (!token || token.includes('placeholder') || token.includes('your-')) {
                throw new Error('Notion token not found. Set NOTION_TOKEN environment variable.');
            }

            // Override config database IDs with environment variables if available
            if (process.env.NOTION_TICKETS_DATABASE_ID && !process.env.NOTION_TICKETS_DATABASE_ID.includes('your-')) {
                this.config.databases.tickets = process.env.NOTION_TICKETS_DATABASE_ID;
            }
            if (process.env.NOTION_REQUIREMENTS_DATABASE_ID && !process.env.NOTION_REQUIREMENTS_DATABASE_ID.includes('your-')) {
                this.config.databases.requirements = process.env.NOTION_REQUIREMENTS_DATABASE_ID;
            }
            if (process.env.NOTION_COMMITS_DATABASE_ID && !process.env.NOTION_COMMITS_DATABASE_ID.includes('your-')) {
                this.config.databases.commits = process.env.NOTION_COMMITS_DATABASE_ID;
            }

            this.notion = new Client({ auth: token });
            this.initialized = true;
            
            console.log('✅ Notion client initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Notion client:', error.message);
            return false;
        }
    }

    /**
     * Get database schema to understand available properties
     */
    async getDatabaseSchema() {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const response = await this.notion.databases.retrieve({
                database_id: this.config.databases.tickets
            });
            
            console.log('📋 Database properties:');
            Object.keys(response.properties).forEach(propertyName => {
                const property = response.properties[propertyName];
                console.log(`  - ${propertyName} (${property.type})`);
            });
            
            return response.properties;
        } catch (error) {
            console.error('❌ Failed to get database schema:', error.message);
            return null;
        }
    }

    /**
     * Generate comprehensive ticket blocks with requirements template and full content
     */
    generateTicketBlocks(ticketData, ticketContent, githubIssueNumber, githubIssueUrl) {
        // Extract requirement and sprint info from ticket UUID
        const uuidParts = ticketData.uuid.split('-');
        const sprintNumber = uuidParts[0]; // e.g., "030"
        const reqNumber = `${uuidParts[0]}-${uuidParts[1]}`; // e.g., "030-01"
        
        // Determine target branch based on ticket environment (dev/staging, not main)
        const targetBranch = 'dev'; // Default to dev for sprint 030 tickets, could be extracted from ticketData.environment
        
        // Generate GitHub links with correct branch and proper URLs - CRITICAL: only valid URLs
        const ticketFileUrl = `https://github.com/penomoprotocol/penomo-api/blob/${targetBranch}/.claude-shared/project-management/5-tickets/${ticketData.uuid}.md`;
        
        // Generate specific requirement file URL (030-01 maps to 030-01-model-refactoring-integration.md)
        const requirementFileMap = {
            '030-01': '030-01-model-refactoring-integration.md',
            '030-02': '030-02-tokenization-engine-integration.md',
            '030-03': '030-03-revenue-to-yield-transformation.md',  
            '030-04': '030-04-api-routes-modernization.md',
            '030-05': '030-05-testing-production-validation.md'
        };
        
        const requirementFileName = requirementFileMap[reqNumber];
        const requirementFileUrl = requirementFileName 
            ? `https://github.com/penomoprotocol/penomo-api/blob/${targetBranch}/.claude-shared/project-management/4-requirements/${requirementFileName}`
            : `https://github.com/penomoprotocol/penomo-api/tree/${targetBranch}/.claude-shared/project-management/4-requirements`;
        
        const sprintFileUrl = `https://github.com/penomoprotocol/penomo-api/blob/${targetBranch}/.claude-shared/project-management/3-sprints/${sprintNumber}.md`;
        
        // Find actual planning document for sprint 030 (tokenization system)
        const planningFileMap = {
            '030': '250811-01-tokenization-routes-refactoring_sascha.md'
        };
        
        const planningFileName = planningFileMap[sprintNumber];
        const planningFileUrl = planningFileName 
            ? `https://github.com/penomoprotocol/penomo-api/blob/${targetBranch}/.claude-shared/project-management/2-planning/${planningFileName}`
            : `https://github.com/penomoprotocol/penomo-api/tree/${targetBranch}/.claude-shared/project-management/2-planning`;

        // Extract branch name from content
        let branchName = `refactor/${ticketData.uuid}`; // default
        const branchNameMatch = ticketContent.match(/\*\*Branch Name:\*\*\s*`([^`]+)`/);
        if (branchNameMatch) {
            branchName = branchNameMatch[1];
        }

        return [
            // Standard Template First - Requirements Section
            {
                object: 'block',
                type: 'heading_1',
                heading_1: {
                    rich_text: [{ type: 'text', text: { content: 'Requirements' } }]
                }
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Important - Please, for each ticket:' } }]
                }
            },
            {
                object: 'block',
                type: 'bulleted_list_item',
                bulleted_list_item: {
                    rich_text: [{ type: 'text', text: { content: 'Only work on tickets with status "Assigned" (yellow status)' } }]
                }
            },
            {
                object: 'block',
                type: 'bulleted_list_item',
                bulleted_list_item: {
                    rich_text: [{ type: 'text', text: { content: 'Once starting your work:' } }]
                }
            },
            {
                object: 'block',
                type: 'to_do',
                to_do: {
                    rich_text: [{ type: 'text', text: { content: 'Change status to "Working on it" (blue)' } }],
                    checked: false
                }
            },
            {
                object: 'block',
                type: 'to_do',
                to_do: {
                    rich_text: [{ type: 'text', text: { content: 'Work systematically on all todo items indicated in the ticket instructions down below and mark them as done once you have completed them.' } }],
                    checked: false
                }
            },
            {
                object: 'block',
                type: 'to_do',
                to_do: {
                    rich_text: [{ type: 'text', text: { content: 'Track your time for the work (if you are hired via upwork, we require you to use the upwork time tracker)' } }],
                    checked: false
                }
            },
            {
                object: 'block',
                type: 'bulleted_list_item',
                bulleted_list_item: {
                    rich_text: [{ type: 'text', text: { content: 'Once finished:' } }]
                }
            },
            {
                object: 'block',
                type: 'to_do',
                to_do: {
                    rich_text: [
                        { type: 'text', text: { content: 'Record a ' } },
                        { type: 'text', text: { content: 'Loom', link: { url: 'https://www.loom.com/' } } },
                        { type: 'text', text: { content: ' documentation video & paste link in ticket header. The loom should explain your completed ticket by going through all tasks. If the task involved any changes to the code, please go through them and show how you successfully test them. If the task involved any changes on the frontend, please also show a side by side comparison with the figma. It should be pixel perfect and responsive for different screens.' } }
                    ],
                    checked: false
                }
            },
            {
                object: 'block',
                type: 'to_do',
                to_do: {
                    rich_text: [{ type: 'text', text: { content: 'Create PR to the original branch + paste the PR link(s) in ticket header' } }],
                    checked: false
                }
            },
            {
                object: 'block',
                type: 'to_do',
                to_do: {
                    rich_text: [{ type: 'text', text: { content: 'Enter working hours in ticket header' } }],
                    checked: false
                }
            },
            {
                object: 'block',
                type: 'to_do',
                to_do: {
                    rich_text: [{ type: 'text', text: { content: 'Change status to "Review" (Purple)' } }],
                    checked: false
                }
            },
            {
                object: 'block',
                type: 'to_do',
                to_do: {
                    rich_text: [{ type: 'text', text: { content: 'Only after that, notify your manager about the completion of the ticket in the respective communication channel. Prevent direct messaging, since we want to ensure that as many people as possible are looped into the status update. Also include the link of this ticket into the message.' } }],
                    checked: false
                }
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ 
                        type: 'text',
                        text: { 
                            content: 'We take each of the above points very seriously.'
                        },
                        annotations: { bold: true }
                    }]
                }
            },
            // Resources Section
            {
                object: 'block',
                type: 'heading_1',
                heading_1: {
                    rich_text: [{ type: 'text', text: { content: 'Resources' } }]
                }
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Repositories:' } }]
                }
            },
            {
                object: 'block',
                type: 'to_do',
                to_do: {
                    rich_text: [{ 
                        type: 'text',
                        text: {
                            content: 'https://github.com/penomoprotocol/penomo_beta_backend/',
                            link: { url: 'https://github.com/penomoprotocol/penomo_beta_backend/tree/dev' }
                        }
                    }],
                    checked: false
                }
            },
            {
                object: 'block',
                type: 'to_do',
                to_do: {
                    rich_text: [{ 
                        type: 'text',
                        text: {
                            content: 'https://github.com/penomoprotocol/penomo_beta_investor_portal/',
                            link: { url: 'https://github.com/penomoprotocol/penomo_beta_investor_portal/' }
                        }
                    }],
                    checked: false
                }
            },
            {
                object: 'block',
                type: 'to_do',
                to_do: {
                    rich_text: [{ 
                        type: 'text',
                        text: {
                            content: 'https://github.com/penomoprotocol/penomo_beta_company_portal/',
                            link: { url: 'https://github.com/penomoprotocol/penomo_beta_company_portal/' }
                        }
                    }],
                    checked: false
                }
            },
            {
                object: 'block',
                type: 'to_do',
                to_do: {
                    rich_text: [{ 
                        type: 'text',
                        text: {
                            content: 'https://github.com/penomoprotocol/penomo_beta_admin_portal/',
                            link: { url: 'https://github.com/penomoprotocol/penomo_beta_admin_portal/' }
                        }
                    }],
                    checked: false
                }
            },
            {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'ENV Variables:' } }]
                }
            },
            {
                object: 'block',
                type: 'to_do',
                to_do: {
                    rich_text: [{ 
                        type: 'text',
                        text: {
                            content: 'Environment Files (staging)',
                            link: { url: 'https://www.notion.so/penomo/Environment-Files-staging-10cc168ca8cd804f96bccabeeae92409?pvs=21' }
                        }
                    }],
                    checked: false
                }
            },
            // Ticket-specific content AFTER standard template
            {
                object: 'block',
                type: 'heading_1',
                heading_1: {
                    rich_text: [{ type: 'text', text: { content: `Ticket: ${ticketData.title}` } }]
                }
            },
            // Documentation links as parent todo with sub-todos (indented children)
            {
                object: 'block',
                type: 'to_do',
                to_do: {
                    rich_text: [{ type: 'text', text: { content: 'Read the following documentation to understand the context:' } }],
                    checked: false,
                    children: [
                        {
                            object: 'block',
                            type: 'to_do',
                            to_do: {
                                rich_text: [
                                    { type: 'text', text: { content: 'Planning Document: ' } },
                                    { type: 'text', text: { content: '250811-01-tokenization-routes-refactoring_sascha.md', link: { url: planningFileUrl } } }
                                ],
                                checked: false
                            }
                        },
                        {
                            object: 'block',
                            type: 'to_do',
                            to_do: {
                                rich_text: [
                                    { type: 'text', text: { content: 'Sprint Document: ' } },
                                    { type: 'text', text: { content: `${sprintNumber}.md`, link: { url: sprintFileUrl } } }
                                ],
                                checked: false
                            }
                        },
                        {
                            object: 'block',
                            type: 'to_do',
                            to_do: {
                                rich_text: [
                                    { type: 'text', text: { content: 'Requirement Document: ' } },
                                    { type: 'text', text: { content: requirementFileName || 'requirements-directory', link: { url: requirementFileUrl } } }
                                ],
                                checked: false
                            }
                        },
                        {
                            object: 'block',
                            type: 'to_do',
                            to_do: {
                                rich_text: [
                                    { type: 'text', text: { content: 'Ticket Document: ' } },
                                    { type: 'text', text: { content: `${ticketData.uuid}.md`, link: { url: ticketFileUrl } } }
                                ],
                                checked: false
                            }
                        },
                        {
                            object: 'block',
                            type: 'to_do',
                            to_do: {
                                rich_text: githubIssueNumber ? [
                                    { type: 'text', text: { content: 'GitHub Issue: ' } },
                                    { type: 'text', text: { content: `#${githubIssueNumber}`, link: { url: githubIssueUrl } } }
                                ] : [
                                    { type: 'text', text: { content: 'GitHub Issue: (Created by tickets:assign command)', link: { url: githubIssueUrl } } }
                                ],
                                checked: false
                            }
                        }
                    ]
                }
            },
            // Branch creation todo
            {
                object: 'block',
                type: 'to_do',
                to_do: {
                    rich_text: [{ type: 'text', text: { content: `Create branch with name: ${branchName}` } }],
                    checked: false
                }
            },
            // Convert remaining markdown ticket content to proper Notion blocks (filtered)
            // CRITICAL: Never use fallback text - content validation ensures ticketContent exists
            // CRITICAL: Limit to 75 blocks to stay under Notion's 100 block limit (25 blocks used above for standard template)
            ...this.parseTicketMarkdownToBlocks(ticketContent, ticketData).slice(0, 75)
        ];
    }

    /**
     * Convert markdown ticket content to proper Notion blocks - FILTERED to avoid duplication
     */
    parseTicketMarkdownToBlocks(content, ticketData) {
        const blocks = [];
        const lines = content.split('\n');
        
        let skipCurrentSection = false;
        let foundMainTitle = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            if (!trimmed) continue; // Skip empty lines
            
            // CRITICAL: Skip sections that are already in standard template
            if (trimmed.startsWith('# ')) {
                const headingText = trimmed.substring(2);
                
                // Mark that we found the main title and continue processing from here
                foundMainTitle = true;
                
                // Skip sections already in standard template
                if (headingText === 'Requirements' || headingText === 'Resources' || 
                    headingText === 'Repositories' || headingText === 'ENV Variables' ||
                    headingText === 'Ticket Details') {
                    skipCurrentSection = true;
                    continue;
                }
                
                // Skip traceability section - not needed in Notion
                if (headingText === 'Traceability') {
                    skipCurrentSection = true;
                    continue;
                }
                
                skipCurrentSection = false;
                // Continue processing this title - don't skip it
            }
            
            // Skip content in sections we don't want
            if (skipCurrentSection) continue;
            
            // Process ALL content after finding main title (including the title itself)
            if (!foundMainTitle) continue;
            
            // Parse headings
            if (trimmed.startsWith('## ')) {
                const headingText = trimmed.substring(3);
                
                // Skip if it's environment section (already covered)
                if (headingText === 'Environment & Branching') {
                    continue;
                }
                
                blocks.push({
                    object: 'block',
                    type: 'heading_2',
                    heading_2: {
                        rich_text: [{ type: 'text', text: { content: headingText } }]
                    }
                });
            } else if (trimmed.startsWith('### ')) {
                blocks.push({
                    object: 'block',
                    type: 'heading_3',
                    heading_3: {
                        rich_text: [{ type: 'text', text: { content: trimmed.substring(4) } }]
                    }
                });
            } 
            // Parse todos/checkboxes
            else if (trimmed.startsWith('- [ ] ')) {
                blocks.push({
                    object: 'block',
                    type: 'to_do',
                    to_do: {
                        rich_text: [{ type: 'text', text: { content: trimmed.substring(6) } }],
                        checked: false
                    }
                });
            } else if (trimmed.startsWith('- [x] ')) {
                blocks.push({
                    object: 'block',
                    type: 'to_do',
                    to_do: {
                        rich_text: [{ type: 'text', text: { content: trimmed.substring(6) } }],
                        checked: true
                    }
                });
            }
            // Parse bullet points
            else if (trimmed.startsWith('- ')) {
                blocks.push({
                    object: 'block',
                    type: 'bulleted_list_item',
                    bulleted_list_item: {
                        rich_text: [{ type: 'text', text: { content: trimmed.substring(2) } }]
                    }
                });
            }
            // Parse bold text paragraphs
            else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                const content = trimmed.substring(2, trimmed.length - 2);
                blocks.push({
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ 
                            type: 'text', 
                            text: { content },
                            annotations: { bold: true }
                        }]
                    }
                });
            }
            // Parse regular paragraphs - with extensive filtering
            else if (!trimmed.startsWith('---') && !trimmed.includes('*Generated by Claudia') && 
                     !trimmed.startsWith('**Ticket ID:**') && !trimmed.startsWith('**Requirement:**') &&
                     !trimmed.startsWith('**Sprint:**') && !trimmed.startsWith('**Type:**') &&
                     !trimmed.startsWith('**Target Environment:**') && !trimmed.startsWith('**Branch Type:**') &&
                     !trimmed.startsWith('**Complexity:**') && !trimmed.startsWith('**Created:**') &&
                     !trimmed.startsWith('**Status:**') && !trimmed.startsWith('**Branch Name:**') &&
                     !trimmed.startsWith('**Base Branch:**') && !trimmed.startsWith('**PR Target:**') &&
                     !trimmed.startsWith('**GitHub Issue:**') && !trimmed.startsWith('**Notion Page:**') &&
                     !trimmed.startsWith('**Implementation PR:**') &&
                     !trimmed.toLowerCase().includes('performance test') &&
                     !trimmed.toLowerCase().includes('benchmark') &&
                     !trimmed.toLowerCase().includes('load test')) {
                
                blocks.push({
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ type: 'text', text: { content: trimmed } }]
                    }
                });
            }
        }
        
        // CRITICAL VALIDATION: Ensure we processed substantial content
        if (blocks.length < 10) {
            console.log(`⚠️  WARNING: Only processed ${blocks.length} content blocks - ticket may be incomplete!`);
            console.log(`📋 Content sections found: ${blocks.filter(b => b.type === 'heading_2').map(b => b.heading_2?.rich_text[0]?.text?.content).join(', ')}`);
        }
        
        // Notion limit warning
        if (blocks.length > 75) {
            console.log(`⚠️  WARNING: Generated ${blocks.length} blocks but will be truncated to 75 (Notion 100-block limit - 25 standard template blocks)`);
        }
        
        return blocks;
    }

    /**
     * Split content into multiple blocks to fit Notion's character limits
     */
    splitContentIntoBlocks(content) {
        const maxLength = 1900; // Leave some buffer under Notion's 2000 char limit
        const blocks = [];
        
        if (content.length <= maxLength) {
            blocks.push({
                object: 'block',
                type: 'code',
                code: {
                    language: 'markdown',
                    rich_text: [{ type: 'text', text: { content } }]
                }
            });
        } else {
            // Split content into chunks
            let remaining = content;
            let chunkNumber = 1;
            
            while (remaining.length > 0) {
                const chunk = remaining.substring(0, maxLength);
                remaining = remaining.substring(maxLength);
                
                // Add chunk header if multiple chunks
                if (chunkNumber > 1) {
                    blocks.push({
                        object: 'block',
                        type: 'paragraph',
                        paragraph: {
                            rich_text: [{ 
                                type: 'text', 
                                text: { content: `--- Content Chunk ${chunkNumber} ---` },
                                annotations: { italic: true }
                            }]
                        }
                    });
                }
                
                blocks.push({
                    object: 'block',
                    type: 'code',
                    code: {
                        language: 'markdown',
                        rich_text: [{ type: 'text', text: { content: chunk } }]
                    }
                });
                
                chunkNumber++;
            }
        }
        
        return blocks;
    }

    /**
     * Create a new ticket in Notion database with comprehensive content
     */
    async createTicket(ticketData) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Read the ticket markdown file to get complete content - CRITICAL: Ensure content is read
            const ticketPath = path.join(__dirname, '../../../project-management/5-tickets/', `${ticketData.uuid}.md`);
            let ticketContent = '';
            try {
                ticketContent = require('fs').readFileSync(ticketPath, 'utf8');
                console.log(`✅ Successfully read ticket file: ${ticketPath} (${ticketContent.length} characters)`);
                
                // CRITICAL VALIDATION: Ensure content was actually read
                if (!ticketContent || ticketContent.length < 100) {
                    throw new Error(`Ticket content too short or empty: ${ticketContent.length} characters`);
                }
            } catch (error) {
                console.log(`❌ ERROR: Could not read ticket file: ${ticketPath}`);
                console.log(`❌ Error details: ${error.message}`);
                throw new Error(`Failed to read ticket content - cannot create incomplete ticket`);
            }

            // Generate valid GitHub issue URL - CRITICAL: Only use if provided by tickets:assign command
            // NEVER create placeholder links - GitHub issues must be created first
            const githubIssueNumber = ticketData.githubIssue;
            const githubIssueUrl = githubIssueNumber 
                ? `https://github.com/penomoprotocol/penomo-api/issues/${githubIssueNumber}`
                : 'https://github.com/penomoprotocol/penomo-api/issues'; // Link to issues page if no specific issue

            const response = await this.notion.pages.create({
                parent: {
                    database_id: this.config.databases.tickets
                },
                properties: {
                    // Use the actual title property from your database
                    'Name of Task': {
                        title: [{ type: 'text', text: { content: `${ticketData.uuid}: ${ticketData.title}` } }]
                    },
                    // Add other properties that exist in your database
                    'ID': {
                        rich_text: [{ type: 'text', text: { content: ticketData.uuid } }]
                    },
                    'Status': {
                        status: { name: 'Not started' }  // Using status type, not select
                    },
                    'Priority': {
                        select: { name: 'Medium' }
                    },
                    'Github Issue': {
                        url: githubIssueUrl
                    }
                },
                children: this.generateTicketBlocks(ticketData, ticketContent, githubIssueNumber, githubIssueUrl)
            });

            // Log the creation
            await this.logAction('ticket_created', {
                ticketId: ticketData.uuid,
                notionPageId: response.id,
                title: ticketData.title
            });

            console.log(`✅ Created Notion ticket: ${response.url}`);
            return {
                success: true,
                pageId: response.id,
                url: response.url
            };
        } catch (error) {
            console.error('❌ Failed to create Notion ticket:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update ticket status in Notion
     */
    async updateTicketStatus(ticketId, status, additionalData = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Find the page by ticket ID
            const page = await this.findTicketPage(ticketId);
            if (!page) {
                throw new Error(`Ticket ${ticketId} not found in Notion`);
            }

            const updateProperties = {
                'Status': {
                    select: { name: status }
                }
            };

            // Add additional data if provided
            if (additionalData.commitHash) {
                updateProperties['Commit Hash'] = {
                    rich_text: [{ type: 'text', text: { content: additionalData.commitHash } }]
                };
            }

            if (additionalData.prNumber) {
                updateProperties['PR Number'] = {
                    number: additionalData.prNumber
                };
            }

            if (additionalData.completedDate) {
                updateProperties['Completed Date'] = {
                    date: { start: additionalData.completedDate }
                };
            }

            const response = await this.notion.pages.update({
                page_id: page.id,
                properties: updateProperties
            });

            // Log the update
            await this.logAction('ticket_updated', {
                ticketId,
                status,
                additionalData
            });

            console.log(`✅ Updated Notion ticket ${ticketId} to status: ${status}`);
            return {
                success: true,
                pageId: response.id
            };
        } catch (error) {
            console.error('❌ Failed to update Notion ticket:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Find a ticket page by ticket ID
     */
    async findTicketPage(ticketId) {
        try {
            const response = await this.notion.databases.query({
                database_id: this.config.databases.tickets,
                filter: {
                    property: 'Ticket ID',
                    title: {
                        equals: ticketId
                    }
                }
            });

            return response.results.length > 0 ? response.results[0] : null;
        } catch (error) {
            console.error('❌ Failed to find ticket page:', error.message);
            return null;
        }
    }

    /**
     * Create requirement in Notion
     */
    async createRequirement(requirementData) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const response = await this.notion.pages.create({
                parent: {
                    database_id: this.config.databases.requirements
                },
                properties: {
                    'Requirement ID': {
                        title: [{ type: 'text', text: { content: requirementData.uuid } }]
                    },
                    'Title': {
                        rich_text: [{ type: 'text', text: { content: requirementData.title } }]
                    },
                    'Status': {
                        select: { name: requirementData.status || 'Draft' }
                    },
                    'Priority': {
                        select: { name: requirementData.priority || 'Medium' }
                    },
                    'Category': {
                        select: { name: requirementData.category || 'Feature' }
                    },
                    'Created Date': {
                        date: { start: new Date().toISOString().split('T')[0] }
                    }
                },
                children: [
                    {
                        object: 'block',
                        type: 'heading_2',
                        heading_2: {
                            rich_text: [{ type: 'text', text: { content: 'Description' } }]
                        }
                    },
                    {
                        object: 'block',
                        type: 'paragraph',
                        paragraph: {
                            rich_text: [{ type: 'text', text: { content: requirementData.description || 'No description provided.' } }]
                        }
                    }
                ]
            });

            console.log(`✅ Created Notion requirement: ${response.url}`);
            return {
                success: true,
                pageId: response.id,
                url: response.url
            };
        } catch (error) {
            console.error('❌ Failed to create Notion requirement:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate project status report
     */
    async generateStatusReport() {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Get tickets data
            const ticketsResponse = await this.notion.databases.query({
                database_id: this.config.databases.tickets,
                sorts: [
                    {
                        property: 'Created Date',
                        direction: 'descending'
                    }
                ]
            });

            // Get requirements data
            const requirementsResponse = await this.notion.databases.query({
                database_id: this.config.databases.requirements,
                sorts: [
                    {
                        property: 'Created Date',
                        direction: 'descending'
                    }
                ]
            });

            const report = {
                timestamp: new Date().toISOString(),
                tickets: {
                    total: ticketsResponse.results.length,
                    byStatus: this.groupByProperty(ticketsResponse.results, 'Status'),
                    byPriority: this.groupByProperty(ticketsResponse.results, 'Priority'),
                    byType: this.groupByProperty(ticketsResponse.results, 'Type')
                },
                requirements: {
                    total: requirementsResponse.results.length,
                    byStatus: this.groupByProperty(requirementsResponse.results, 'Status'),
                    byCategory: this.groupByProperty(requirementsResponse.results, 'Category')
                }
            };

            console.log('✅ Generated Notion status report');
            return report;
        } catch (error) {
            console.error('❌ Failed to generate status report:', error.message);
            return null;
        }
    }

    /**
     * Helper method to group results by property
     */
    groupByProperty(results, propertyName) {
        const groups = {};
        results.forEach(item => {
            const propertyValue = item.properties[propertyName];
            let value = 'Unknown';
            
            if (propertyValue?.select?.name) {
                value = propertyValue.select.name;
            } else if (propertyValue?.title?.[0]?.text?.content) {
                value = propertyValue.title[0].text.content;
            } else if (propertyValue?.rich_text?.[0]?.text?.content) {
                value = propertyValue.rich_text[0].text.content;
            }
            
            groups[value] = (groups[value] || 0) + 1;
        });
        return groups;
    }

    /**
     * Log action to sync file
     */
    async logAction(action, data) {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                action,
                data
            };

            const logPath = path.join(__dirname, '../data/notion-sync.jsonl');
            await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
        } catch (error) {
            console.error('Failed to log action:', error.message);
        }
    }
}

// CLI Interface
if (require.main === module) {
    const client = new ClaudiaNotionClient();
    const command = process.argv[2];
    const args = process.argv.slice(3);

    switch (command) {
        case 'create-ticket':
            if (args.length < 2) {
                console.log('Usage: node notion-client.js create-ticket <ticketId> <title> [description]');
                process.exit(1);
            }
            client.createTicket({
                uuid: args[0],
                title: args[1],
                description: args[2] || 'Auto-generated ticket'
            }).then(result => {
                console.log(JSON.stringify(result, null, 2));
            });
            break;

        case 'update-status':
            if (args.length < 2) {
                console.log('Usage: node notion-client.js update-status <ticketId> <status>');
                process.exit(1);
            }
            client.updateTicketStatus(args[0], args[1]).then(result => {
                console.log(JSON.stringify(result, null, 2));
            });
            break;

        case 'status-report':
            client.generateStatusReport().then(report => {
                console.log(JSON.stringify(report, null, 2));
            });
            break;

        case 'check-schema':
            client.getDatabaseSchema().then(schema => {
                if (schema) {
                    console.log('✅ Database schema retrieved successfully');
                } else {
                    console.log('❌ Failed to retrieve database schema');
                }
            });
            break;

        default:
            console.log('Available commands: create-ticket, update-status, status-report, check-schema');
            process.exit(1);
    }
}

module.exports = ClaudiaNotionClient;