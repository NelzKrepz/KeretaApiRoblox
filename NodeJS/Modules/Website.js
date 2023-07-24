const express = require('express');
const app = express();
const API = require('./API.js')();
const moment = require('moment');
const Database = require('./Database.js')();
const db = new Database('keretaapiroblox');
const {getRobloxInfo} = require('../Commands/verify.js').Modules

function numString(number) {
	const chars = "abcdefghij"
	let str = ""
	number = number.toString().split("")
    for (let i=0; i<number.length; i++) {
		str+=chars[number[i]]
	}
	return str
}
function stringNum(string) {
	const chars = {
		a: 0,
		b: 1,
		c: 2,
		d: 3,
		e: 4,
		f: 5,
		g: 6,
		h: 7,
		i: 8,
		j: 9,
	}
	let str = ""
	string = string.toString().split("")
    for (let i=0; i<string.length; i++) {
		eval(`str+=chars.${string[i]}`)
	}
	return str
}

db.selectFromTable('users', (err) => {
	if (err) {
		db.createTable('users', [
			{
				name: "discord_user_id",
				type: "VARCHAR",
				length: 999999999999999999,
				default: null,
				null: false,
				auto_increment: false,
			},
			{
				name: "roblox_user_id",
				type: "VARCHAR",
				length: 999999999999999999,
				default: null,
				null: false,
				auto_increment: false,
			},
			{
				name: "is_buyer",
				type: "BOOLEAN",
				length: null,
				default: null,
				null: false,
				auto_increment: false,
			},
		])
	}
});

module.exports = (Client, Log) => {
	app.use(express.json())
	app.use('/static', express.static('statics'));
	
	app.get('/', (req, res) => {
		res.sendStatus(200)
	});
	
	app.get('/api/v1/:api', (req, res) => {
		res.set('Content-Type', 'application/json');
		
		let { api } = req.params
		let query = req.query
		if (api==="users") {
			db.selectFromTable('users', (err, users) => {
				if (err) res.json(err);
				
				let results = users
				let isDefault = true
				let queryLength = 0
				for (var query in req.query) {
					queryLength+=1
				}
				for (let i = 0; i < users.length; i++) {
					let discord_user_id = stringNum(results[i].discord_user_id)
					let roblox_user_id = stringNum(results[i].roblox_user_id)
					results[i].discord_user_id = undefined
					results[i].roblox_user_id = undefined
					
					let Guild = Client.guilds.cache.find(g=>g.id==='1035775485482893422')
					let Member = Guild.members.cache.find(m=>m.id===discord_user_id)
					results[i].discord = {
						id: Member.user.id,
						tag: Member.user.tag,
						displayName: Member.displayName
					}
					results[i].roblox = getRobloxInfo(roblox_user_id)
				}
				if (queryLength>0) users.forEach(async (user) => {
					let cond = []
					for (var [query, value] of Object.entries(req.query)) {
						if (isDefault) {
							results = []
							isDefault = false
						}
						let c = eval(`user.${query}=='${value}'`)
						cond.push(c)
					}
					cond = cond.join("&&")
					eval(`if (${cond}) results.push(user);`)
				})
				res.status(200).json(results);
			});
			return;
		} else if (api==="fastUsers") {
			db.selectFromTable('users', (err, users) => {
				if (err) res.json(err);
				
				let results = users
				let isDefault = true
				let queryLength = 0
				for (var query in req.query) {
					queryLength+=1
				}
				for (let i = 0; i < users.length; i++) {
					results[i].discord_user_id = stringNum(results[i].discord_user_id)
					results[i].roblox_user_id = stringNum(results[i].roblox_user_id)
				}
				if (queryLength>0) users.forEach(async (user) => {
					let cond = []
					for (var query in req.query) {
						if (isDefault) {
							results = []
							isDefault = false
						}
						let c = eval(`user.${query}==req.query.${query}`)
						cond.push(c)
					}
					cond = cond.join("&&")
					eval(`if (${cond}) results.push(user);`)
				})
				res.status(200).json(results);
			});
			return;
		} else if (api==="authCodes") {
			res.json(API.authData)
			return
		}
		res.sendStatus(404)
	});
	app.post('/api/v1/:api', (req, res) => {
		res.set('Content-Type', 'application/json');
		
		let { api } = req.params
		let body = req.body
		if (api=="generateAuth") {
			API.generateAuth()
			res.status(201).json(API.authData)
			return
		} else if (api=="auth") {
			let status = 404
			let found = API.authData.find(f=>f.code===body.authCode);
			let rbxId = body.robloxUserId
			let response = {
				message: "Data not found!",
				data: null,
				isBuyer: false
			}
			if (found) {
				response = {
					message: "Successfully authenticated!",
					data: found,
					isBuyer: body.isBuyer || false
				}
				if (moment().unix() >= moment(found.expired).unix()) {
					response.message = "Authentication code was expired! Please try again!"
					response.data = null
					status = 410
				} else {
					if (!rbxId) {
						status=400
						res.status(status).json({error:{message:"(Bad Request) Not enough parameters!",responseCode:status}})
						return
					}
					API.authData.find(f=>f.code===body.authCode).rbxUserId = rbxId
					db.insertTable('users', [
						{
							column: "discord_user_id",
							value: numString(found.userId.toString())
						},
						{
							column: "roblox_user_id",
							value: numString(rbxId.toString())
						},
						{
							column: "is_buyer",
							value: body.isBuyer || false
						},
					])
					let resultData = {
						isBuyer: body.isBuyer || false
					}
					API.close(found.code, resultData)
					status = 202
				}
			}
			response.status = status
			res.status(status).json(response);
			return;
		}
		res.sendStatus(400)
	});
	
	app.listen();
	
	return app;
};