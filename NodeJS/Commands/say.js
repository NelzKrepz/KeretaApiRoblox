module.exports = {
	Properties: {
		description: "Echo message.",
		usage: ' [silent] <message>',
		disabled: false,
		category: "Public"
	},
	RegularCommand: {
		properties: {
			aliases: ['echo']
		},
		execute: ({ Message, Command }) => {
			let prefix = `[${Message.member.displayName}]: `;
			if (Command.args[0].toLowerCase() == 'silent' && Message.member.roles.cache.some(role => role.name.toLowerCase().includes('staff'))) {
				prefix = '';
				Command.args.shift();
			}
			Message.channel.send(prefix+Command.args.join(' '));
			Message.delete();
		}
	},
	SlashCommand: {
		properties: {
			options: [
				{
					type: 3,
					name: 'message',
					description: 'Message to echo.',
					required: true
				},
				{
					type: 5,
					name: 'silent',
					description: 'Sets the message silent.'
				}
			]
		},
		execute: ({Interaction}) => {
			if (Interaction.options.getBoolean('silent')) {
				Interaction.channel.send(Interaction.options.getString('message', true));
				Interaction.reply({content:'Success!', ephemeral:true});
				//Interaction.deleteReply();
			} else {
				let prefix = `[${Interaction.member.displayName}]: `;
				Interaction.reply({content:prefix+Interaction.options.getString('message', true)});
			}
		}
	}
}