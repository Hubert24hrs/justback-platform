# Backend Scheduler Documentation

## Overview

The JustBack backend includes a production-ready cron job scheduler built on `node-cron`. It handles automated background tasks with logging, error handling, retries, and graceful shutdown.

## Architecture

```
backend/src/
├── scheduler/
│   └── index.js          # Main scheduler module
├── jobs/
│   ├── notification.job.js    # Push notification processing
│   ├── reminder.job.js        # Booking reminders (check-in/out)
│   ├── expiry-check.job.js    # Expiry checks, payment timeouts
│   ├── cleanup.job.js         # Session cleanup, log archival
│   └── backup.job.js          # Database backups, analytics
└── routes/
    └── scheduler.routes.js    # Admin API endpoints
```

## Scheduled Jobs

| Job Name | Schedule | Description |
|----------|----------|-------------|
| `scheduled-notifications` | Every 5 min | Process scheduled push notifications |
| `booking-reminders` | Every 15 min | Send check-in/check-out reminders |
| `expiring-bookings` | Every hour | Alert users about expiring bookings |
| `payment-timeout-check` | Every 30 min | Cancel unpaid bookings |
| `auto-checkout` | Daily 12:00 PM | Complete stays past checkout date |
| `session-cleanup` | Daily 3:00 AM | Remove expired tokens/sessions |
| `log-archival` | Weekly (Sun 2 AM) | Archive old log files |
| `abandoned-booking-cleanup` | Daily 4:00 AM | Expire abandoned bookings |
| `database-backup` | Daily 1:00 AM | Automated DB backup |
| `analytics-export` | Weekly (Mon 5 AM) | Export analytics data |

## API Endpoints

### Public
- `GET /api/v1/scheduler/health` - Health check (for monitoring)

### Admin Only (requires authentication)
- `GET /api/v1/scheduler/status` - Get all job statuses
- `GET /api/v1/scheduler/jobs` - List available jobs with schedules
- `POST /api/v1/scheduler/trigger/:jobName` - Manually trigger a job

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DISABLE_SCHEDULER` | `false` | Set to `true` to disable scheduler |
| `BACKUP_DIR` | `./backups` | Directory for database backups |

## Features

- ✅ **Retry Logic**: Failed jobs retry up to 3 times with delay
- ✅ **Status Tracking**: Real-time job status via API
- ✅ **Logging**: Full logging with Winston
- ✅ **Graceful Shutdown**: Jobs stop cleanly on SIGTERM
- ✅ **Timezone Support**: Configured for Africa/Lagos

## Usage

### Check Scheduler Health
```bash
curl http://localhost:5000/api/v1/scheduler/health
```

### Trigger Job Manually (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/scheduler/trigger/database-backup \
  -H "Authorization: Bearer <admin_token>"
```

### Get Job Status (Admin)
```bash
curl http://localhost:5000/api/v1/scheduler/status \
  -H "Authorization: Bearer <admin_token>"
```
