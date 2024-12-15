import {Args, Command, Flags} from '@oclif/core'

export default class Start extends Command {

  static args = {
  }
  
  static description = 'Start b6 server.'

  static examples = [
    `<%= config.bin %> <%= command.id %> --port 5100`,
  ]

  static flags = {
    port: Flags.integer({description: 'port to listen on', default: 5100}),
    userDir: Flags.string({char:'u', description:'use specified user directory'}),
    config: Flags.string({char:'c', default: 'b6.config.js', description:'use specified config file'}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Start)


    this.log(`Launching builder6 to port ${flags.port}...`)

  }
}
