import dotenv from "dotenv";
dotenv.config();
import {
  ApplicationCommandDataResolvable,
  Client,
  Collection,
} from "discord.js";
import { Command, Event, RegisterCommandsOptions } from "../interfaces";
import { readdirSync } from "fs";
import * as path from "path";

export default class Zax extends Client {
  public commands: Collection<string, Command> = new Collection();
  public events: Collection<string, Event> = new Collection();
  public config = process.env;
  public aliases: Collection<string, Command> = new Collection();

  public constructor() {
    super({
      intents: ["Guilds", "GuildMessages", "GuildWebhooks", "GuildMembers"],
    });
  }

  async importFile(filePath: string) {
    return (await import(filePath))?.slash;
  }

  async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
    if (guildId) {
      this.guilds.cache.get(guildId)?.commands.set(commands);
      console.log("Registrei os comandos no servidor de teste");
    } else {
      this.application?.commands.set(commands);
      console.log("Registrei comandos globalmente.");
    }
  }

  async registerModules() {
    const slashCommands: ApplicationCommandDataResolvable[] = [];

    const commandPath = path.join(__dirname, "..", "commands");

    readdirSync(commandPath).forEach((dir) => {
      const commands = readdirSync(`${commandPath}/${dir}`).filter((file) =>
        file.endsWith(".ts")
      );
      commands.forEach(async (file) => {
        const command: Command = await this.importFile(
          `${commandPath}/${dir}/${file}`
        );
        console.log(command.name + " foi carregado com sucesso!");
        if (!command.name) return;
        this.commands.set(command.name, command);
        slashCommands.push(command);
      });
    });

    this.on("ready", () => {
      this.registerCommands({
        commands: slashCommands,
        guildId: `${this.config.TESTSERVER}`,
      });
    });
  }

  public async init() {
    this.login(this.config.TOKEN);
    this.registerModules();

    if (!this.config.TESTSERVER)
      console.log("Não configurou o servidor de testes.");

    const eventPath = path.join(__dirname, "..", "events");
    readdirSync(eventPath).forEach(async (file) => {
      if (!file.endsWith(".ts")) return;
      const { event } = await import(`${eventPath}/${file}`);
      this.events.set(event.name, event);
      this.on(event.name, event.run.bind(null, this));
    });
  }
}
