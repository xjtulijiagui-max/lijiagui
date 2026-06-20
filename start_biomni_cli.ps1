$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

$candidates = @()

$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if ($pythonCmd) {
    $candidates += $pythonCmd.Source
}

$pyCmd = Get-Command py -ErrorAction SilentlyContinue
if ($pyCmd) {
    $candidates += $pyCmd.Source
}

$candidates += Join-Path $env:LOCALAPPDATA "Programs\Python\Python312\python.exe"
$candidates += Join-Path $env:LOCALAPPDATA "Programs\Python\Python311\python.exe"
$candidates += Join-Path $env:LOCALAPPDATA "Programs\Python\Python310\python.exe"

$pythonExe = $null
foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path -LiteralPath $candidate)) {
        $pythonExe = $candidate
        break
    }
}

if (-not $pythonExe) {
    Write-Host "Cannot find Python. Please install Python or add it to PATH."
    exit 1
}

& $pythonExe .\student_cli.py
