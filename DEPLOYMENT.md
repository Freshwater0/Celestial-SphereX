# Celestial Sphere Backend Deployment Guide

This guide outlines the deployment process for the Celestial Sphere backend application.

## Prerequisites

- Node.js (v16.x or later)
- Docker
- AWS CLI configured with appropriate permissions
- PostgreSQL database
- GitHub account with repository access

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm test
   npm run test:e2e
   ```

## Docker Deployment

1. Build Docker image:
   ```bash
   npm run docker:build
   ```

2. Run container locally:
   ```bash
   npm run docker:run
   ```

3. Push to registry:
   ```bash
   docker tag celestial-sphere:latest [registry]/celestial-sphere:latest
   docker push [registry]/celestial-sphere:latest
   ```

## AWS Deployment

### Prerequisites
- AWS ECR repository
- ECS cluster
- RDS PostgreSQL instance
- Load balancer and target group
- VPC with public and private subnets

### Steps

1. Configure AWS credentials:
   ```bash
   aws configure
   ```

2. Login to ECR:
   ```bash
   aws ecr get-login-password --region [region] | docker login --username AWS --password-stdin [aws-account-id].dkr.ecr.[region].amazonaws.com
   ```

3. Build and push:
   ```bash
   docker build -t celestial-sphere .
   docker tag celestial-sphere:latest [aws-account-id].dkr.ecr.[region].amazonaws.com/celestial-sphere:latest
   docker push [aws-account-id].dkr.ecr.[region].amazonaws.com/celestial-sphere:latest
   ```

4. Update ECS service:
   ```bash
   aws ecs update-service --cluster celestial-sphere --service backend --force-new-deployment
   ```

## CI/CD Pipeline

The application uses GitHub Actions for CI/CD:

1. On pull request:
   - Runs tests
   - Checks code style
   - Validates OpenAPI spec
   - Reports code coverage

2. On merge to main:
   - Runs tests
   - Builds Docker image
   - Pushes to ECR
   - Deploys to ECS

## Monitoring

1. Application metrics available at `/metrics`
2. Health check endpoint at `/health`
3. Logging via Winston
4. AWS CloudWatch integration

## Environment Variables

Required environment variables:

```bash
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=celestial
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

## Security Considerations

1. SSL/TLS enabled
2. Rate limiting configured
3. CORS properly set up
4. Security headers implemented
5. Input validation
6. JWT authentication

## Troubleshooting

1. Check logs:
   ```bash
   docker logs [container-id]
   ```

2. Monitor metrics:
   ```bash
   curl http://localhost:5000/metrics
   ```

3. Verify health:
   ```bash
   curl http://localhost:5000/health
   ```

4. Common issues:
   - Database connection errors
   - Environment variable misconfiguration
   - Port conflicts
   - Permission issues

## Backup and Recovery

1. Database backups:
   - Automated daily backups
   - Point-in-time recovery enabled
   - Manual backup procedure documented

2. Application state:
   - Stateless design
   - Session data in Redis
   - File uploads in S3

## Performance Optimization

1. Node.js configuration:
   - Appropriate heap size
   - Clustering enabled
   - Connection pooling

2. Database optimization:
   - Indexed queries
   - Connection pooling
   - Query caching

3. Caching strategy:
   - Redis for session data
   - Response caching
   - Static asset caching

## Support

For support and troubleshooting:
1. Check logs and metrics
2. Review documentation
3. Contact DevOps team
4. Submit GitHub issue
