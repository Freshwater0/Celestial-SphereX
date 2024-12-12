$widgetsPath = "c:/Users/tshoj/celestial-sphere/frontend-new/src/components/widgets"
if (Test-Path $widgetsPath) {
    Remove-Item -Path $widgetsPath -Recurse -Force
}
