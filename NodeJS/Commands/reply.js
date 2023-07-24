module.exports = {
	Properties: {
		description: "Replying message as a bot. (WIP)",
		usage: ' [silent] <messageId> <message>',
		disabled: true,
		category: "Public"
	},
	RegularCommand: {
		properties: {
			aliases: []
		},
		execute: ({ Message, Command }) => {
			let prefix = `[${Message.member.displayName}]: `;
			if (Command.args[0].toLowerCase() == 'silent' && Message.member.roles.cache.some(role => role.name.toLowerCase().includes('staff'))) {
				prefix = '';
				Command.args.shift();
			}
			let msgId=0;
			if (Message.member.roles.cache.some(role => role.name.toLowerCase().includes('staff'))) {
				msgId=Command.args.shift();
				console.log(msgId)
			}
			console.log(Message.channel.messages.lastKey(),Message.channel.messages.cache.some(m => parseInt(m.id) == parseInt(msgId)));
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
console.log(Interaction);
			if (Interaction.options.getBoolean('silent')) {
				Interaction.channel.send(Interaction.options.getString('message', true));
				Interaction.reply({content:'Success!', ephemeral:true});
				//Interaction.deleteReply();
			} else
				Interaction.reply({content:Interaction.options.getString('message', true)});
		}
	}
}