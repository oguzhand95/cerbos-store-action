// Copyright 2021-2025 Zenauth Ltd.
// SPDX-License-Identifier: Apache-2.0

import * as path from 'node:path'
import {Asset, Schema as AssetSchema} from './asset'
import * as core from '@actions/core'
import * as io from '@actions/io'
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
    let which = ''
    try {
      which = await io.which(binary, true)
    } catch (e) {
      const err = e as Error
      if (!err.message.startsWith('Unable to locate executable file')) {
        core.setFailed(JSON.stringify(err))
        process.exit(1)
      }
    }

    if (!which) {
      core.info(`Failed to find binary ${binary} in PATH`)
    }

    const cached = tc.find(binary, args.asset.version)
    if (!cached) {
      core.info(`Failed to find binary ${binary} in tool cache`)
    }

    if (!cached && !which) {
      core.info(`Adding the ${binary} to the list of binaries to download`)
      binariesToDownload.push(binary)
    } else if (cached && !which) {
      core.info(
        `Adding the binary ${binary} already available in the tool cache to PATH`
      )
      core.addPath(cached)
    } else if (!cached && which) {
      core.info(
        `Removing the binary ${binary} from PATH and adding it to the list of binaries to (re)download`
      )
      io.rmRF(which)
      binariesToDownload.push(binary)
    } else {
      core.info(
        `Skipping the binary ${binary} as it is already in the tool cache and available in PATH`
      )
    }
  }

  if (binariesToDownload.length === 0) {
    core.info(`Found all binaries in the tool cache. Skipping...`)
    return
  }

  let extractedAsset = ''
  try {
    core.info(`Downloading the asset from URL ${args.asset.url}`)
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
        `The binary ${binary} at ${cachedBinaryPath} is added to the tool cache`
      )
    }
  } catch (error) {
    core.setFailed(
      `Error occured while adding binaries to the tool cache: ${error}`
    )
    process.exit(1)
  }

  try {
    for (const cachedBinaryPath of cachedBinaryPaths) {
      core.addPath(cachedBinaryPath)
      core.info(
        `Added the binary ${cachedBinaryPath} from the tool cache to PATH`
      )
    }
  } catch (error) {
    core.setFailed(
      `Error occured while adding binaries from the tool cache to PATH: ${error}`
    )
    process.exit(1)
  }
}
