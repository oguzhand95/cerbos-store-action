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

  const binariesToDownload = []
  for (const binary of args.binaries) {
    const cached = tc.find(binary, args.asset.version)
    if (cached !== '' && cached !== undefined && cached !== null) {
      core.info(`Found the tool cached binary ${binary} at ${cached}`)
      core.addPath(cached)
    } else {
      core.info(`Failed to find the tool cached binary ${binary}`)
      binariesToDownload.push(binary)
    }
  }

  if (binariesToDownload.length === 0) {
    core.info(`Found all binaries in the tool cache. Skipping...`)
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

  const cachedBinaryPaths = []
  try {
    core.info(
      `Adding the following binaries to the tool cache if exists in the downloaded asset: ${binariesToDownload}`
    )
    for (const binary of binariesToDownload) {
      const binaryPath = path.join(extractedAsset, binary)
      const cachedBinaryPath = await tc.cacheFile(
        binaryPath,
        binary,
        binary,
        args.asset.version
      )
      cachedBinaryPaths.push(cachedBinaryPath)

      core.info(
        `The binary ${binary} at ${cachedBinaryPath} is added to tool cache`
      )
    }
  } catch (error) {
    core.setFailed(
      `Error occured while adding binaries to tool cache: ${error}`
    )
    process.exit(1)
  }

  try {
    for (const cachedBinaryPath of cachedBinaryPaths) {
      core.addPath(cachedBinaryPath)
      core.info(`Added the tool cached binary at ${cachedBinaryPath} to PATH`)
    }
  } catch (error) {
    core.setFailed(
      `Error occured while adding tool cached binaries to PATH: ${error}`
    )
    process.exit(1)
  }
}
