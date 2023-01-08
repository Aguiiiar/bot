import { Command } from "../../interfaces";

export const slash: Command = {
  name: "profile",
  description: "Comando para criar perfil para buscar freelance",
  options: [
    { name: "criar", description: "Criar um perfil", type: 6, required: false },
    {
      name: "exibir",
      description: "Exibir um perfil",
      type: 6,
      required: false,
    },
  ],
  testOnly: true,
  run: ({ interaction }) => {
    console.log(interaction.options?.get("criar")?.user);

    return interaction.followUp({
      content: `freela`,
    });
  },
};
