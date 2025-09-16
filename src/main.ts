// Copyright 2021-2025 Zenauth Ltd.
// SPDX-License-Identifier: Apache-2.0

import * as core from '@actions/core'
import Setup from './setup'

async function run(): Promise<void> {
  const githubToken = core.getInput('github_token')
  if (githubToken === '') {
    core.warning(
      `The action input 'github_token' is unavailable. Stricter rate limiting will be applied by GitHub.`
    )
  }
  const version = core.getInput('version')

  Setup({
    githubToken: githubToken,
    version: version
  })
}

run()
