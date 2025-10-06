#!/bin/bash
# Emergency Bypass Validation Hook
# Validates emergency bypass procedures

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BYPASS_FILE=".github/emergency-bypass.active"

# Only run if bypass file exists
if [ ! -f "$BYPASS_FILE" ]; then
    exit 0
fi

echo -e "${YELLOW}🚨 Emergency bypass validation...${NC}"

# Validate bypass file format
if ! grep -q "AUTHORIZED=" "$BYPASS_FILE"; then
    echo -e "${RED}❌ Invalid bypass file format${NC}"
    echo -e "${RED}   Use: .github/scripts/create-emergency-bypass.sh${NC}"
    exit 1
fi

# Check authorization
if ! grep -q "AUTHORIZED=true" "$BYPASS_FILE"; then
    echo -e "${RED}❌ Emergency bypass not authorized${NC}"
    echo -e "${RED}   Get authorization from incident commander${NC}"
    exit 1
fi

# Check expiration
if grep -q "EXPIRES=" "$BYPASS_FILE"; then
    expires=$(grep "EXPIRES=" "$BYPASS_FILE" | cut -d'=' -f2)
    current_time=$(date +%s)

    if [ "$current_time" -gt "$expires" ]; then
        echo -e "${RED}❌ Emergency bypass expired${NC}"
        echo -e "${RED}   Remove expired bypass file${NC}"
        exit 1
    fi
fi

# Validate required fields
required_fields=("INCIDENT_ID" "COMMANDER" "REASON")
for field in "${required_fields[@]}"; do
    if ! grep -q "$field=" "$BYPASS_FILE"; then
        echo -e "${RED}❌ Missing required field: $field${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Emergency bypass validation passed${NC}"

# Log bypass validation
mkdir -p ".claude-shared/project-management/data"
echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"action\":\"bypass_validated\",\"incident\":\"$(grep 'INCIDENT_ID=' "$BYPASS_FILE" | cut -d'=' -f2)\",\"commander\":\"$(grep 'COMMANDER=' "$BYPASS_FILE" | cut -d'=' -f2)\"}" >> ".claude-shared/project-management/data/emergency-bypasses.jsonl"

exit 0
