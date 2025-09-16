// Copyright 2021-2025 Zenauth Ltd.
// SPDX-License-Identifier: Apache-2.0

import {Octokit} from 'octokit'
import * as z from 'zod'
import * as core from '@actions/core'
import {Environment, Schema as EnvironmentSchema} from './environment'

const owner = 'cerbos'
const repository = 'cerbos'

const SchemaArgs = z.object({
  environment: EnvironmentSchema,
  octokit: z.instanceof(Octokit),
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

interface AssetArgs {
  octokit: Octokit
  environment: Environment
  version: string
}

const ValidateArgs = (args: AssetArgs): AssetArgs => {
  return SchemaArgs.parse(args)
}

export const Schema = z.object({
  url: z.url(),
  version: z
    .string()
    .regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
    )
})

export interface Asset {
  url: string
  version: string
}

const Validate = (asset: Asset): Asset => {
  return Schema.parse(asset)
}

export default async (args: AssetArgs): Promise<Asset> => {
  args = ValidateArgs(args)

  if (args.version === '' || args.version === 'latest') {
    const {data} = await args.octokit.request(
      'GET /repos/{owner}/{repo}/releases/latest',
      {
        owner: owner,
        repo: repository
      }
    )

    args.version = data.tag_name.split('v')[1]
  } else if (args.version.startsWith('v')) {
    args.version = args.version.split('v')[1]
  }
  core.info(`The asset version is resolved to ${args.version}`)

  const assetName = `cerbos_${args.version}_${args.environment.platform}_${args.environment.architecture}.tar.gz`
  core.info(`The asset name is resolved to ${assetName}`)

  const {data: releases} = await args.octokit.request(
    'GET /repos/{owner}/{repo}/releases',
    {
      owner: owner,
      repo: repository
    }
  )

  for (const release of releases) {
    for (const asset of release.assets) {
      if (asset.name === assetName) {
        const a: Asset = Validate({
          version: args.version,
          url: asset.browser_download_url
        })
        core.info(`The asset is resolved to ${JSON.stringify(a)}`)

        return a
      }
    }
  }

  core.setFailed(`Failed to fetch the asset with name ${assetName} from GitHub`)
  process.exit(1)
}
