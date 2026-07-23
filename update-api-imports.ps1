# PowerShell script to update all API routes to use getSupabaseAdmin()

$files = Get-ChildItem -Path "app\api" -Recurse -Filter "route.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip if already using getSupabaseAdmin
    if ($content -match "getSupabaseAdmin") {
        Write-Host "Skipping $($file.Name) - already updated" -ForegroundColor Green
        continue
    }
    
    # Check if file uses supabaseAdmin
    if ($content -match "supabaseAdmin") {
        Write-Host "Updating $($file.FullName)" -ForegroundColor Yellow
        
        # Replace import statement
        $content = $content -replace "import \{ supabaseAdmin \} from '@/lib/supabase/client'", "import { getSupabaseAdmin } from '@/lib/supabase/client'"
        
        # Replace usage: const supabase = supabaseAdmin
        $content = $content -replace "const supabase = supabaseAdmin", "const supabase = getSupabaseAdmin()"
        
        # Write back
        Set-Content -Path $file.FullName -Value $content -NoNewline
        
        Write-Host "Updated $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`nUpdate complete!" -ForegroundColor Cyan
