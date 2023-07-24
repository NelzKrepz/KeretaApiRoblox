module.exports = {
	Properties: {
		description: "Run eval.",
		usage: ' <javascript-code>',
		disabled: false,
		category: "Private"
	},
	RegularCommand: {
		properties: {
			aliases: ['exec', 'run']
		},
		execute: ({ Message, Command }) => {
			if (Message.author.id !== '726071404050514011') {
				Message.reply("Mau ngapain ente? Gabisa :P");
				return;
			}
			let content = Command.args.join(' ');
			Message.delete()
			eval(content);
		}
	},
	SlashCommand: {
		properties: {
			// options: [
			// 	{
			// 		type: 3,
			// 		name: 'message',
			// 		description: 'Message to echo.',
			// 		required: true
			// 	},
			// 	{
			// 		type: 5,
			// 		name: 'silent',
			// 		description: 'Sets the message silent.'
			// 	}
			// ]
		},
		execute: ({Interaction}) => {
			Interaction.reply({content:`This Slash Command has been disabled! Please use an regular command!`, ephemeral:true});
		}
	}
}