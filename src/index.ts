// Copyright 2021-2025 Zenauth Ltd.
// SPDX-License-Identifier: Apache-2.0

import * as core from '@actions/core'
import * as common from 'cerbos-actions-common'
import {HttpsProxyAgent} from 'https-proxy-agent'
import {Octokit} from 'octokit'

async function run(): Promise<void> {
  const githubToken = core.getInput('github_token')
  if (githubToken === '') {
    core.warning(
      `The action input 'github_token' is unavailable. Stricter rate limiting will be applied by GitHub.`
    )
  }

  const storeID = core.getInput('store_id')
  const clientID = core.getInput('client_id')
  const clientSecret = core.getInput('client_secret')
  if (storeID === '' || (clientID === '' && clientSecret === '')) {
    core.setFailed(
      "The action input 'store_id', 'client_id' and 'client_secret' must be specified"
    )
    process.exit(1)
  }

  const fromRevision = core.getInput('from_revision')
  const toRevision = core.getInput('to_revision')
  if (fromRevision === '' || toRevision === '') {
    core.setFailed(
      "The action input 'from_revision' and 'to_revision' must be specified"
    )
    process.exit(1)
  }

  const octokit = new Octokit({
    auth: githubToken,
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

  common.setup({
    binaries: ['cerbosctl'],
    githubToken: githubToken,
    octokit: octokit,
    version: core.getInput('version')
  })

  common.upload({
    clientID: clientID,
    clientSecret: clientSecret,
    storeID: storeID,
    fromRevision: fromRevision,
    toRevision: toRevision,
    subDir: core.getInput('subdir')
  })
}

run()
