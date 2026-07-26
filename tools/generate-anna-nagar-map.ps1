Add-Type -AssemblyName System.Drawing

function Get-TilePoint([double]$lat, [double]$lon, [int]$zoom) {
  $latRad = $lat * [Math]::PI / 180
  $n = [Math]::Pow(2, $zoom)
  $x = (($lon + 180) / 360) * $n * 256
  $y = (1 - ([Math]::Log([Math]::Tan($latRad) + (1 / [Math]::Cos($latRad))) / [Math]::PI)) / 2 * $n * 256
  return @{ x = $x; y = $y }
}

function New-RoundedRectPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($x, $y, $r * 2, $r * 2, 180, 90)
  $path.AddArc($x + $w - ($r * 2), $y, $r * 2, $r * 2, 270, 90)
  $path.AddArc($x + $w - ($r * 2), $y + $h - ($r * 2), $r * 2, $r * 2, 0, 90)
  $path.AddArc($x, $y + $h - ($r * 2), $r * 2, $r * 2, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-MapMarker($g, [float]$x, [float]$y) {
  $gold = [System.Drawing.Color]::FromArgb(255, 218, 165, 49)
  $dark = [System.Drawing.Color]::FromArgb(255, 0, 58, 82)
  $shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(90, 0, 0, 0))
  $goldBrush = New-Object System.Drawing.SolidBrush $gold
  $darkBrush = New-Object System.Drawing.SolidBrush $dark
  $pen = New-Object System.Drawing.Pen $dark, 3
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath

  $g.FillEllipse($shadowBrush, $x - 21, $y + 23, 42, 12)
  $path.AddEllipse($x - 19, $y - 44, 38, 38)
  $path.AddPolygon(@(
    (New-Object System.Drawing.PointF ($x - 9), ($y - 13)),
    (New-Object System.Drawing.PointF ($x + 9), ($y - 13)),
    (New-Object System.Drawing.PointF $x, ($y + 19))
  ))
  $path.CloseFigure()
  $g.FillPath($goldBrush, $path)
  $g.DrawPath($pen, $path)
  $g.FillEllipse($darkBrush, $x - 6, $y - 31, 12, 12)

  $path.Dispose()
  $pen.Dispose()
  $shadowBrush.Dispose()
  $goldBrush.Dispose()
  $darkBrush.Dispose()
}

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$lat = 13.0865409
$lon = 80.2205116
$zoom = 16
$mapW = 738
$mapH = 650
$center = Get-TilePoint $lat $lon $zoom
$originX = $center.x - ($mapW / 2)
$originY = $center.y - ($mapH / 2)
$minTileX = [Math]::Floor($originX / 256)
$maxTileX = [Math]::Floor(($originX + $mapW) / 256)
$minTileY = [Math]::Floor($originY / 256)
$maxTileY = [Math]::Floor(($originY + $mapH) / 256)

$map = New-Object System.Drawing.Bitmap $mapW, $mapH
$gMap = [System.Drawing.Graphics]::FromImage($map)
$gMap.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$gMap.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gMap.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gMap.Clear([System.Drawing.Color]::FromArgb(245, 245, 240))

$tileDir = Join-Path $root 'tmp-footer-check\carto-tiles'
New-Item -ItemType Directory -Force -Path $tileDir | Out-Null
$wc = New-Object System.Net.WebClient
$wc.Headers.Add('User-Agent', 'CafeLaMirajhWebsiteMap/1.0')

for ($tx = $minTileX; $tx -le $maxTileX; $tx++) {
  for ($ty = $minTileY; $ty -le $maxTileY; $ty++) {
    $tilePath = Join-Path $tileDir "$zoom-$tx-$ty.png"
    if (!(Test-Path $tilePath)) {
      $url = "https://a.basemaps.cartocdn.com/light_all/$zoom/$tx/$ty.png"
      $wc.DownloadFile($url, $tilePath)
      Start-Sleep -Milliseconds 100
    }

    $tile = [System.Drawing.Image]::FromFile($tilePath)
    $dx = [int][Math]::Round(($tx * 256) - $originX)
    $dy = [int][Math]::Round(($ty * 256) - $originY)
    $gMap.DrawImageUnscaled($tile, $dx, $dy)
    $tile.Dispose()
  }
}

$wc.Dispose()

Draw-MapMarker $gMap ($mapW / 2) ($mapH / 2)

$labelFont = New-Object System.Drawing.Font 'Segoe UI', 18, ([System.Drawing.FontStyle]::Bold)
$smallFont = New-Object System.Drawing.Font 'Segoe UI', 10, ([System.Drawing.FontStyle]::Regular)
$label = 'Cafe La Mirajh'
$labelSize = $gMap.MeasureString($label, $labelFont)
$labelX = ($mapW - $labelSize.Width) / 2
$labelY = ($mapH / 2) + 28
$labelBg = New-RoundedRectPath ($labelX - 16) ($labelY - 6) ($labelSize.Width + 32) 44 18
$bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 0, 58, 82))
$creamBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 242, 212))
$gMap.FillPath($bgBrush, $labelBg)
$gMap.DrawString($label, $labelFont, $creamBrush, $labelX, $labelY)

$attrib = [char]0x00A9 + ' OpenStreetMap ' + [char]0x00A9 + ' CARTO'
$attribSize = $gMap.MeasureString($attrib, $smallFont)
$attribBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(215, 255, 255, 255))
$attribBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 45, 45, 45))
$gMap.FillRectangle($attribBg, $mapW - $attribSize.Width - 16, $mapH - 23, $attribSize.Width + 12, 19)
$gMap.DrawString($attrib, $smallFont, $attribBrush, $mapW - $attribSize.Width - 10, $mapH - 24)

$mapOut = Join-Path $root 'public\figma-exports\anna-nagar-map.png'
$tmpMapOut = Join-Path $root 'public\figma-exports\anna-nagar-map.tmp.png'
$map.Save($tmpMapOut, [System.Drawing.Imaging.ImageFormat]::Png)
Move-Item -LiteralPath $tmpMapOut -Destination $mapOut -Force

$labelBg.Dispose()
$bgBrush.Dispose()
$creamBrush.Dispose()
$attribBg.Dispose()
$attribBrush.Dispose()
$labelFont.Dispose()
$smallFont.Dispose()
$gMap.Dispose()
$map.Dispose()

Get-Item $mapOut | Select-Object FullName, Length, LastWriteTime
