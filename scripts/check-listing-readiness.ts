import fs from 'node:fs'
import path from 'node:path'
import { atomicWriteJson, loadConfig, validateConfig } from './lib.js'

type ProjectConfig = {
  status: string; mintAddress: string; officialWebsite: string; officialEmail: string; sourceCodeUrl: string
  englishWhitepaperUrl: string; privacyUrl: string; termsUrl: string
  socials: Record<string, string>; legalEntity: Record<string, string>; teamPublic: boolean
  trademarkSearchCompleted: boolean; independentAuditUrl: string
  tge: { dateUtc: string; announcementUrl: string }
  market: { dex: string; pair: string; poolAddress: string; initialLiquidityUsd: number; liquidityPolicyUrl: string }
  circulatingSupply: { amount: number; asOfUtc: string; methodologyUrl: string }
}

const project = JSON.parse(fs.readFileSync(path.resolve('config/project.config.json'), 'utf8')) as ProjectConfig
const token = loadConfig()
const checks: Array<{ id: string; ready: boolean; detail: string }> = []
const add = (id: string, ready: boolean, detail: string) => checks.push({ id, ready, detail })
const realHttps = (value: string) => /^https:\/\//.test(value) && !value.includes('YOUR_')

add('token-config', validateConfig(token, true).length === 0 && token.mainnetReady, 'Mainnet token config, immutable metadata and wallet addresses')
const deploymentPath = path.resolve('deployment/mainnet-beta.json')
const deployment = fs.existsSync(deploymentPath) ? JSON.parse(fs.readFileSync(deploymentPath, 'utf8')) as { mint?: string } : null
add('mainnet-deployment', Boolean(deployment?.mint && deployment.mint === project.mintAddress), 'Finalized mint record matches the public project mint address')
add('official-domain', realHttps(project.officialWebsite), 'Working HTTPS project website')
add('domain-email', !project.officialEmail.includes('YOUR_') && project.officialEmail.includes('@'), 'Official-domain contact email')
add('english-whitepaper', realHttps(project.englishWhitepaperUrl) && fs.existsSync(path.resolve('public/whitepaper-en.pdf')), 'Public English white paper')
add('source-code', realHttps(project.sourceCodeUrl), 'Public source repository')
add('policies', realHttps(project.privacyUrl) && realHttps(project.termsUrl), 'Privacy policy and terms')
add('security-contact', !fs.readFileSync(path.resolve('public/.well-known/security.txt'), 'utf8').includes('YOUR_DOMAIN'), 'Official security contact and disclosure policy')
add('social-presence', Boolean(project.socials.x && project.socials.telegram), 'Official X and Telegram URLs')
add('legal-entity', Object.values(project.legalEntity).every(Boolean), 'Legal entity, jurisdiction and registration details')
add('team', project.teamPublic, 'Public team biographies or accountable representatives')
add('trademark', project.trademarkSearchCompleted, 'Name/ticker/logo trademark and collision review')
add('independent-audit', realHttps(project.independentAuditUrl), 'Independent security review URL')
add('tge', Boolean(project.tge.dateUtc && realHttps(project.tge.announcementUrl)), 'Verifiable UTC TGE announcement')
add('liquidity', Boolean(project.market.poolAddress && project.market.initialLiquidityUsd > 0 && realHttps(project.market.liquidityPolicyUrl)), 'Live DEX pool, material liquidity and published policy')
add('supply-methodology', Boolean(project.circulatingSupply.asOfUtc && realHttps(project.circulatingSupply.methodologyUrl)), 'Timestamped circulating-supply methodology')

const ready = checks.every(item => item.ready)
const report = { ready, generatedAt: new Date().toISOString(), passed: checks.filter(item => item.ready).length, total: checks.length, checks }
atomicWriteJson('output/listing/readiness.json', report)
console.log(JSON.stringify(report, null, 2))
if (!ready) process.exitCode = 1
