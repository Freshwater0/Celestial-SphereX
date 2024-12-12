# Check if PostgreSQL service is running
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService.Status -ne "Running") {
    Write-Host "Starting PostgreSQL service..."
    Start-Service $pgService
}

# Initialize the database
Write-Host "Initializing database..."
python init_db.py

# Start the Flask application
Write-Host "Starting Flask application..."
$env:FLASK_APP = "run.py"
$env:FLASK_ENV = "development"
python run.py
