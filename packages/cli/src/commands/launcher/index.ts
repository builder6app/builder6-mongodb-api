import {Args, Command, Flags} from '@oclif/core'

export default class Launcher extends Command {

  static args = {
  }
  
  static description = 'Launcher builder6 server.'

  static examples = [
    `<%= config.bin %> <%= command.id %> --port 5100`,
  ]

  static flags = {
    port: Flags.integer({description: 'server port', default: 5100, required: true}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Launcher)

    this.log(`Launching builder6 to port ${flags.port}...`)
  }
}
