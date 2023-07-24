const fs = require('fs');
const path = require('path');
const Modules = path.join(__dirname, '/Modules/');
const Logger = require(Modules+'Logger.js');
const Client = require(Modules+'Client.js')();
const Log = new Logger();
require(Modules+'CommandHandler.js')(Client, Log);
require(Modules+'KeepOnline.js')();
const Web = require(Modules+'Website.js')(Client, Log);

// TESTING
// const axios = require('axios');
// const {parse} = require('node-html-parser');
// axios.get(`https://kar-core.hasannelz.repl.co/api/v1/users?discord_user_id=739812980279214100`)
// .then((res) => {
// 	console.log(res.data);
// })
// .catch((err) => {
// 	console.error(err);
// });
// 739812980279214100
// 739812980279214080

// DATABASE DELETING
const Database = require('./Modules/Database.js')();
const db = new Database('keretaapiroblox');

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

// db.runSql(`DELETE FROM users WHERE discord_user_id='${numString("1087668291771826246")}'`)