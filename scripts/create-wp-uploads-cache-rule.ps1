#Requires -Version 7
<#
.SYNOPSIS
  Create (or ensure) a Cloudflare Cache Rule for /wp-content/uploads/*

.DESCRIPTION
  WordPress serves uploads with Cache-Control: max-age=14400. This rule overrides
  edge + browser TTL so Lighthouse / repeat visitors keep media longer.

  Requires an API token with:
    - Zone > Cache Rules > Edit
    - Account Rulesets > Edit
    - Account Filter Lists > Edit

  Usage:
    $env:CLOUDFLARE_API_TOKEN = "<token>"
    pwsh ./scripts/create-wp-uploads-cache-rule.ps1
#>

$ErrorActionPreference = "Stop"

$token = $env:CLOUDFLARE_API_TOKEN
if (-not $token) {
  throw "Set CLOUDFLARE_API_TOKEN first (Zone > Cache Rules > Edit)."
}

$zoneId = if ($env:CF_ZONE_ID) { $env:CF_ZONE_ID } else { "90ad3fd4fb70342a384acd753d4d1e93" }
$headers = @{
  Authorization  = "Bearer $token"
  "Content-Type" = "application/json"
}

$ruleDescription = "Long-cache WordPress uploads (PageSpeed)"
$ruleExpression = '(starts_with(http.request.uri.path, "/wp-content/uploads/"))'
# 31 days edge + browser — product media changes rarely; purge on big catalog updates if needed.
$ttlSeconds = 2678400

$ruleBody = @{
  description       = $ruleDescription
  expression        = $ruleExpression
  action            = "set_cache_settings"
  enabled           = $true
  action_parameters = @{
    cache       = $true
    edge_ttl    = @{
      mode    = "override_origin"
      default = $ttlSeconds
    }
    browser_ttl = @{
      mode    = "override_origin"
      default = $ttlSeconds
    }
  }
}

$entrypointUri = "https://api.cloudflare.com/client/v4/zones/$zoneId/rulesets/phases/http_request_cache_settings/entrypoint"

$existingRules = @()
try {
  $current = Invoke-RestMethod -Method Get -Uri $entrypointUri -Headers $headers
  if ($current.result.rules) {
    $existingRules = @($current.result.rules)
  }
  Write-Host "Found entrypoint ruleset $($current.result.id) with $($existingRules.Count) rule(s)."
} catch {
  $status = $_.Exception.Response.StatusCode.value__
  if ($status -ne 404) { throw }
  Write-Host "No cache-settings entrypoint yet — will create via PUT."
}

$already = $existingRules | Where-Object {
  $_.description -eq $ruleDescription -or $_.expression -eq $ruleExpression
}
if ($already) {
  Write-Host "Rule already present — no change."
  $already | ForEach-Object { "  id=$($_.id) enabled=$($_.enabled) expr=$($_.expression)" }
  exit 0
}

# Preserve existing rules; strip read-only fields CF rejects on PUT.
$normalized = foreach ($r in $existingRules) {
  $item = @{
    expression = $r.expression
    action     = $r.action
    enabled    = [bool]$r.enabled
  }
  if ($r.description) { $item.description = $r.description }
  if ($r.action_parameters) { $item.action_parameters = $r.action_parameters }
  if ($r.ref) { $item.ref = $r.ref }
  $item
}

$payload = @{ rules = @($normalized + $ruleBody) } | ConvertTo-Json -Depth 12
$result = Invoke-RestMethod -Method Put -Uri $entrypointUri -Headers $headers -Body $payload
if (-not $result.success) {
  throw ($result | ConvertTo-Json -Depth 8)
}

Write-Host "Created cache rule. Total rules: $($result.result.rules.Count)"
$result.result.rules | Where-Object { $_.description -eq $ruleDescription } | ForEach-Object {
  "  id=$($_.id) expr=$($_.expression)"
}
Write-Host "Verify with: curl -sI https://peisbutikken.no/wp-content/uploads/... | findstr /i cache-control"
