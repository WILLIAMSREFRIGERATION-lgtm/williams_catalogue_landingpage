# Williams Refrigeration India — Local Development HTTP Server
# Robust HTTP server with automatic port detection, CORS, and graceful error handling

$preferredPorts = @(8080, 8081, 8082, 8085, 3000, 5000)
$port = $null
$listener = $null

foreach ($p in $preferredPorts) {
    try {
        $tempListener = New-Object System.Net.HttpListener
        $tempListener.Prefixes.Add("http://localhost:$p/")
        $tempListener.Start()
        $port = $p
        $listener = $tempListener
        break
    } catch {
        if ($tempListener) {
            try { $tempListener.Close() } catch {}
        }
    }
}

if (-not $listener) {
    Write-Error "Could not bind to any development port ($($preferredPorts -join ', ')). Please ensure no process is blocking these ports."
    exit 1
}

$url = "http://localhost:$port/"
$baseDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Williams Refrigeration B2B Product Catalogue Server" -ForegroundColor Green
Write-Host " Server Root: $baseDir" -ForegroundColor Gray
Write-Host " Running at:  $url" -ForegroundColor Yellow
Write-Host " Press Ctrl+C in this terminal to stop the server." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

# Open default browser (disabled for automated runs)
# try { Start-Process $url -ErrorAction SilentlyContinue } catch {}

try {
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            # Decode URL and sanitize
            $rawPath = $request.Url.LocalPath.TrimStart('/')
            $localPath = [System.Uri]::UnescapeDataString($rawPath)
            if ([string]::IsNullOrWhiteSpace($localPath)) {
                $localPath = "index.html"
            }

            # Normalize directory separators for Windows
            $cleanRelativePath = $localPath -replace '/', [System.IO.Path]::DirectorySeparatorChar
            $filePath = Join-Path $baseDir $cleanRelativePath

            # CORS and Cache-Control headers
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
            $response.AddHeader("Access-Control-Allow-Headers", "*")
            $response.AddHeader("Access-Control-Expose-Headers", "Accept-Ranges, Content-Encoding, Content-Length, Content-Range")
            $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.AddHeader("Pragma", "no-cache")
            $response.AddHeader("Expires", "0")

            if ($request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.OutputStream.Close()
                continue
            }

            if ($localPath -like "log*") {
                $msg = $request.Url.Query
                Write-Host "[BROWSER LOG] $msg" -ForegroundColor Magenta
                $response.StatusCode = 200
                $response.Close()
                continue
            }

            if ($localPath -like "save-thumb*") {
                $slug = $request.QueryString["slug"]
                if ($slug) {
                    $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                    $base64 = $reader.ReadToEnd()
                    if ($base64.Contains(",")) {
                        $base64 = $base64.Substring($base64.IndexOf(",") + 1)
                    }
                    try {
                        $bytes = [Convert]::FromBase64String($base64.Trim())
                        $outDir = Join-Path $baseDir "assets\thumbnails"
                        if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
                        $destPath = Join-Path $outDir "$slug.jpg"
                        [System.IO.File]::WriteAllBytes($destPath, $bytes)
                        Write-Host "[THUMB SAVED] $slug.jpg ($($bytes.Length) bytes)" -ForegroundColor Green
                        $response.StatusCode = 200
                    } catch {
                        Write-Host "[THUMB ERROR] $_" -ForegroundColor Red
                        $response.StatusCode = 500
                    }
                } else {
                    $response.StatusCode = 400
                }
                $response.Close()
                continue
            }

            if (Test-Path $filePath -PathType Leaf) {
                $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
                $mimeType = switch ($extension) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".svg"  { "image/svg+xml" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".png"  { "image/png" }
                    ".webp" { "image/webp" }
                    ".ico"  { "image/x-icon" }
                    ".pdf"  { "application/pdf" }
                    ".mp4"  { "video/mp4" }
                    ".webm" { "video/webm" }
                    Default { "application/octet-stream" }
                }

                $response.ContentType = $mimeType
                $response.AddHeader("Accept-Ranges", "bytes")

                $fileInfo = New-Object System.IO.FileInfo($filePath)
                $fileLen = $fileInfo.Length

                $rangeHeader = $request.Headers["Range"]
                if ($rangeHeader -and ($rangeHeader -match "bytes=(\d*)-(\d*)")) {
                    $start = 0L
                    $end = $fileLen - 1L
                    if ($matches[1]) { $start = [int64]$matches[1] }
                    if ($matches[2]) {
                        $end = [int64]$matches[2]
                    } else {
                        # Chunk unconstrained streaming for media to prevent locking single-threaded listener
                        $maxChunk = 4194304L # 4MB
                        if (($fileLen - $start) -gt $maxChunk -and ($extension -in @(".mp4", ".webm", ".pdf"))) {
                            $end = $start + $maxChunk - 1L
                        }
                    }
                    if ($end -ge $fileLen) { $end = $fileLen - 1L }
                    $contentLen = $end - $start + 1L

                    $response.StatusCode = 206
                    $response.AddHeader("Content-Range", "bytes $start-$end/$fileLen")
                    $response.ContentLength64 = $contentLen

                    if ($request.HttpMethod -ne "HEAD") {
                        $fs = [System.IO.File]::OpenRead($filePath)
                        try {
                            $fs.Seek($start, [System.IO.SeekOrigin]::Begin) | Out-Null
                            $buf = New-Object byte[] 65536
                            $rem = $contentLen
                            while ($rem -gt 0) {
                                $toRead = [Math]::Min($buf.Length, $rem)
                                $read = $fs.Read($buf, 0, $toRead)
                                if ($read -le 0) { break }
                                $response.OutputStream.Write($buf, 0, $read)
                                $rem -= $read
                            }
                        } finally {
                            $fs.Close()
                        }
                    }
                } else {
                    $response.StatusCode = 200
                    $response.ContentLength64 = $fileLen

                    if ($request.HttpMethod -ne "HEAD") {
                        $fs = [System.IO.File]::OpenRead($filePath)
                        try {
                            $buf = New-Object byte[] 65536
                            while (($read = $fs.Read($buf, 0, $buf.Length)) -gt 0) {
                                $response.OutputStream.Write($buf, 0, $read)
                            }
                        } finally {
                            $fs.Close()
                        }
                    }
                }
            } else {
                $response.StatusCode = 404
                $response.ContentType = "text/plain; charset=utf-8"
                $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
                $response.ContentLength64 = $buffer.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($buffer, 0, $buffer.Length)
                }
            }
            $response.OutputStream.Close()
        } catch {
            # Catch transient disconnects
        }
    }
} finally {
    if ($listener) {
        $listener.Stop()
        $listener.Close()
    }
}
