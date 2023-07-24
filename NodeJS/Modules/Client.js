require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

const Bot = new Client({ intents:
[
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildPresences,
]});

Bot.on('ready', () => {
	console.log('I AM READY!');

	let activities = [
		'2-discord.gg/k8Dds6QrTu',
		'0-Kereta Api Roblox',
	];
	setInterval(() => {
		let act = activities[Math.floor(Math.random() * activities.length)].split('-');
		Bot.user.setActivity(act[1], {type:parseInt(act[0])});
	}, 10000);
});
Bot.login(process.env.TOKEN);

module.exports = () => {
	return Bot;
};