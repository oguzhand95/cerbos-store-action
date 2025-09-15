// Copyright 2021-2025 Zenauth Ltd.
// SPDX-License-Identifier: Apache-2.0

import Asset from '../src/asset'
import { createEnvironment } from './environment.test'
import {describe, it} from 'node:test'
import assert from 'node:assert'
import {Octokit} from 'octokit'

describe('Asset function', () => {
  const cerbosVersion = 'v0.46.0'
  const octokit = new Octokit({
    request: {
      fetch
    }
  })

  it('should return correct asset name and URL for v0.46.0 (Linux x86_64)', async () => {
    const asset = await Asset({
      octokit: octokit,
      environment: createEnvironment('Linux', 'x86_64'),
      version: cerbosVersion
    })

    assert.strictEqual(asset.version, '0.46.0')
    assert.strictEqual(asset.url, 'https://github.com/cerbos/cerbos/releases/download/v0.46.0/cerbos_0.46.0_Linux_x86_64.tar.gz')
  })

  it('should return correct asset name and URL for v0.46.0 (Linux arm64)', async () => {
    const asset = await Asset({
      octokit: octokit,
      environment: createEnvironment('Linux', 'arm64'),
      version: cerbosVersion
    })

    assert.strictEqual(asset.version, '0.46.0')
    assert.strictEqual(asset.url, 'https://github.com/cerbos/cerbos/releases/download/v0.46.0/cerbos_0.46.0_Linux_arm64.tar.gz')
  })

  it('should return correct asset name and URL for v0.46.0 (Darwin x86_64)', async () => {
    const asset = await Asset({
      octokit: octokit,
      environment: createEnvironment('Darwin', 'x86_64'),
      version: cerbosVersion
    })

    assert.strictEqual(asset.version, '0.46.0')
    assert.strictEqual(asset.url, 'https://github.com/cerbos/cerbos/releases/download/v0.46.0/cerbos_0.46.0_Darwin_x86_64.tar.gz')
  })

  it('should return correct asset name and URL for v0.46.0 (Darwin arm64)', async () => {
    const asset = await Asset({
      octokit: octokit,
      environment: createEnvironment('Darwin', 'arm64'),
      version: cerbosVersion
    })

    assert.strictEqual(asset.version, '0.46.0')
    assert.strictEqual(asset.url, 'https://github.com/cerbos/cerbos/releases/download/v0.46.0/cerbos_0.46.0_Darwin_arm64.tar.gz')
  })
})