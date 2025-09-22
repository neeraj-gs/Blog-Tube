#!/bin/bash
# Emergency Bypass Creator
# Creates authorized emergency bypass for critical situations

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚨 Emergency Bypass Creator${NC}"
echo "============================"

# Check if bypass already exists
if [ -f ".github/emergency-bypass.active" ]; then
    echo -e "${YELLOW}⚠️ Emergency bypass already exists${NC}"
    echo "Remove existing bypass first or extend it"
    exit 1
fi

# Collect information
read -p "Incident ID: " incident_id
read -p "Incident Commander: " commander
read -p "Reason for bypass: " reason
read -p "Duration (hours, default 2): " duration

duration=${duration:-2}

# Calculate expiration
expires=$(($(date +%s) + (duration * 3600)))
expires_human=$(date -d "@$expires" 2>/dev/null || date -r "$expires" 2>/dev/null)

# Create bypass file
cat > .github/emergency-bypass.active << EOF
# Emergency Bypass - AUTO-GENERATED
# This file authorizes emergency bypass of Claudia workflow

INCIDENT_ID=$incident_id
COMMANDER=$commander
REASON=$reason
CREATED=$(date -u +%Y-%m-%dT%H:%M:%SZ)
EXPIRES=$expires
EXPIRES_HUMAN=$expires_human
AUTHORIZED=true

# WARNING: This bypass should be removed after emergency is resolved
# Post-incident review is required for all emergency bypasses
