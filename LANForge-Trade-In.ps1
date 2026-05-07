# ============================================================
# LANForge Trade-In Scanner
# Simple GUI + Full Hardware Scan + API Submit
# Version 8.1.0
# ============================================================

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class ConsoleWindow {
    [DllImport("kernel32.dll")]
    public static extern IntPtr GetConsoleWindow();

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@

$consoleHandle = [ConsoleWindow]::GetConsoleWindow()
if ($consoleHandle -ne [IntPtr]::Zero) {
    [ConsoleWindow]::ShowWindow($consoleHandle, 0) | Out-Null
}

$CompanyName = "LANForge, LLC."
$AppName = "LANForge Trade-In Scanner"
$AppVersion = "8.1.0"

$ApiBaseUrl = "http://localhost:3000/api"

$DesktopPath = [Environment]::GetFolderPath("Desktop")
$LocalOutputRoot = Join-Path $DesktopPath "LANForge-TradeIn-Scans"
New-Item -ItemType Directory -Force -Path $LocalOutputRoot | Out-Null

function Safe-Value {
    param($Value)

    if ($null -eq $Value) {
        return ""
    }

    return ($Value | Out-String).Trim()
}

function Convert-BytesToGB {
    param($Bytes)

    if ($null -eq $Bytes -or $Bytes -eq 0) {
        return 0
    }

    return [math]::Round(($Bytes / 1GB), 2)
}

function Convert-BytesToTB {
    param($Bytes)

    if ($null -eq $Bytes -or $Bytes -eq 0) {
        return 0
    }

    return [math]::Round(($Bytes / 1TB), 2)
}

function Get-AdminStatus {
    $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-MemoryTypeName {
    param($SMBIOSMemoryType)

    switch ($SMBIOSMemoryType) {
        20 { return "DDR" }
        21 { return "DDR2" }
        24 { return "DDR3" }
        26 { return "DDR4" }
        34 { return "DDR5" }
        default { return "Unknown" }
    }
}

function Get-VramGuess {
    param([string]$GpuName)

    if ([string]::IsNullOrWhiteSpace($GpuName)) {
        return "Unknown"
    }

    $name = $GpuName.ToUpper()

    $knownVram = @(
        @{ Pattern = "RTX 4090"; Value = 24 },
        @{ Pattern = "RTX 4080 SUPER"; Value = 16 },
        @{ Pattern = "RTX 4080"; Value = 16 },
        @{ Pattern = "RTX 4070 TI SUPER"; Value = 16 },
        @{ Pattern = "RTX 4070 TI"; Value = 12 },
        @{ Pattern = "RTX 4070 SUPER"; Value = 12 },
        @{ Pattern = "RTX 4070"; Value = 12 },
        @{ Pattern = "RTX 4060 TI"; Value = "8 or 16" },
        @{ Pattern = "RTX 4060"; Value = 8 },

        @{ Pattern = "RTX 3090 TI"; Value = 24 },
        @{ Pattern = "RTX 3090"; Value = 24 },
        @{ Pattern = "RTX 3080 TI"; Value = 12 },
        @{ Pattern = "RTX 3080"; Value = "10 or 12" },
        @{ Pattern = "RTX 3070 TI"; Value = 8 },
        @{ Pattern = "RTX 3070"; Value = 8 },
        @{ Pattern = "RTX 3060 TI"; Value = 8 },
        @{ Pattern = "RTX 3060"; Value = "8 or 12" },
        @{ Pattern = "RTX 3050"; Value = "6 or 8" },

        @{ Pattern = "RX 7900 XTX"; Value = 24 },
        @{ Pattern = "RX 7900 XT"; Value = 20 },
        @{ Pattern = "RX 7900 GRE"; Value = 16 },
        @{ Pattern = "RX 7800 XT"; Value = 16 },
        @{ Pattern = "RX 7700 XT"; Value = 12 },
        @{ Pattern = "RX 7600 XT"; Value = 16 },
        @{ Pattern = "RX 7600"; Value = 8 },

        @{ Pattern = "RX 6950 XT"; Value = 16 },
        @{ Pattern = "RX 6900 XT"; Value = 16 },
        @{ Pattern = "RX 6800 XT"; Value = 16 },
        @{ Pattern = "RX 6800"; Value = 16 },
        @{ Pattern = "RX 6750 XT"; Value = 12 },
        @{ Pattern = "RX 6700 XT"; Value = 12 },
        @{ Pattern = "RX 6650 XT"; Value = 8 },
        @{ Pattern = "RX 6600 XT"; Value = 8 },
        @{ Pattern = "RX 6600"; Value = 8 },

        @{ Pattern = "ARC A770"; Value = "8 or 16" },
        @{ Pattern = "ARC A750"; Value = 8 },
        @{ Pattern = "ARC A580"; Value = 8 },
        @{ Pattern = "ARC A380"; Value = 6 }
    )

    foreach ($item in $knownVram) {
        if ($name -like "*$($item.Pattern)*") {
            return $item.Value
        }
    }

    return "Unknown"
}

function Set-UiStatus {
    param(
        [string]$Message,
        [string]$Mode = "Info"
    )

    $StatusLabel.Text = $Message

    switch ($Mode) {
        "Success" {
            $StatusLabel.ForeColor = [System.Drawing.ColorTranslator]::FromHtml("#DDFFB2")
        }
        "Warning" {
            $StatusLabel.ForeColor = [System.Drawing.Color]::FromArgb(251, 191, 36)
        }
        "Error" {
            $StatusLabel.ForeColor = [System.Drawing.Color]::FromArgb(248, 113, 113)
        }
        default {
            $StatusLabel.ForeColor = [System.Drawing.Color]::FromArgb(203, 213, 225)
        }
    }

    [System.Windows.Forms.Application]::DoEvents()
}

function Set-ButtonBusy {
    param([bool]$Busy)

    if ($Busy) {
        $ScanButton.Enabled = $false
        $ScanButton.Text = "SCANNING + SENDING..."
        $ScanButton.BackColor = [System.Drawing.Color]::FromArgb(148, 163, 184)
    } else {
        $ScanButton.Enabled = $true
        $ScanButton.Text = "SCAN + SEND DATA"
        $ScanButton.BackColor = [System.Drawing.ColorTranslator]::FromHtml("#DDFFB2")
    }

    [System.Windows.Forms.Application]::DoEvents()
}

function Get-ExceptionMessage {
    param($ErrorRecord)

    if ($ErrorRecord.ErrorDetails -and $ErrorRecord.ErrorDetails.Message) {
        return $ErrorRecord.ErrorDetails.Message
    }

    try {
        $response = $ErrorRecord.Exception.Response

        if ($response -ne $null) {
            $stream = $response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $body = $reader.ReadToEnd()

            if (-not [string]::IsNullOrWhiteSpace($body)) {
                return $body
            }
        }
    } catch {
    }

    return $ErrorRecord.Exception.Message
}

function Get-LANForgeHardwarePayload {
    param([string]$TradeCode)

    $scanStartedAt = Get-Date
    $scannerId = "LF-SCAN-" + (Get-Date -Format "yyyyMMddHHmmss") + "-" + (Get-Random -Minimum 1000 -Maximum 9999)

    Set-UiStatus "Collecting CPU information..."
    $cpuObjects = @(Get-CimInstance Win32_Processor)

    Set-UiStatus "Collecting GPU information..."
    $gpuObjects = @(Get-CimInstance Win32_VideoController)

    Set-UiStatus "Collecting RAM information..."
    $ramObjects = @(Get-CimInstance Win32_PhysicalMemory)

    Set-UiStatus "Collecting storage information..."
    $diskObjects = @(Get-CimInstance Win32_DiskDrive)

    Set-UiStatus "Collecting motherboard and BIOS information..."
    $board = Get-CimInstance Win32_BaseBoard | Select-Object -First 1
    $bios = Get-CimInstance Win32_BIOS | Select-Object -First 1

    Set-UiStatus "Collecting Windows and system information..."
    $system = Get-CimInstance Win32_ComputerSystem | Select-Object -First 1
    $windows = Get-CimInstance Win32_OperatingSystem | Select-Object -First 1

    Set-UiStatus "Collecting network information..."
    $networkAdapters = @(Get-CimInstance Win32_NetworkAdapter | Where-Object { $_.PhysicalAdapter -eq $true })

    Set-UiStatus "Collecting security information..."
    $secureBoot = "Unavailable"
    $tpm = $null

    try {
        $secureBoot = Confirm-SecureBootUEFI
    } catch {
        $secureBoot = "Unavailable"
    }

    try {
        $tpm = Get-CimInstance -Namespace "Root\CIMV2\Security\MicrosoftTpm" -ClassName Win32_Tpm
    } catch {
        $tpm = $null
    }

    $cpuInfo = @()

    foreach ($cpu in $cpuObjects) {
        $cpuInfo += [PSCustomObject]@{
            name                  = Safe-Value $cpu.Name
            manufacturer          = Safe-Value $cpu.Manufacturer
            description           = Safe-Value $cpu.Description
            cores                 = $cpu.NumberOfCores
            logicalProcessors     = $cpu.NumberOfLogicalProcessors
            maxClockMHz           = $cpu.MaxClockSpeed
            currentClockMHz       = $cpu.CurrentClockSpeed
            socket                = Safe-Value $cpu.SocketDesignation
            processorId           = Safe-Value $cpu.ProcessorId
            virtualizationEnabled = $cpu.VirtualizationFirmwareEnabled
            l2CacheKB             = $cpu.L2CacheSize
            l3CacheKB             = $cpu.L3CacheSize
        }
    }

    $primaryCpu = $cpuInfo | Select-Object -First 1

    $gpuInfo = @()

    foreach ($gpu in $gpuObjects) {
        $gpuName = Safe-Value $gpu.Name
        $gpuUpper = $gpuName.ToUpper()

        $isMicrosoftBasic = $gpuUpper -like "*MICROSOFT BASIC DISPLAY*"
        $isRemoteOrVirtual = $gpuUpper -like "*REMOTE*" -or $gpuUpper -like "*VIRTUAL*"
        $isLikelyRealGpu = -not $isMicrosoftBasic -and -not $isRemoteOrVirtual

        $rawAdapterRamGB = "Unknown"

        try {
            $rawValue = Convert-BytesToGB $gpu.AdapterRAM

            if ($rawValue -ge 6) {
                $rawAdapterRamGB = $rawValue
            } else {
                $rawAdapterRamGB = "Unreliable"
            }
        } catch {
            $rawAdapterRamGB = "Unknown"
        }

        $gpuInfo += [PSCustomObject]@{
            name                    = $gpuName
            isLikelyRealGpu          = $isLikelyRealGpu
            isMicrosoftBasicAdapter  = $isMicrosoftBasic
            status                  = Safe-Value $gpu.Status
            driverVersion           = Safe-Value $gpu.DriverVersion
            driverDate              = Safe-Value $gpu.DriverDate
            rawAdapterRAMGB          = $rawAdapterRamGB
            vramGuessGB              = Get-VramGuess $gpuName
            vramNote                 = "Windows WMI can report incorrect VRAM. vramGuessGB is model-based and should be verified if needed."
            videoProcessor           = Safe-Value $gpu.VideoProcessor
            resolution               = "$($gpu.CurrentHorizontalResolution)x$($gpu.CurrentVerticalResolution)"
            refreshRate              = $gpu.CurrentRefreshRate
            pnpDeviceId              = Safe-Value $gpu.PNPDeviceID
        }
    }

    $primaryGpu = $gpuInfo | Where-Object { $_.isLikelyRealGpu -eq $true } | Select-Object -First 1

    $ramInfo = @()
    $totalRamBytes = 0

    foreach ($stick in $ramObjects) {
        $totalRamBytes += [int64]$stick.Capacity

        $ramInfo += [PSCustomObject]@{
            manufacturer     = Safe-Value $stick.Manufacturer
            partNumber       = Safe-Value $stick.PartNumber
            serialNumber     = Safe-Value $stick.SerialNumber
            capacityGB       = Convert-BytesToGB $stick.Capacity
            speedMHz         = $stick.Speed
            configuredMHz    = $stick.ConfiguredClockSpeed
            memoryType       = Get-MemoryTypeName $stick.SMBIOSMemoryType
            smbiosMemoryType = $stick.SMBIOSMemoryType
            formFactor       = $stick.FormFactor
            slot             = Safe-Value $stick.DeviceLocator
            bank             = Safe-Value $stick.BankLabel
        }
    }

    $totalRamGB = Convert-BytesToGB $totalRamBytes
    $dimmCount = @($ramInfo).Count

    $memoryTypes = @(
        $ramInfo |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_.memoryType) } |
            Select-Object -ExpandProperty memoryType -Unique
    )

    $primaryMemoryType = if ($memoryTypes.Count -gt 0) { $memoryTypes[0] } else { "Unknown" }

    $configuredSpeeds = @(
        $ramInfo |
            Where-Object { $_.configuredMHz -and $_.configuredMHz -gt 0 } |
            Select-Object -ExpandProperty configuredMHz
    )

    $ratedSpeeds = @(
        $ramInfo |
            Where-Object { $_.speedMHz -and $_.speedMHz -gt 0 } |
            Select-Object -ExpandProperty speedMHz
    )

    $configuredSpeedMHz = if ($configuredSpeeds.Count -gt 0) {
        ($configuredSpeeds | Measure-Object -Maximum).Maximum
    } else {
        "Unknown"
    }

    $ratedSpeedMHz = if ($ratedSpeeds.Count -gt 0) {
        ($ratedSpeeds | Measure-Object -Maximum).Maximum
    } else {
        "Unknown"
    }

    $capacities = @(
        $ramInfo |
            Where-Object { $_.capacityGB -and $_.capacityGB -gt 0 } |
            Select-Object -ExpandProperty capacityGB
    )

    $moduleLayout = ""

    if ($capacities.Count -gt 0) {
        $firstCapacity = $capacities[0]
        $allSameCapacity = $true

        foreach ($cap in $capacities) {
            if ($cap -ne $firstCapacity) {
                $allSameCapacity = $false
            }
        }

        if ($allSameCapacity) {
            $moduleLayout = "$dimmCount" + "x" + "$firstCapacity GB"
        } else {
            $moduleLayout = ($capacities | ForEach-Object { "$_ GB" }) -join " + "
        }
    }

    $diskInfo = @()
    $internalStorageGB = 0
    $internalDiskNames = @()
    $internalDiskCount = 0

    foreach ($disk in $diskObjects) {
        $interface = Safe-Value $disk.InterfaceType
        $media = Safe-Value $disk.MediaType
        $sizeGB = Convert-BytesToGB $disk.Size
        $isUsb = $interface.ToUpper() -eq "USB"
        $isRemovable = $media.ToUpper() -like "*REMOVABLE*"

        if (-not $isUsb -and -not $isRemovable) {
            $internalStorageGB += $sizeGB
            $internalDiskCount += 1
            $internalDiskNames += "$(Safe-Value $disk.Model) ($sizeGB GB)"
        }

        $diskInfo += [PSCustomObject]@{
            model         = Safe-Value $disk.Model
            manufacturer  = Safe-Value $disk.Manufacturer
            serialNumber  = Safe-Value $disk.SerialNumber
            interfaceType = $interface
            mediaType     = $media
            sizeGB        = $sizeGB
            sizeTB        = Convert-BytesToTB $disk.Size
            status        = Safe-Value $disk.Status
            firmware      = Safe-Value $disk.FirmwareRevision
            isUSB         = $isUsb
            isRemovable   = $isRemovable
            pnpDeviceId   = Safe-Value $disk.PNPDeviceID
        }
    }

    $motherboardName = "$(Safe-Value $board.Manufacturer) $(Safe-Value $board.Product)".Trim()

    $motherboardInfo = [PSCustomObject]@{
        manufacturer = Safe-Value $board.Manufacturer
        product      = Safe-Value $board.Product
        version      = Safe-Value $board.Version
        serialNumber = Safe-Value $board.SerialNumber
    }

    $biosInfo = [PSCustomObject]@{
        manufacturer = Safe-Value $bios.Manufacturer
        name         = Safe-Value $bios.Name
        version      = Safe-Value $bios.SMBIOSBIOSVersion
        serialNumber = Safe-Value $bios.SerialNumber
        releaseDate  = Safe-Value $bios.ReleaseDate
    }

    $systemInfo = [PSCustomObject]@{
        manufacturer = Safe-Value $system.Manufacturer
        model        = Safe-Value $system.Model
        computerName = Safe-Value $env:COMPUTERNAME
        systemType   = Safe-Value $system.SystemType
        totalRamGB   = $totalRamGB
        isAdmin      = Get-AdminStatus
    }

    $windowsInfo = [PSCustomObject]@{
        caption        = Safe-Value $windows.Caption
        version        = Safe-Value $windows.Version
        buildNumber    = Safe-Value $windows.BuildNumber
        architecture   = Safe-Value $windows.OSArchitecture
        installDate    = Safe-Value $windows.InstallDate
        lastBootUpTime = Safe-Value $windows.LastBootUpTime
        systemDrive    = Safe-Value $windows.SystemDrive
    }

    $networkInfo = @()

    foreach ($adapter in $networkAdapters) {
        $networkInfo += [PSCustomObject]@{
            name          = Safe-Value $adapter.Name
            manufacturer  = Safe-Value $adapter.Manufacturer
            macAddress    = Safe-Value $adapter.MACAddress
            adapterType   = Safe-Value $adapter.AdapterType
            netConnection = Safe-Value $adapter.NetConnectionID
        }
    }

    $securityInfo = [PSCustomObject]@{
        secureBoot = $secureBoot
        tpmPresent = if ($tpm) { $true } else { $false }
        tpmEnabled = if ($tpm) { $tpm.IsEnabled_InitialValue } else { $false }
        tpmVersion = if ($tpm) { Safe-Value $tpm.SpecVersion } else { "" }
    }

    $warnings = @()

    if ($null -eq $primaryGpu) {
        $warnings += "No valid gaming GPU was confidently detected."
    }

    if (($gpuInfo | Where-Object { $_.isMicrosoftBasicAdapter -eq $true }).Count -gt 0) {
        $warnings += "Microsoft Basic Display Adapter detected. This may mean missing drivers, disabled GPU/iGPU, or a driver conflict."
    }

    if ($totalRamGB -lt 16) {
        $warnings += "System has less than 16 GB RAM."
    }

    if ($internalStorageGB -lt 500) {
        $warnings += "Internal storage appears below 500 GB."
    }

    if (-not (Get-AdminStatus)) {
        $warnings += "Scanner is not running as administrator. Some hardware fields may be incomplete."
    }

    $ramSummaryText = "$totalRamGB GB $primaryMemoryType"

    if (-not [string]::IsNullOrWhiteSpace($moduleLayout)) {
        $ramSummaryText += " ($moduleLayout)"
    }

    if ($configuredSpeedMHz -ne "Unknown") {
        $ramSummaryText += " @ $configuredSpeedMHz MHz"
    }

    $components = [PSCustomObject]@{
        cpu         = if ($primaryCpu) { $primaryCpu.name } else { "" }
        gpu         = if ($primaryGpu) { "$($primaryGpu.name) - VRAM Guess: $($primaryGpu.vramGuessGB) GB" } else { "" }
        ram         = $ramSummaryText
        storage     = if ($internalDiskNames.Count -gt 0) { "$([math]::Round($internalStorageGB, 2)) GB internal storage - " + ($internalDiskNames -join "; ") } else { "$([math]::Round($internalStorageGB, 2)) GB internal storage" }
        motherboard = $motherboardName
        psu         = ""
        case        = ""
        cooler      = ""
        other       = "Scanner ID: $scannerId; Submitted by LANForge Trade-In Scanner v$AppVersion"
    }

    $summary = [PSCustomObject]@{
        tradeCode             = $TradeCode
        scannerId             = $scannerId
        primaryCpu            = $components.cpu
        primaryGpu            = $components.gpu
        totalRamGB            = $totalRamGB
        ramType               = $primaryMemoryType
        dimmCount             = $dimmCount
        ramLayout             = $moduleLayout
        ramConfiguredSpeedMHz = $configuredSpeedMHz
        ramRatedSpeedMHz      = $ratedSpeedMHz
        internalStorageGB     = [math]::Round($internalStorageGB, 2)
        motherboard           = $motherboardName
        warningCount          = $warnings.Count
        scannedAt             = $scanStartedAt.ToString("yyyy-MM-dd HH:mm:ss")
    }

    $scannerReport = [PSCustomObject]@{
        reportMetadata = [PSCustomObject]@{
            companyName       = $CompanyName
            toolName          = $AppName
            version           = $AppVersion
            reportId          = $scannerId
            generatedAt       = $scanStartedAt.ToString("yyyy-MM-dd HH:mm:ss")
            generatedByUser   = $env:USERNAME
            computerName      = $env:COMPUTERNAME
            customerInputCode = $TradeCode
            note              = "This report is for estimated trade-in review only. Final value is subject to LANForge inspection."
        }

        summary     = $summary
        system      = $systemInfo
        windows     = $windowsInfo
        motherboard = $motherboardInfo
        bios        = $biosInfo
        cpu         = $cpuInfo
        gpu         = $gpuInfo

        ram = [PSCustomObject]@{
            totalGB            = $totalRamGB
            dimmCount          = $dimmCount
            memoryTypes        = $memoryTypes
            primaryMemoryType  = $primaryMemoryType
            moduleLayout       = $moduleLayout
            ratedSpeedMHz      = $ratedSpeedMHz
            configuredSpeedMHz = $configuredSpeedMHz
            modules            = $ramInfo
        }

        storage = [PSCustomObject]@{
            internalStorageTotalGB = [math]::Round($internalStorageGB, 2)
            diskCount              = @($diskInfo).Count
            internalDiskCount      = $internalDiskCount
            physicalDisks          = $diskInfo
        }

        network  = $networkInfo
        security = $securityInfo
        warnings = $warnings
    }

    $payload = [PSCustomObject]@{
        tradeCode = $TradeCode
        components = $components
        notes = "Hardware scan submitted from LANForge Trade-In Scanner v$AppVersion at $($scanStartedAt.ToString("yyyy-MM-dd HH:mm:ss")). Scanner ID: $scannerId"
        scannerReport = $scannerReport

        reportMetadata = $scannerReport.reportMetadata
        summary        = $summary
        system         = $systemInfo
        windows        = $windowsInfo
        motherboard    = $motherboardInfo
        bios           = $biosInfo
        cpu            = $cpuInfo
        gpu            = $gpuInfo
        ram            = $scannerReport.ram
        storage        = $scannerReport.storage
        network        = $networkInfo
        security       = $securityInfo
        warnings       = $warnings
    }

    return $payload
}

function Submit-LANForgePayload {
    param(
        [string]$TradeCode,
        [object]$Payload
    )

    $safeTradeCode = $TradeCode.Trim().ToUpper()
    $json = $Payload | ConvertTo-Json -Depth 50

    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupPath = Join-Path $LocalOutputRoot "$safeTradeCode-$timestamp.json"
    $json | Out-File -FilePath $backupPath -Encoding UTF8

    $base = $ApiBaseUrl.TrimEnd("/")
    $escapedCode = [uri]::EscapeDataString($safeTradeCode)
    $url = "$base/trade-ins/$escapedCode/scan"

    Set-UiStatus "Sending data to LANForge..."

    $response = Invoke-RestMethod `
        -Uri $url `
        -Method POST `
        -Body $json `
        -ContentType "application/json"

    return [PSCustomObject]@{
        endpoint   = $url
        backupPath = $backupPath
        response   = $response
    }
}

[System.Windows.Forms.Application]::EnableVisualStyles()

$form = New-Object System.Windows.Forms.Form
$form.Text = "LANForge Trade-In Scanner"
$form.Size = New-Object System.Drawing.Size(560, 390)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedSingle"
$form.MaximizeBox = $false
$form.MinimizeBox = $true
$form.BackColor = [System.Drawing.ColorTranslator]::FromHtml("#050816")

$outerPanel = New-Object System.Windows.Forms.Panel
$outerPanel.Location = New-Object System.Drawing.Point(24, 24)
$outerPanel.Size = New-Object System.Drawing.Size(510, 320)
$outerPanel.BackColor = [System.Drawing.ColorTranslator]::FromHtml("#0F172A")
$form.Controls.Add($outerPanel)

$badge = New-Object System.Windows.Forms.Label
$badge.Text = "LANForge Certified"
$badge.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$badge.ForeColor = [System.Drawing.ColorTranslator]::FromHtml("#DDFFB2")
$badge.BackColor = [System.Drawing.ColorTranslator]::FromHtml("#1F2937")
$badge.TextAlign = "MiddleCenter"
$badge.Location = New-Object System.Drawing.Point(28, 24)
$badge.Size = New-Object System.Drawing.Size(145, 28)
$outerPanel.Controls.Add($badge)

$title = New-Object System.Windows.Forms.Label
$title.Text = "Trade-In Scanner"
$title.Font = New-Object System.Drawing.Font("Segoe UI", 25, [System.Drawing.FontStyle]::Bold)
$title.ForeColor = [System.Drawing.Color]::White
$title.Location = New-Object System.Drawing.Point(28, 66)
$title.Size = New-Object System.Drawing.Size(455, 42)
$outerPanel.Controls.Add($title)

$subtitle = New-Object System.Windows.Forms.Label
$subtitle.Text = "Enter the trade-in code from the website. This tool will scan the PC hardware and send the full report to LANForge."
$subtitle.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$subtitle.ForeColor = [System.Drawing.Color]::FromArgb(203, 213, 225)
$subtitle.Location = New-Object System.Drawing.Point(31, 116)
$subtitle.Size = New-Object System.Drawing.Size(445, 44)
$outerPanel.Controls.Add($subtitle)

$codeLabel = New-Object System.Windows.Forms.Label
$codeLabel.Text = "Trade-In Code"
$codeLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$codeLabel.ForeColor = [System.Drawing.Color]::FromArgb(148, 163, 184)
$codeLabel.Location = New-Object System.Drawing.Point(32, 174)
$codeLabel.Size = New-Object System.Drawing.Size(440, 20)
$outerPanel.Controls.Add($codeLabel)

$CodeBox = New-Object System.Windows.Forms.TextBox
$CodeBox.Font = New-Object System.Drawing.Font("Segoe UI", 16)
$CodeBox.Location = New-Object System.Drawing.Point(34, 198)
$CodeBox.Size = New-Object System.Drawing.Size(442, 36)
$CodeBox.BackColor = [System.Drawing.ColorTranslator]::FromHtml("#111827")
$CodeBox.ForeColor = [System.Drawing.Color]::White
$CodeBox.BorderStyle = "FixedSingle"
$outerPanel.Controls.Add($CodeBox)

$ScanButton = New-Object System.Windows.Forms.Button
$ScanButton.Text = "SCAN + SEND DATA"
$ScanButton.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$ScanButton.Location = New-Object System.Drawing.Point(34, 250)
$ScanButton.Size = New-Object System.Drawing.Size(442, 46)
$ScanButton.BackColor = [System.Drawing.ColorTranslator]::FromHtml("#DDFFB2")
$ScanButton.ForeColor = [System.Drawing.ColorTranslator]::FromHtml("#050816")
$ScanButton.FlatStyle = "Flat"
$ScanButton.FlatAppearance.BorderSize = 0
$ScanButton.Cursor = [System.Windows.Forms.Cursors]::Hand
$outerPanel.Controls.Add($ScanButton)

$StatusLabel = New-Object System.Windows.Forms.Label
$StatusLabel.Text = if (Get-AdminStatus) { "Ready. Running as administrator." } else { "Ready. Not running as administrator." }
$StatusLabel.Font = New-Object System.Drawing.Font("Segoe UI", 8.5)
$StatusLabel.ForeColor = if (Get-AdminStatus) { [System.Drawing.ColorTranslator]::FromHtml("#DDFFB2") } else { [System.Drawing.Color]::FromArgb(251, 191, 36) }
$StatusLabel.Location = New-Object System.Drawing.Point(34, 302)
$StatusLabel.Size = New-Object System.Drawing.Size(442, 18)
$StatusLabel.TextAlign = "MiddleCenter"
$outerPanel.Controls.Add($StatusLabel)

$ScanButton.Add_Click({
    $tradeCode = $CodeBox.Text.Trim().ToUpper()

    if ([string]::IsNullOrWhiteSpace($tradeCode)) {
        [System.Windows.Forms.MessageBox]::Show(
            "Please enter the trade-in code from the LANForge website.",
            "Missing Trade-In Code",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Warning
        ) | Out-Null
        return
    }

    Set-ButtonBusy $true

    try {
        Set-UiStatus "Scanning hardware..."

        $payload = Get-LANForgeHardwarePayload -TradeCode $tradeCode

        Set-UiStatus "Sending full hardware report..."

        $result = Submit-LANForgePayload -TradeCode $tradeCode -Payload $payload

        Set-UiStatus "Submitted successfully." "Success"

        [System.Windows.Forms.MessageBox]::Show(
            "Hardware scan submitted successfully.`n`nEndpoint:`n$($result.endpoint)`n`nLocal backup:`n$($result.backupPath)",
            "LANForge Scan Submitted",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Information
        ) | Out-Null
    } catch {
        Set-UiStatus "Error. Submission failed." "Error"

        $message = Get-ExceptionMessage $_

        [System.Windows.Forms.MessageBox]::Show(
            $message,
            "LANForge Scanner Error",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        ) | Out-Null
    }

    Set-ButtonBusy $false
})

[void]$form.ShowDialog()