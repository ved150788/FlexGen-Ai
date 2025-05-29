# Test Backend Connection
Write-Host "Testing Threat Intelligence Backend Connection..." -ForegroundColor Green

try {
    # Test dashboard endpoint
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard" -Method GET -TimeoutSec 10
    
    if ($response) {
        Write-Host "✓ Backend is running successfully!" -ForegroundColor Green
        Write-Host "✓ Dashboard endpoint responding" -ForegroundColor Green
        Write-Host "Total Threats: $($response.totalThreats)" -ForegroundColor Yellow
        Write-Host "New Threats: $($response.newThreats)" -ForegroundColor Yellow
        Write-Host "Mock Data: $($response.isMockData)" -ForegroundColor Yellow
        
        if (-not $response.isMockData) {
            Write-Host "✓ Using REAL threat intelligence data!" -ForegroundColor Green
        } else {
            Write-Host "⚠ Still using mock data" -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "✗ Backend connection failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the backend server is running on http://localhost:5000" -ForegroundColor Yellow
    Write-Host "Run: cd backend && .\start_backend.ps1" -ForegroundColor Yellow
}

Write-Host "`nTesting IOCs endpoint..." -ForegroundColor Green
try {
    $iocs = Invoke-RestMethod -Uri "http://localhost:5000/api/iocs" -Method GET -TimeoutSec 10
    Write-Host "✓ IOCs endpoint responding with $($iocs.Count) indicators" -ForegroundColor Green
}
catch {
    Write-Host "✗ IOCs endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
} 