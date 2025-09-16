// Copyright 2021-2025 Zenauth Ltd.
// SPDX-License-Identifier: Apache-2.0

import * as core from '@actions/core'
import * as os from 'os'
import * as z from 'zod'

export const Schema = z.object({
  architecture: z.enum(['arm64', 'x86_64']),
  platform: z.enum(['Darwin', 'Linux', 'Windows'])
})

export interface Environment {
  architecture: string
  platform: string
}

export const Validate = (environment: Environment): Environment => {
  return Schema.parse(environment)
}

export default (): Environment => {
  const architecture = os.arch()
  const platform = os.platform().toString()

  let env: Environment = {
    architecture: '',
    platform: ''
  }
  switch (architecture) {
    case 'x64':
      env.architecture = 'x86_64'
      break
    case 'arm64':
      env.architecture = 'arm64'
      break
  }

  switch (platform) {
    case 'linux':
      env.platform = 'Linux'
      break
    case 'darwin':
      env.platform = 'Darwin'
      break
    case 'win32':
      env.platform = 'Windows'
      break
  }

  env = Validate(env)
  core.info(`Environment is parsed as ${JSON.stringify(env)}`)
  return env
}
