# Port Configuration Guide

## Overview
All port configurations are now centralized in environment files to prevent conflicts and make configuration management easier.

## Environment Files

### Server Configuration (`server/.env`)
```bash
# Server Configuration
NODE_ENV=development
SERVER_PORT=5000          # Server port (was PORT=5000)
CLIENT_PORT=3000          # Client port for reference
CLIENT_URL=http://localhost:3000
```

### Client Configuration (`client/.env`)
```bash
# Client Configuration
REACT_APP_SERVER_PORT=5000    # Server port for API calls
REACT_APP_CLIENT_PORT=3000    # Client port (React default)
```

## How It Works

### Server Side
- **File**: `server/src/index.ts`
- **Port Source**: `process.env.SERVER_PORT || process.env.PORT || 5000`
- **Fallback**: Port 5000 if no environment variable is set

### Client Side
- **File**: `client/src/services/authService.ts`
- **Port Source**: `process.env.REACT_APP_SERVER_PORT || '5000'`
- **API URL**: `http://localhost:${SERVER_PORT}/api`

## Setup Instructions

### Quick Setup
Run the setup script to create all environment files:
```bash
./setup-env.sh
```

### Manual Setup
1. **Server Environment** (`server/.env`):
   ```bash
   SERVER_PORT=5000
   CLIENT_PORT=3000
   ```

2. **Client Environment** (`client/.env`):
   ```bash
   REACT_APP_SERVER_PORT=5000
   REACT_APP_CLIENT_PORT=3000
   ```

## Debugging

### Server Debug Output
The server now logs all environment variables on startup:
```
🔧 Server Debug - SERVER_PORT: 5000
🔧 Server Debug - CLIENT_PORT: 3000
🔧 Server Debug - PORT (fallback): 5000
```

### Client Debug Output
The client logs API configuration:
```
🔧 AuthService Debug - REACT_APP_SERVER_PORT: 5000
🔧 AuthService Debug - API_BASE_URL: http://localhost:5000/api
```

## Troubleshooting

### Port Conflicts
If you get `EADDRINUSE` errors:
1. Check what's using the port: `lsof -ti:5000`
2. Kill the process: `kill <PID>`
3. Restart the application: `npm run dev`

### Configuration Issues
1. Ensure both `.env` files exist
2. Check that `SERVER_PORT` matches `REACT_APP_SERVER_PORT`
3. Restart both client and server after changing environment variables

## Benefits

1. **Centralized Configuration**: All ports defined in one place
2. **No Hardcoded Values**: Easy to change ports without code changes
3. **Clear Documentation**: Environment variables are self-documenting
4. **Debugging Support**: Comprehensive logging for troubleshooting
5. **Consistency**: Server and client always use the same port configuration

## Default Ports

- **Server**: 5001
- **Client**: 3000
- **API Base URL**: http://localhost:5001/api 