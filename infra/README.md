# Infrastructure

Everything provisionable is managed here with [OpenTofu](https://opentofu.org), the open-source fork of Terraform (same HCL, providers and state format): DNS, TLS and HSTS,
DNSSEC, CAA, security headers and cache rules for `deaftly.com`, Email
Sending on the apex (Engage replies from `hello@deaftly.com`), Email Routing
(`hello@`, `support@` and Engage's `reply+…@` addresses go to Engage) and the
DMARC record. The Worker itself is deployed by wrangler from the release workflows.
The only things outside OpenTofu are the state bucket (it must exist before
OpenTofu can use it), Worker runtime secrets, the CI credentials below, the
records Email Sending adds when it onboards the apex (the `cf-bounce` MX and
SPF, and its DKIM key) and the ones Email Routing adds when it's enabled (the
apex MX, SPF and DKIM).

State lives in the R2 bucket `deaftly-website-tfstate`, never in git.

## Workflows

| Workflow | Trigger | What it does |
|---|---|---|
| `infra.yml` | PR touching `infra/` (plan); push to `main` (apply) | Format check, validate, plan; refuses any plan that deletes or replaces. Skips the repository's first push, before credentials exist |
| `bootstrap-state.yml` | Manual | Creates the state bucket if it's missing; safe to re-run |
| `preview.yml` | PR | Uploads a Preview named `pr-<n>` and comments its URL |
| `deploy.yml` | `v*` tag | Deploys the tag (to beta when the project has one, otherwise production) |
| `promote.yml` | Manual, with a tag | Deploys a released tag to production (beta projects only) |

## Setup

1. The zone `deaftly.com` is active on Cloudflare.
2. Create the CI tokens below, the R2 state credentials, and the GitHub
   secrets and variables: `node <plugin>/skills/bootstrap/scripts/secrets.mjs cloudflare-tokens <project dir>`
   does the CI tokens, or follow this page by hand.
3. Run "Bootstrap OpenTofu state bucket".
4. Run "Infra" (dispatch it, or merge a change under `infra/`).
5. Add the DS record from `tofu output app_dnssec_ds_record` at the
   registrar.
6. In the dashboard, check the Worker's Preview URLs setting is on.

### Cloudflare API tokens

This section is kept in the private vault.

### R2 state credentials

This section is kept in the private vault.

### OpenTofu version

`infra.yml` pins OpenTofu exactly in `tofu_version`. Dependabot doesn't bump
it. To upgrade, take the newest `opentofu/opentofu` release that is more than
72 hours old (not a pre-release), change `tofu_version`, and run the same
version locally.

### Variables

`CLOUDFLARE_ACCOUNT_ID` as a repository variable. It isn't confidential.

### Worker secrets

This section is kept in the private vault.

## Disaster recovery

1. Run "Bootstrap OpenTofu state bucket".
2. Run "Infra" to recreate everything managed here.
3. Set the Worker secrets again, per environment.
4. Redeploy the latest release: run "Deploy" from its tag (and "Promote to
   production" where there's a beta).

## Teardown

Deliberately deleting the project's infrastructure:

1. Remove `prevent_destroy` from every resource in a PR (the infra workflow
   refuses plans that delete, so run the destroy locally).
2. Locally, with the infra apply token and state credentials in your
   environment:
   `tofu init -backend-config="endpoints={s3=\"https://<account id>.r2.cloudflarestorage.com\"}"`
   then `tofu destroy`.
3. Delete the Workers: `pnpm exec wrangler delete --env <env>` for each
   environment.
4. Empty and delete the `deaftly-website-tfstate` bucket in the dashboard.
5. Revoke the four Cloudflare tokens and the R2 credentials.
6. Remove the DS record at the registrar.
