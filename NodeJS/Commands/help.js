const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
	Properties: {
		description: "Showing all commands.",
		usage: '',
		disabled: false,
		category: "Public"
	},
	RegularCommand: {
		properties: {
			aliases: ['commands', 'cmds']
		},
		execute: ({ Message, Client, Command }) => {
			let categories = [];
			let embed = new EmbedBuilder();
			embed.setTitle(Client.user.username + ' Command List');
			fs.readdirSync('./Commands/')
				.filter(file => file.endsWith("js"))
				.forEach((fileName) => {
					let fileProperties = require('../Commands/' + fileName).Properties;
					if (!categories.some(c => c.name === fileProperties.category)) {
						categories.push({ name: fileProperties.category, commands: [] });
					}
					categories.find(c => c.name === fileProperties.category)
						.commands.push({
							command: Command.prefix + fileName.replace('.js', '') + fileProperties.usage,
							description: fileProperties.description,
							disabled: fileProperties.disabled
						});
				});
			categories.forEach((category) => {
				//console.log(category);
				let cmds = '';
				category.commands.forEach((cmd) => {
					let disabled = cmd.disabled ? ' (Disabled)' : ''
					cmds += `\`${cmd.command}\` ${cmd.description}${disabled}\n`;
				});
				embed.addFields([
					{
						name: category.name,
						value: cmds,
						inline: true
					}
				])
			});

			Message.channel.send({ embeds: [embed] });
		}
	},
	SlashCommand: {
		properties: {},
		execute: ({Client, Command, Interaction }) => {
			let categories = [];
			let embed = new EmbedBuilder();
			embed.setTitle(Client.user.username + ' Command List');
			fs.readdirSync('./Commands/')
				.filter(file => file.endsWith("js"))
				.forEach((fileName) => {
					let fileProperties = require('../Commands/' + fileName).Properties;
					if (!categories.some(c => c.name === fileProperties.category)) {
						categories.push({ name: fileProperties.category, commands: [] });
					}
					categories.find(c => c.name === fileProperties.category)
						.commands.push({
							command: Command.prefix + fileName.replace('.js', '') + fileProperties.usage,
							description: fileProperties.description,
							disabled: fileProperties.disabled
						});
				});
			categories.forEach((category) => {
				//console.log(category);
				let cmds = '';
				category.commands.forEach((cmd) => {
					let disabled = cmd.disabled ? ' (Disabled)' : ''
					cmds += `\`${cmd.command}\` ${cmd.description}${disabled}\n`;
				});
				embed.addFields([
					{
						name: category.name,
						value: cmds,
						inline: true
					}
				])
			});
			
			Interaction.reply({ embeds: [embed] });
		}
	}
}