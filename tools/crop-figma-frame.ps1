param(
  [Parameter(Mandatory = $true)]
  [string] $Source,
  [Parameter(Mandatory = $true)]
  [string] $Output,
  [Parameter(Mandatory = $true)]
  [int] $Width,
  [Parameter(Mandatory = $true)]
  [int] $Height
)

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Runtime.Extensions
Add-Type @"
using System;

public static class FigmaFrameCropScanner
{
    private static bool IsFigmaBlue(byte[] bytes, int offset)
    {
        int blue = bytes[offset];
        int green = bytes[offset + 1];
        int red = bytes[offset + 2];
        return blue > 160 && green > 80 && red < 90;
    }

    public static int[] FindFrame(byte[] bytes, int stride, int bitmapWidth, int bitmapHeight, int width, int height)
    {
        const int columnSampleStep = 12;
        const int rowSampleStep = 8;
        int columnThreshold = (int)Math.Floor((height / (double)columnSampleStep) * 0.65);
        int rowThreshold = (int)Math.Floor((width / (double)rowSampleStep) * 0.65);

        int[] candidateColumns = new int[bitmapWidth];
        int columnCount = 0;
        for (int x = 0; x < bitmapWidth; x++)
        {
            int count = 0;
            for (int y = 0; y < bitmapHeight; y += columnSampleStep)
            {
                int offset = (y * stride) + (x * 4);
                if (IsFigmaBlue(bytes, offset))
                {
                    count++;
                }
            }
            if (count > columnThreshold)
            {
                candidateColumns[columnCount++] = x;
            }
        }

        int[] candidateRows = new int[bitmapHeight];
        int rowCount = 0;
        for (int y = 0; y < bitmapHeight; y++)
        {
            int count = 0;
            for (int x = 0; x < bitmapWidth; x += rowSampleStep)
            {
                int offset = (y * stride) + (x * 4);
                if (IsFigmaBlue(bytes, offset))
                {
                    count++;
                }
            }
            if (count > rowThreshold)
            {
                candidateRows[rowCount++] = y;
            }
        }

        int left = -1;
        for (int i = 0; i < columnCount; i++)
        {
            for (int j = 0; j < columnCount; j++)
            {
                if (candidateColumns[j] - candidateColumns[i] == width + 1)
                {
                    left = candidateColumns[i];
                    i = columnCount;
                    break;
                }
            }
        }

        int top = -1;
        for (int i = 0; i < rowCount; i++)
        {
            for (int j = 0; j < rowCount; j++)
            {
                if (candidateRows[j] - candidateRows[i] == height + 1)
                {
                    top = candidateRows[i];
                    i = rowCount;
                    break;
                }
            }
        }

        return new int[] { left, top };
    }
}
"@

$resolvedSource = Resolve-Path $Source
$resolvedOutput = Join-Path (Get-Location) $Output
$sourceBitmap = [System.Drawing.Bitmap]::FromFile($resolvedSource)
$bitmap = [System.Drawing.Bitmap]::new(
  $sourceBitmap.Width,
  $sourceBitmap.Height,
  [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.DrawImage($sourceBitmap, 0, 0, $sourceBitmap.Width, $sourceBitmap.Height)
$graphics.Dispose()
$sourceBitmap.Dispose()

$lockRect = [System.Drawing.Rectangle]::new(0, 0, $bitmap.Width, $bitmap.Height)
$bitmapData = $bitmap.LockBits(
  $lockRect,
  [System.Drawing.Imaging.ImageLockMode]::ReadOnly,
  [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
)
$stride = [Math]::Abs($bitmapData.Stride)
$bytes = [byte[]]::new($stride * $bitmap.Height)
[System.Runtime.InteropServices.Marshal]::Copy($bitmapData.Scan0, $bytes, 0, $bytes.Length)
$bitmap.UnlockBits($bitmapData)

$frameOrigin = [FigmaFrameCropScanner]::FindFrame(
  $bytes,
  $stride,
  $bitmap.Width,
  $bitmap.Height,
  $Width,
  $Height
)
$left = $frameOrigin[0]
$top = $frameOrigin[1]

if ($left -lt 0 -or $top -lt 0) {
  $bitmap.Dispose()
  throw "Could not detect selected frame outline for $Source at $Width x $Height."
}

$rect = [System.Drawing.Rectangle]::new($left + 1, $top + 1, $Width, $Height)
$cropped = $bitmap.Clone($rect, $bitmap.PixelFormat)
$cropped.Save($resolvedOutput, [System.Drawing.Imaging.ImageFormat]::Png)
$cropped.Dispose()
$bitmap.Dispose()

Write-Output "Cropped $Output from x=$($left + 1) y=$($top + 1) width=$Width height=$Height"
