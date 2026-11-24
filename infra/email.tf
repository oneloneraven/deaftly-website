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
