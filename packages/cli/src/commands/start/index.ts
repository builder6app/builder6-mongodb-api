import {Args, Command, Flags} from '@oclif/core'

export default class Start extends Command {

  static args = {
  }
  
  static description = 'Start b6 server.'

  static examples = [
    `<%= config.bin %> <%= command.id %> --port 5100`,
  ]

  static flags = {
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Start)

    const {bootstrap} = require('@builder6/server');
    this.log(`Launching builder6 to port ${flags.port}...`)
    bootstrap();

  }
}
