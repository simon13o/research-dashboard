$ErrorActionPreference = 'Stop'

$out = 'D:\OneDrive\Documents\New project\outputs\manual-20260603-babybrezza\presentations\baby-brezza-competitor-list\output\baby-brezza-competitor-list-fixed.pptx'

function Add-Textbox {
  param(
    $slide,
    [single]$left,
    [single]$top,
    [single]$width,
    [single]$height,
    [string]$text,
    [int]$fontSize = 18,
    [bool]$bold = $false,
    [int]$rgb = 0x1F0B33
  )
  $shape = $slide.Shapes.AddTextbox(1, $left, $top, $width, $height)
  $shape.Line.Visible = 0
  $shape.Fill.Visible = 0
  $shape.TextFrame.TextRange.Text = $text
  $shape.TextFrame.TextRange.Font.Size = $fontSize
  $shape.TextFrame.TextRange.Font.Bold = [int]$bold
  $shape.TextFrame.TextRange.Font.Name = 'Aptos'
  $shape.TextFrame.TextRange.Font.Color.RGB = $rgb
  return $shape
}

function Add-Panel {
  param(
    $slide,
    [single]$left,
    [single]$top,
    [single]$width,
    [single]$height,
    [string]$title,
    [string]$body,
    [int]$accent = 0x2F5DE3
  )
  $panel = $slide.Shapes.AddShape(1, $left, $top, $width, $height)
  $panel.Fill.ForeColor.RGB = 0xFFFFFF
  $panel.Line.ForeColor.RGB = 0xD9E1E7
  $bar = $slide.Shapes.AddShape(1, $left, $top, $width, 6)
  $bar.Fill.ForeColor.RGB = $accent
  $bar.Line.Visible = 0
  Add-Textbox $slide ($left + 10) ($top + 12) ($width - 20) 18 $title 14 $true 0x1F0B33 | Out-Null
  Add-Textbox $slide ($left + 10) ($top + 34) ($width - 20) ($height - 40) $body 10 $false 0x6B7D8E | Out-Null
}

function Add-TitleBar {
  param($slide, [string]$title, [string]$subtitle)
  $bar = $slide.Shapes.AddShape(1, 0, 0, 960, 52)
  $bar.Fill.ForeColor.RGB = 0x331F0B
  $bar.Line.Visible = 0
  $accent = $slide.Shapes.AddShape(1, 0, 52, 135, 4)
  $accent.Fill.ForeColor.RGB = 0x2F5DE3
  $accent.Line.Visible = 0
  Add-Textbox $slide 24 10 620 20 $title 24 $true 0xFFFFFF | Out-Null
  Add-Textbox $slide 24 30 720 16 $subtitle 9 $false 0xE8DFD6 | Out-Null
}

$pp = $null
$pres = $null

try {
  if (Test-Path -LiteralPath $out) {
    Remove-Item -LiteralPath $out -Force
  }

  $pp = New-Object -ComObject PowerPoint.Application
  $pp.Visible = -1
  $pres = $pp.Presentations.Add()
  $pres.PageSetup.SlideSize = 16

  $slide = $pres.Slides.Add(1, 12)
  $slide.Background.Fill.ForeColor.RGB = 0xF8F6F4
  Add-TitleBar $slide 'Baby Brezza Competitor List' 'Competitive landscape by product category'
  Add-Textbox $slide 24 76 420 22 'Where pressure is concentrated' 20 $true 0x1F0B33 | Out-Null
  Add-Textbox $slide 24 102 460 32 'The sharpest overlap sits in formula prep, bottle washing, and practical feeding-appliance bundles.' 11 $false 0x6B7D8E | Out-Null
  Add-Panel $slide 24 154 220 118 'Formula Prep' '3 brands`nTommee Tippee, Bear, SnowBear'
  Add-Panel $slide 256 154 220 118 'Bottle Washer' '4 brands`nMomcozy, GROWNSY, Papablic, babycare' 0x5D63E3
  Add-Panel $slide 488 154 220 118 'Sterilizer' '8 brands`nBroad category with many incumbents' 0x788500
  Add-Panel $slide 24 286 220 118 'Food Maker' '7 brands`nStrong adjacency set led by Avent, BEABA, Bear' 0x9F4E8B
  Add-Panel $slide 256 286 220 118 'Bottle Warmer' '8 brands`nHighly crowded category across global and China brands' 0x008578
  Add-Panel $slide 488 286 220 118 'Cooler' '2 core references`nMomcozy and SnowBear are the clearest comps' 0xA56F4A
  Add-Panel $slide 724 76 190 90 'Tracked Brands' '9 brands tracked in this first-pass landscape' 0x2F5DE3
  Add-Panel $slide 724 180 190 90 'Washer Threats' '4 brands with visible bottle-washer coverage' 0x5D63E3
  Add-Panel $slide 724 284 190 90 'China / HK Focus' 'Bear, SnowBear, and babycare are the clearest local references' 0x008578

  $slide = $pres.Slides.Add(2, 12)
  $slide.Background.Fill.ForeColor.RGB = 0xF8F6F4
  Add-TitleBar $slide 'Global Competitors' 'International comparison set'
  Add-Panel $slide 24 78 430 86 'Tommee Tippee' 'Most direct formula-prep competitor with broad bottle-feeding appliance reach.'
  Add-Panel $slide 474 78 430 86 'Philips Avent' 'Incumbent leader in sterilizers, warmers, and food makers rather than prep automation.' 0x008578
  Add-Panel $slide 24 180 430 86 'Momcozy' 'High-priority challenger in bottle washer, portable warming, and cooler use cases.'
  Add-Panel $slide 474 180 430 86 'GROWNSY' 'Value-led online brand with wide appliance overlap and strong washer relevance.' 0x008578
  Add-Panel $slide 24 282 430 86 'Papablic' 'Direct bottle washer and sterilizer competitor to Bottle Washer Pro.'
  Add-Panel $slide 474 282 430 86 'BÉABA' 'Premium feeding-prep player strongest in food maker and warming adjacency.' 0x008578

  $slide = $pres.Slides.Add(3, 12)
  $slide.Background.Fill.ForeColor.RGB = 0xF8F6F4
  Add-TitleBar $slide 'China / HK Competitors' 'Feature breadth and value positioning dominate'
  Add-Panel $slide 24 88 280 138 'Bear' 'China value-for-money competitor spanning prep, warming, sterilizing, and food making.'
  Add-Panel $slide 322 88 280 138 'SnowBear' 'Broad China/HK appliance competitor with direct prep relevance and cooler adjacency.' 0x5D63E3
  Add-Panel $slide 620 88 280 138 'babycare' 'Lifestyle-led brand with younger-parent appeal and growing appliance breadth.' 0x008578
  Add-Panel $slide 24 250 280 100 'Price-value play' 'Bear and SnowBear are strong reference brands for China-channel benchmarking.' 0xA56F4A
  Add-Panel $slide 322 250 280 100 'Prep relevance' 'Bear and SnowBear are the clearest local references in formula-prep adjacent devices.' 0x788500
  Add-Panel $slide 620 250 280 100 'Positioning takeaway' 'The China set is about feature stacking, appliance bundles, and e-commerce appeal.' 0x9F4E8B

  $slide = $pres.Slides.Add(4, 12)
  $slide.Background.Fill.ForeColor.RGB = 0xF8F6F4
  Add-TitleBar $slide 'Coverage Matrix And Takeaways' 'Direct, partial, and adjacency overlap'
  Add-Textbox $slide 24 82 500 18 'Brand | Prep | Washer | Sterilizer | Food | Warmer | Cooler' 11 $true 0x1F0B33 | Out-Null
  $rows = @(
    'Tommee Tippee | Yes | - | Yes | Yes | Yes | Part',
    'Philips Avent | - | - | Yes | Yes | Yes | -',
    'Momcozy | - | Yes | Yes | - | Yes | Yes',
    'GROWNSY | Part | Yes | Yes | Yes | Yes | -',
    'Papablic | - | Yes | Yes | - | Yes | -',
    'BÉABA | Part | - | Yes | Yes | Yes | -',
    'Bear | Yes | - | Yes | Yes | Yes | -',
    'SnowBear | Yes | - | Yes | Yes | Yes | Part',
    'babycare | Part | Yes | Part | Yes | Part | -'
  )
  for ($i = 0; $i -lt $rows.Count; $i++) {
    Add-Textbox $slide 24 (106 + ($i * 22)) 510 16 $rows[$i] 10 $false 0x1F0B33 | Out-Null
  }
  $side = $slide.Shapes.AddShape(1, 560, 82, 340, 250)
  $side.Fill.ForeColor.RGB = 0x331F0B
  $side.Line.Visible = 0
  Add-Textbox $slide 576 94 220 18 'Key Takeaways' 18 $true 0xFFFFFF | Out-Null
  $bullets = @(
    'Tommee Tippee is the most direct formula-prep competitor.',
    'Momcozy, GROWNSY, Papablic, and babycare are the key bottle-washer competitors.',
    'Philips Avent and BÉABA are stronger in sterilizer, warmer, and food-maker categories.',
    'Bear and SnowBear are important China-market competitors with strong price/function coverage.',
    'Cooler remains an emerging gap; Momcozy and SnowBear are the clearest references.'
  )
  for ($i = 0; $i -lt $bullets.Count; $i++) {
    Add-Textbox $slide 576 (122 + ($i * 38)) 300 28 ('• ' + $bullets[$i]) 10 $false 0xFFFFFF | Out-Null
  }

  $pres.SaveAs($out)
  Write-Output $out
}
finally {
  if ($pres -ne $null) {
    $pres.Close()
    [void][System.Runtime.Interopservices.Marshal]::ReleaseComObject($pres)
  }
  if ($pp -ne $null) {
    $pp.Quit()
    [void][System.Runtime.Interopservices.Marshal]::ReleaseComObject($pp)
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
