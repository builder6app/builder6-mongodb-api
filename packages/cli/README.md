@builder6/cli
=================

A new CLI generated with oclif


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@builder6/cli.svg)](https://npmjs.org/package/@builder6/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@builder6/cli.svg)](https://npmjs.org/package/@builder6/cli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @builder6/cli
$ b6 COMMAND
running command...
$ b6 (--version)
@builder6/cli/0.7.8 darwin-arm64 node-v18.20.2
$ b6 --help [COMMAND]
USAGE
  $ b6 COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`b6 hello PERSON`](#b6-hello-person)
* [`b6 hello world`](#b6-hello-world)
* [`b6 help [COMMAND]`](#b6-help-command)
* [`b6 plugins`](#b6-plugins)
* [`b6 plugins add PLUGIN`](#b6-plugins-add-plugin)
* [`b6 plugins:inspect PLUGIN...`](#b6-pluginsinspect-plugin)
* [`b6 plugins install PLUGIN`](#b6-plugins-install-plugin)
* [`b6 plugins link PATH`](#b6-plugins-link-path)
* [`b6 plugins remove [PLUGIN]`](#b6-plugins-remove-plugin)
* [`b6 plugins reset`](#b6-plugins-reset)
* [`b6 plugins uninstall [PLUGIN]`](#b6-plugins-uninstall-plugin)
* [`b6 plugins unlink [PLUGIN]`](#b6-plugins-unlink-plugin)
* [`b6 plugins update`](#b6-plugins-update)
* [`b6 start`](#b6-start)

## `b6 hello PERSON`

Say hello

```
USAGE
  $ b6 hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ b6 hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/builder6app/cli/blob/v0.7.8/src/commands/hello/index.ts)_

## `b6 hello world`

Say hello world

```
USAGE
  $ b6 hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ b6 hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/builder6app/cli/blob/v0.7.8/src/commands/hello/world.ts)_

## `b6 help [COMMAND]`

Display help for b6.

```
USAGE
  $ b6 help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for b6.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.19/src/commands/help.ts)_

## `b6 plugins`

List installed plugins.

```
USAGE
  $ b6 plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ b6 plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.22/src/commands/plugins/index.ts)_

## `b6 plugins add PLUGIN`

Installs a plugin into b6.

```
USAGE
  $ b6 plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into b6.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the B6_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the B6_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ b6 plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ b6 plugins add myplugin

  Install a plugin from a github url.

    $ b6 plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ b6 plugins add someuser/someplugin
```

## `b6 plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ b6 plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ b6 plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.22/src/commands/plugins/inspect.ts)_

## `b6 plugins install PLUGIN`

Installs a plugin into b6.

```
USAGE
  $ b6 plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into b6.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the B6_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the B6_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ b6 plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ b6 plugins install myplugin

  Install a plugin from a github url.

    $ b6 plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ b6 plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.22/src/commands/plugins/install.ts)_

## `b6 plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ b6 plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ b6 plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.22/src/commands/plugins/link.ts)_

## `b6 plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ b6 plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ b6 plugins unlink
  $ b6 plugins remove

EXAMPLES
  $ b6 plugins remove myplugin
```

## `b6 plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ b6 plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.22/src/commands/plugins/reset.ts)_

## `b6 plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ b6 plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ b6 plugins unlink
  $ b6 plugins remove

EXAMPLES
  $ b6 plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.22/src/commands/plugins/uninstall.ts)_

## `b6 plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ b6 plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ b6 plugins unlink
  $ b6 plugins remove

EXAMPLES
  $ b6 plugins unlink myplugin
```

## `b6 plugins update`

Update installed plugins.

```
USAGE
  $ b6 plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.22/src/commands/plugins/update.ts)_

## `b6 start`

Start b6 server.

```
USAGE
  $ b6 start [--port <value>] [-u <value>] [-c <value>]

FLAGS
  -c, --config=<value>   [default: b6.config.js] use specified config file
  -u, --userDir=<value>  use specified user directory
      --port=<value>     [default: 5100] port to listen on

DESCRIPTION
  Start b6 server.

EXAMPLES
  $ b6 start --port 5100
```

_See code: [src/commands/start/index.ts](https://github.com/builder6app/cli/blob/v0.7.8/src/commands/start/index.ts)_
<!-- commandsstop -->
