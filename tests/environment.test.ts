// Copyright 2021-2025 Zenauth Ltd.
// SPDX-License-Identifier: Apache-2.0

import {describe, it} from 'node:test'
import { Environment, Validate as ValidateEnvironment } from '../src/environment'

export const createEnvironment = (platform: string, architecture: string): Environment => {
    return {
        architecture,
        platform
    };
}

describe('Validate function', () => {
  it('should be successful given input Linux x86_64', async () => {
    const env = createEnvironment('Linux', 'x86_64')
    ValidateEnvironment(env)
  })

  it('should be successful given input Linux arm64', async () => {
    const env = createEnvironment('Linux', 'arm64')
    ValidateEnvironment(env)
  })

  it('should be successful given input Darwin x86_64', async () => {
    const env = createEnvironment('Darwin', 'x86_64')
    ValidateEnvironment(env)
  })

  it('should be successful given input Darwin arm64', async () => {
    const env = createEnvironment('Darwin', 'arm64')
    ValidateEnvironment(env)
  })
})