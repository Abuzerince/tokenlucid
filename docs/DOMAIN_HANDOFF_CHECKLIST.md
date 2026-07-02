# Domain handoff checklist

This is the controlled handoff for replacing the temporary Render address with the official TokenLucid domain. Do not set `mainnetReady` or create a mainnet token merely because these steps are complete.

## Information needed from the owner

- purchased domain name;
- DNS provider access;
- chosen production mailbox provider;
- monitored owners for `hello@`, `security@` and `legal@`;
- legal entity and jurisdiction, if established.

## Changes after the domain is purchased

1. Add and verify the custom domain in Render; keep HTTPS-only redirects enabled.
2. Create `hello@DOMAIN`, `security@DOMAIN` and `legal@DOMAIN`; enable phishing-resistant MFA and store recovery codes offline.
3. Replace the remaining `YOUR_DOMAIN` values in:
   - `config/project.config.json`;
   - `config/token.config.json`;
   - `public/token-metadata.json`;
   - `public/.well-known/security.txt`;
   - `public/security.html`.
4. Change `public/openapi.json` from the temporary Render URL to the official HTTPS URL.
5. Update metadata image and external URLs, regenerate `metadataSha256`, then publish the final immutable metadata through the approved Arweave/IPFS workflow.
6. Regenerate both white papers and the release manifest; verify all PDF pages visually.
7. Create official X, Telegram and Discord accounts with the domain mailbox and hardware-key MFA, then add their URLs to `project.config.json`.
8. Run `npm run check`, `npm audit --omit=dev`, `npm run listing:check` and the complete live-site test suite.
9. Publish the domain migration commit and verify redirects, API responses, policies, `security.txt`, metadata and every external link.

## Still separate from domain setup

Mainnet launch additionally requires legal review, accountable entity/team disclosures, hardware or multisig custody, an independent security review, immutable asset publication, a funded private RPC, final platform-rule verification and an explicit mainnet authorization. Domain ownership alone does not satisfy these gates.
