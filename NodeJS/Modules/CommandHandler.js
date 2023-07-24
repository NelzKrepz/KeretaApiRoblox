const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

let prefix = ','
let commands = fs.readdirSync('./Commands/').filter(file => file.endsWith("js"));

module.exports = (Client, Logger) => {
	// Regular Commands
	Client.on('messageCreate', message => {
		if (message.author.bot) return;
		if (!message.content.startsWith(prefix)) return;

		let Command = {};
		Command.args = message.content.slice(prefix.length).trim().split(/ +/g);
		Command.content = Command.args.shift().toLowerCase();
		Command.prefix = prefix;
		try {
			let f = null;
			for (var i = 0; i < commands.length; i++) {
				let cmd = commands[i].replace(".js", "");
				let file = require(`../Commands/${cmd}.js`);
				let s = 0;
				if (!file.RegularCommand.properties.aliases.includes(cmd)) file.RegularCommand.properties.aliases.push(cmd);
				if (file.Properties.disabled !== true || !file.Properties.disabled) {
					file.RegularCommand.properties.aliases.forEach(aliases => {
						if (aliases == Command.content) {
							f = Command.content;
							file.RegularCommand.execute({ Client, Command, Message: message });
						}
					});
				} else {
					file.RegularCommand.properties.aliases.forEach(aliases => {
						if (aliases == Command.content) {
							f = Command.content;
							if (s >= 0) {
								s++;
								Logger.log(`Command '${prefix}${Command.content}' is currently disabled`);
							}
							if (s >= 0) {
								s++;
								message.channel.send(`Sorry ${message.author} command that you input is currently disabled`);
							}
						}
					});
				}
			}
			if (f == null) {
				message.channel.send(`Command not found! \`${prefix}${Command.content}\``);
			}
		} catch (e) {
			Logger.log(e.message);
		} finally {
			Logger.log(`${message.author.tag} | ${message.guild.name} #${message.channel.name}: ${message.content}`);
		}
	});

	// Slash Commands
	(() => {
		let slashCommands = [];
		const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

		// Collecting Slash Commands
		commands.forEach((fileName) => {
			let file = require('../Commands/' + fileName);
			let data = {
				name: fileName.replace('.js', ''),
				description: file.Properties.description,
			};
			if (typeof(file.SlashCommand.properties.options) !== 'undefined')
				data.options = file.SlashCommand.properties.options
			slashCommands.push(data);
		});

		// Registering Slash Commands
		try {
			rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {body:slashCommands});
		} catch (err) {
			Logger.error(err);
		}

		// Interaction Event
		Client.on('interactionCreate', interaction => {
			if (!interaction.isChatInputCommand()) return;
			let Command = {};
			Command.prefix = ',';
			Command.content = interaction.commandName
			let file = require(`../Commands/${interaction.commandName}.js`);

			try {
				file.SlashCommand.execute({ Client, Command, Interaction: interaction });
			} catch (err) {
				Logger.error(err);
			} finally {
				Logger.log(`${interaction.member.user.tag} | ${interaction.guild.name} #${interaction.channel.name}: /${Command.content}`);
			}
		});
	})();
};