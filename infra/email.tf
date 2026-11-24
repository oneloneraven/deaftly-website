# Engage replies to Deaftly feedback from hello@deaftly.com through Cloudflare Email Sending.
# Onboarding the apex adds the cf-bounce MX, SPF and DKIM records; Proton's apex MX and SPF stay as they are.
resource "cloudflare_email_sending_subdomain" "app" {
  zone_id = data.cloudflare_zone.app.id
  name    = var.app_zone_name
}

# Made in the dashboard alongside Proton's records; imported so it isn't duplicated (two DMARC records void both).
import {
  to = cloudflare_dns_record.dmarc
  id = "${data.cloudflare_zone.app.id}/9929fcb97a0bfcf2a71b2ee98a3cee3b"
}

resource "cloudflare_dns_record" "dmarc" {
  zone_id = data.cloudflare_zone.app.id
  name    = "_dmarc.${var.app_zone_name}"
  type    = "TXT"
  ttl     = 1
  content = "\"v=DMARC1; p=quarantine; pct=100; adkim=s; aspf=s\""
}

# hello@ and support@ go to Engage, and so do its signed reply+…@ addresses: with subaddressing on, the reply@ rule matches them.
# Proton's apex MX, SPF and DKIM records must be deleted in the dashboard before this applies (they were never in OpenTofu).
resource "cloudflare_email_routing_dns" "app" {
  zone_id = data.cloudflare_zone.app.id
  name    = var.app_zone_name
}

resource "cloudflare_email_routing_settings" "app" {
  zone_id            = data.cloudflare_zone.app.id
  support_subaddress = true

  depends_on = [cloudflare_email_routing_dns.app]
}

resource "cloudflare_email_routing_rule" "engage" {
  for_each = toset(["hello", "support", "reply"])
  zone_id  = data.cloudflare_zone.app.id
  name     = "${each.key}@ to Engage"
  enabled  = true
  matchers = [{ type = "literal", field = "to", value = "${each.key}@${var.app_zone_name}" }]
  actions  = [{ type = "worker", value = [var.engage_worker_name] }]

  depends_on = [cloudflare_email_routing_settings.app]
}

resource "cloudflare_email_routing_catch_all" "app" {
  zone_id  = data.cloudflare_zone.app.id
  name     = "Drop everything else"
  enabled  = true
  matchers = [{ type = "all" }]
  actions  = [{ type = "drop" }]

  depends_on = [cloudflare_email_routing_dns.app]
}
