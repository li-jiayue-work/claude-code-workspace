# GitHub CLI

`gh` is GitHub on the command line. It brings pull requests, issues, and other GitHub concepts to the terminal next to where you are already working with `git` and your code.

GitHub CLI is supported for users on GitHub.com, GitHub Enterprise Cloud, and GitHub Enterprise Server 2.20+ with support for macOS, Windows, and Linux.

## Documentation

For [installation options see below](#installation), for usage instructions [see the manual](https://cli.github.com/manual/).

## Contributing

If anything feels off or if you feel that some functionality is missing, please check out the [contributing page](.github/CONTRIBUTING.md). There you will find instructions for sharing your feedback, building the tool locally, and submitting pull requests to the project.

If you are a hubber and are interested in shipping new commands for the CLI, check out our [doc on internal contributions](docs/working-with-us.md)

## Installation

### macOS

- [Homebrew](docs/install_macos.md#homebrew)
- [Precompiled binaries](docs/install_macos.md#precompiled-binaries) on [releases page][]

For additional macOS packages and installers, see [community-supported docs](docs/install_macos.md#community-unofficial)

### Linux & Unix

- [Debian, Raspberry Pi, Ubuntu](docs/install_linux.md#debian)
- [Amazon Linux, CentOS, Fedora, openSUSE, RHEL, SUSE](docs/install_linux.md#rpm)
- [Precompiled binaries](docs/install_linux.md#precompiled-binaries) on [releases page][]

For additional Linux & Unix packages and installers, see [community-supported docs](docs/install_linux.md#community-unofficial)

### Windows

- [WinGet](docs/install_windows.md#winget)
- [Precompiled binaries](docs/install_windows.md#precompiled-binaries) on [releases page][]

For additional Windows packages and installers, see [community-supported docs](docs/install_windows.md#community-unofficial)

### Build from source

See here on how to [build GitHub CLI from source](docs/install_source.md).

### GitHub Codespaces

To add GitHub CLI to your codespace, add the following to your [devcontainer file](https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-features-to-a-devcontainer-file):

```json
"features": {
  "ghcr.io/devcontainers/features/github-cli:1": {}
}
```

### GitHub Actions

[GitHub-hosted runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners) have the GitHub CLI pre-installed, which is updated weekly.

If a specific version is needed, your GitHub Actions workflow will need to install it based on the macOS, Linux & Unix, or Windows instructions above.

For information on all pre-installed tools, see [`actions/runner-images`](https://github.com/actions/runner-images)

## Comparison with hub

For many years, [hub](https://github.com/github/hub) was the unofficial GitHub CLI tool. `gh` is a new project that helps us explore what an official GitHub CLI tool can look like with a fundamentally different design. While both tools bring GitHub to the terminal, `hub` behaves as a proxy to `git`, and `gh` is a standalone tool. Check out our [more detailed explanation](docs/gh-vs-hub.md) to learn more.

[releases page]: https://github.com/cli/cli/releases/latest
