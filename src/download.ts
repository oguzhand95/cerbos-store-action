// Copyright 2021-2025 Zenauth Ltd.
// SPDX-License-Identifier: Apache-2.0

import * as path from 'node:path'
import {Asset, Schema as AssetSchema} from './asset'
import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as z from 'zod'

const SchemaArgs = z.object({
  asset: AssetSchema,
  binaries: z.array(z.string())
})

interface DownloadArgs {
  asset: Asset
  binaries: string[]
}

const ValidateArgs = (args: DownloadArgs): DownloadArgs => {
  return SchemaArgs.parse(args)
}

export default async (args: DownloadArgs): Promise<void> => {
  args = ValidateArgs(args)

  const binaries = []
  for (const binary of args.binaries) {
    const cached = tc.find(binary, args.asset.version)
    if (cached !== '' || cached !== undefined || cached !== null) {
      core.info(`Found the cached binary ${binary} at ${cached}.`)
      core.addPath(cached)
    } else {
      binaries.push(binary)
    }
  }

  if (binaries.length == args.binaries.length) {
    core.info(`Found all binaries in the cache.`)
    return
  }

  let extractedAsset = ''
  try {
    const asset = await tc.downloadTool(args.asset.url)
    extractedAsset = await tc.extractTar(asset)

    core.info(`Successfully extracted downloaded asset to ${extractedAsset}`)
  } catch (error) {
    core.setFailed(`Error occured during retrieval of the archive: ${error}`)
    process.exit(1)
  }

  const cachedFiles = []
  try {
    core.info(
      `Adding the following binaries to the cache if exists in the downloaded asset: ${binaries}`
    )
    for (const binary of binaries) {
      const binaryPath = path.join(extractedAsset, binary)
      const cachedFile = await tc.cacheFile(
        binaryPath,
        binary,
        binary,
        args.asset.version
      )
      cachedFiles.push(cachedFile)

      core.info(`The binary ${binary} at ${cachedFile} is added to cache`)
    }
  } catch (error) {
    core.setFailed(
      `Error occured while adding binaries to tooling cache: ${error}`
    )
    process.exit(1)
  }

  try {
    core.info('Adding cache files to PATH')

    for (const cachedFile of cachedFiles) {
      core.addPath(cachedFile)

      core.info(`Added the cached file at ${cachedFile} to PATH`)
    }
  } catch (error) {
    core.setFailed(`Error occured while adding binaries to PATH: ${error}`)
    process.exit(1)
  }
}
