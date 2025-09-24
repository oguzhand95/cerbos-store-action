# Cerbos Store Action

A GitHub action to upload [Cerbos](https://github.com/cerbos/cerbos) policies to [Cerbos Hub](https://hub.cerbos.cloud/) stores.

Cerbos helps you super-charge your authorization implementation by writing context-aware access control policies for your application resources. Find out more about Cerbos using the following resources:

- [Cerbos website](https://cerbos.dev)
- [Cerbos documentation](https://docs.cerbos.dev)
- [Cerbos GitHub repository](https://github.com/cerbos/cerbos)
- [Cerbos Slack community](http://go.cerbos.io/slack)

## Usage

This action requires `cerbosctl` to be installed.

If [cerbos-setup-action](https://github.com/cerbos/cerbos-setup-action) already ran in the workflow, a version of `cerbos` and `cerbosctl` binaries will be available to use.
This action is going to check the available version and compare it against the version specified by the action input `version`.
If the versions do not match or the [cerbos-setup-action](https://github.com/cerbos/cerbos-setup-action) is not run before, this action will install `cerbosctl` with the version specified by the action input `version`.

```yaml
- name: Upload cerbos policies
  uses: cerbos/cerbos-store-action@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    store_id: ${{ secrets.CERBOS_HUB_STORE_ID }}
    client_id: ${{ secrets.CERBOS_HUB_CLIENT_ID }}
    client_secret: ${{ secrets.CERBOS_HUB_CLIENT_SECRET }}
    from_revision: HEAD~1
    to_revision: HEAD
    subdir: policies # optional subdirectory of Cerbos policies
```

## Development

### Prerequisites

You'll need to install

- Node.js, matching the version specified in our [.node-version](../.node-version) file

  - A version manager that supports this file is recommended, for example [n](https://github.com/tj/n#readme).
    Note that [nvm](https://github.com/nvm-sh/nvm) [does not](https://github.com/nvm-sh/nvm/issues/794).

- pnpm, matching the version specified in our [package.json](./package.json) file

  - After installing Node.js, you can enable [Corepack](https://nodejs.org/api/corepack.html) to transparently install the correct `pnpm` version:
    ```console
    $ corepack enable
    ```

### Build

```
pnpm run build
```
