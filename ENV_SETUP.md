# Environment Variables Setup

This project uses environment variables to configure the API base URL.

## Setup Instructions

1. Create a `.env` file in the root directory of the project
2. Add the following configuration:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
```

## Environment Variables

| Variable            | Description          | Default Value           |
| ------------------- | -------------------- | ----------------------- |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000` |

## Different Environments

### Development

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Production

```env
VITE_API_BASE_URL=https://your-api-domain.com
```

### Staging

```env
VITE_API_BASE_URL=https://staging-api.your-domain.com
```

## Notes

- All environment variables in Vite must be prefixed with `VITE_` to be accessible in the frontend
- The `.env` file should be added to `.gitignore` to keep sensitive information secure
- Use `.env.example` as a template for other developers
