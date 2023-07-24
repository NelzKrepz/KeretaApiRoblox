const API = require('../Modules/API.js')();
const axios = require('axios');
const {parse} = require('node-html-parser');
const { EmbedBuilder } = require('discord.js');
const sp = require('synchronized-promise')

function isRegistered(userId) {
	function e() {
		return axios.get(`https://kar-core.hasannelz.repl.co/api/v1/fastUsers?discord_user_id=${userId}`)
		.then((res) => {
			if (res.data[0]) return true
			else return false
		})
		.catch((err) => {
			console.error(err)
		})
	}
	let result = sp(e)()
	return result
}
function getRobloxInfo(robloxUserId) {
	let data = {
		userId: null,
		username: null,
		displayName: null,
		friendsCount: null,
		followersCount: null,
		followingCount: null,
	}
	function e() {
		return axios.get(`https://www.roblox.com/users/${robloxUserId}/profile`)
		.then((res)=>{
			let document = parse(res.data)
			function getData(data) {
				let attributes = JSON.stringify(document.querySelector("div.hidden").attributes)
				attributes = JSON.parse(attributes.replaceAll('-','_'))
				data = data.replaceAll('-','_')
				return eval('attributes.'+data)
			}
			data.userId = robloxUserId
			data.username = document.querySelector('div.profile-display-name').innerHTML.trim().slice(1)
			data.displayName = document.querySelector('h1.profile-name').innerHTML.trim()
			data.friendsCount = getData('data-friendscount')
			data.followersCount = getData('data-followerscount')
			data.followingCount = getData('data-followingscount')
			return data
		})
	}
	data = sp(e)()
	return data
}
function onSuccess(e) {
	return function(data) {
		data.discord = {
			userId: e.member.id,
			userTag: e.member.user.tag
		}
		data.roblox = getRobloxInfo(data.rbxUserId)
		
		let nick = `${data.roblox.displayName} (@${data.roblox.username})`;
		e.member.roles.add(e.guild.roles.cache.find(r=>r.name.search("Verified")>=0))
		if (data.isBuyer) e.member.roles.add(e.guild.roles.cache.find(r=>r.name.search("Buyer")>=0))
		
		let embed = new EmbedBuilder();
		embed.setColor("Green");
		embed.setTitle("Authentication Success!");
		embed.setImage('https://kar-core.hasannelz.repl.co/static/kar_logo.jpg');
		embed.setDescription(`Welcome **${nick}**!`);
		e.member.send({embeds:[embed]});

		let embed2 = new EmbedBuilder();
		embed2.setColor("Green");
		embed2.setTitle("Authentication Logs");
		embed2.addFields([
			{
				name: "User",
				value: `<@${e.member.id}>`,
				inline: true
			},
			{
				name: "Roblox Account",
				value: nick,
				inline: true
			},
			{
				name: "Is Buyer?",
				value: data.isBuyer ? "Yes" : "No",
				inline: true
			},
		])
		let vC=e.guild.channels.cache.find(c=>c.name.includes("verify-log"))
		vC.send({embeds:[embed2]})
		try {
			e.member.setNickname(nick);
		} catch (err) {
			console.error(err)
		}
	}
}

module.exports = {
	Properties: {
		description: "Verify.",
		usage: ' [<code>]',
		disabled: false,
		category: "Authentication"
	},
	RegularCommand: {
		properties: {
			aliases: ['auth']
		},
		execute: async ({ Message }) => {
			Message.member.createDM(true);
			let a = Date.now()
			let m = await Message.channel.send("Processing data.. Please wait...")
			axios.get(`https://kar-core.hasannelz.repl.co/api/v1/fastUsers?discord_user_id=${Message.member.id}`)
			.then(async(res) => {
				if (!res.data[0]) {
					let authData = API.generateAuth(Message.member.id, onSuccess(Message))
					Message.member.send(`Your verification code is: \`${authData.code}\`\nHOW TO:\nhttps://www.roblox.com/games/13430385933/KAR-Verification-Center\nJoin this game and type your code here\n\nNB: expired 15 minutes`)
					m.edit(`Verification code was sent to your dm! (${Math.floor((Date.now()-a)*10)/10000}s)`)
					setTimeout(()=>{
						m.delete()
					},5000)
				} else {
					let authInfo = await axios.get(`https://kar-core.hasannelz.repl.co/api/v1/users?discord_user_id=${Message.member.id}`)
					let robloxInfo = authInfo.data[0].roblox
					let nick = `${robloxInfo.displayName} (@${robloxInfo.username})`;
					m.edit(`You are already registered as **${nick}**! (${Math.floor((Date.now()-a)*10)/10000}s)`)
					setTimeout(()=>{
						m.delete()
					},5000)
				}
			})
			.catch((err) => {
				console.error(err)
			})
			Message.delete();
		}
	},
	SlashCommand: {
		properties: {},
		execute: async ({Interaction}) => {
			Interaction.reply({content:`This Slash Command has been disabled! Please use an regular command!`, ephemeral:true});
			// Interaction.member.createDM(true);
			// if (!isRegistered(Interaction.member.id)) {
			// 	let a = Date.now()
			// 	let authData = API.generateAuth(Interaction.member.id, onSuccess(Interaction))
			// 	Interaction.reply({content:`Your verification code is: \`${authData.code}\`\nHOW TO:\nhttps://www.roblox.com/games/13430385933/KAR-Verification-Center\nJoin this game and type your code here\n\nNB: expired 15 minutes`, ephemeral:true});
			// } else {
			// 	let a = Date.now()
			// 	let authInfo = await axios.get(`https://kar-core.hasannelz.repl.co/api/v1/users?discord_user_id=${Interaction.member.id}`)
			// 	let robloxInfo = authInfo.data[0].roblox
			// 	let nick = `${robloxInfo.displayName} (@${robloxInfo.username})`;
			// 	Interaction.reply({content:`You are already registered as **${nick}**! (${Math.floor((Date.now()-a)*10)/10000}s)`, ephemeral:true});
			// }
		}
	},
	Modules: {isRegistered, getRobloxInfo}
}