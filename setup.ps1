# Install PostgreSQL using winget
Write-Host "Installing PostgreSQL..."
winget install -e --id PostgreSQL.PostgreSQL

# Install Python dependencies
Write-Host "Installing Python dependencies..."
pip install -r requirements.txt

# Create the database
$env:PGPASSWORD = "postgres"
psql -U postgres -c "CREATE DATABASE celestial_sphere;"

# Create .env file
$envContent = @"
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost/celestial_sphere

# JWT Configuration
JWT_SECRET=$(New-Guid)

# Email Configuration (using SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
MAIL_DEFAULT_SENDER=noreply@celestialsphere.com

# Application Configuration
FLASK_APP=run.py
FLASK_ENV=development
FLASK_DEBUG=1
"@

Set-Content -Path ".env" -Value $envContent

Write-Host "Setup completed! Please update the SENDGRID_API_KEY in .env with your actual API key."
