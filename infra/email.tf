# Engage replies to Deaftly feedback from hello@deaftly.com through Cloudflare Email Sending.
resource "cloudflare_email_sending_subdomain" "app" {
  zone_id = data.cloudflare_zone.app.id
  name    = var.app_zone_name
}

# Made outside OpenTofu; listed so its record id can be imported rather than duplicated.
data "cloudflare_dns_records" "dmarc" {
  zone_id = data.cloudflare_zone.app.id
  type    = "TXT"
  name = {
    exact = "_dmarc.${var.app_zone_name}"
  }
}

output "existing_dmarc_records" {
  value = [for r in data.cloudflare_dns_records.dmarc.result : { id = r.id, content = r.content }]
}
