// Copyright 2021-2025 Zenauth Ltd.
// SPDX-License-Identifier: Apache-2.0

import {Octokit} from 'octokit'
import Asset from './asset'
import Download from './download'
import Environment from './environment'
import {HttpsProxyAgent} from 'https-proxy-agent'
import * as z from 'zod'

const SchemaArgs = z.object({
  binaries: z.array(z.string()),
  githubToken: z.string(),
  version: z.union([
    z.literal(''),
    z.literal('latest'),
    z
      .string()
      .regex(
        /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
      )
  ])
})

interface SetupArgs {
  binaries: string[]
  githubToken: string
  version: string
}

const ValidateArgs = (args: SetupArgs): SetupArgs => {
  return SchemaArgs.parse(args)
}

export default async (args: SetupArgs) => {
  args = ValidateArgs(args)

  const octokit = new Octokit({
    auth: args.githubToken,
    request: {
      agent: process.env.http_proxy
        ? new HttpsProxyAgent(process.env.http_proxy)
        : undefined,
      fetch
    },
    userAgent: process.env['GITHUB_REPOSITORY']
      ? process.env['GITHUB_REPOSITORY']
      : 'cerbos-store-action'
  })

  Download({
    asset: await Asset({
      environment: Environment(),
      octokit: octokit,
      version: args.version
    }),
    binaries: args.binaries
  })
}
