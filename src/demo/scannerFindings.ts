/**
 * Intentional demo-only weaknesses for Harness security scans (Snyk, SonarQube).
 * Do not copy these patterns into production code.
 *
 * Do not import this module from App or other browser entry points — it pulls in
 * Node-only packages (jsonwebtoken, etc.) that crash the client bundle at runtime.
 * Scanners still pick up this file via sonar.sources=src and SCA via package.json.
 */

import axios from 'axios'
import jwt from 'jsonwebtoken'
import _ from 'lodash'
import minimist from 'minimist'
import forge from 'node-forge'

/** SonarQube / secret scanners — hardcoded credential (demo). */
export const DEMO_HARNESS_API_KEY =
  'sk_live_demo_4eC39HqLyjWDarjtT1zdp7dc'

/** SonarQube — SQL injection style string concat (demo, never executed against a DB). */
export function demoBuildUserQuery(username: string): string {
  return `SELECT * FROM users WHERE name = '${username}'`
}

/** Snyk — lodash@4.17.15 prototype pollution (CVE-2020-8203, CVE-2021-23337). */
export function demoInsecureMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  return _.merge(target, source)
}

/** Snyk — axios@0.21.0 known SSRF / security issues. */
export async function demoInsecureFetch(url: string): Promise<unknown> {
  const response = await axios.get(url)
  return response.data
}

/** SonarQube — eval with user-controlled input. */
export function demoEvalExpression(expression: string): unknown {
  return eval(expression)
}

/** Snyk — jsonwebtoken@8.5.1 + weak secret (demo). */
export function demoVerifyToken(token: string): unknown {
  return jwt.verify(token, 'demo-insecure-jwt-secret')
}

/** Snyk — minimist@1.2.5 prototype pollution (CVE-2021-1753). */
export function demoParseArgs(argv: string[]): minimist.ParsedArgs {
  return minimist(argv)
}

/** Snyk — node-forge@0.10.0 signature forgery issues. */
export function demoForgeMd5(input: string): string {
  const md = forge.md.md5.create()
  md.update(input)
  return md.digest().toHex()
}
