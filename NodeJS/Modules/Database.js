const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3').verbose();

"use strict";
class Database {
	#dbName = null;
	#dbPath = null
	#db = null;
	clearOnRun = false;
	constructor(dbName, clearOnRun) {
		this.#dbName = dbName;
		this.#dbPath = path.join(__dirname,`../Databases/${dbName}.sqlite`);
		this.clearOnRun = clearOnRun || false
		if (!fs.existsSync(this.#dbPath) || this.clearOnRun==true) fs.writeFileSync(this.#dbPath, '');
		this.#db = new sqlite3.Database(this.#dbPath);
	}
	getDb() {
		return this.#db
	}
	runSql(sql) {
		this.#db.run(sql);
	}
	createTable(tableName, values) {
		let query = []
		let index = {
			PRIMARY: null,
			UNIQUE: null,
			INDEX: null,
			FULLTEXT: null,
			SPATIAL: null,
		}
		let default_data = {
			name: "",
			type: "INT",
			length: 0,
			default: null,
			null: false,
			auto_increment: false,
		}
		values.forEach((data, i) => {
			let q = ""
			for (var [d,find] of Object.entries(default_data)) {
				if (find==null)
					eval(`data.${d}=default_data.${d}`)
			}

			if (data.name) q+=`\`${data.name}\` `
			if (data.type) q+=data.type
			q += data.length ? `(${data.length}) ` : ' '
			if (!data.null) q+="NOT "
			q+="NULL "
			if (data.default) {
				q+='DEFAULT '
				if (data.default==='NULL') data.null = true
				else if(data.default==='CURRENT_TIMESTAMP') q+=data.default
				else q+=`\`${data.default}\``
			}
			if (data.auto_increment) index.PRIMARY=data.name
			query.push(q)
		});
		for (var [k,find] of Object.entries(index)) {
			let type = {
				PRIMARY: "PRIMARY KEY",
				UNIQUE: "UNIQUE",
				INDEX: "INDEX",
				FULLTEXT: "FULLTEXT",
				SPATIAL: "SPATIAL",
			}
			let e = eval("type."+k)
			if (find!==null)
				query.push(`${e} (\`${find}\`)`)
		}
		this.#db.run(`CREATE TABLE ${tableName} (${query.join(" , ")})`)
	}
	insertTable(tableName, values) {
		let columns = []
		let _values1 = []
		let _values2 = []
		let default_data = {
			column: "",
			value: null
		}
		values.forEach((data, index) => {
			for (var d in default_data) {
				let find = eval("data."+d)
				if (find==null)
					eval(`data.${d}=default_data.${d}`)
			}
			columns.push(`\`${data.column}\``)
			
			if (data.value==null) data.value="NULL"
			// else if (data.value==true) data.value="1"
			// else if (data.value==false) data.value="0"
			_values1.push("?")
			_values2.push(data.value)
		});
		this.#db.run(`INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${_values1.join(",")})`, _values2)
	}
	selectFromTable(tableName, callback) {
		this.#db.all(`SELECT * FROM ${tableName}`, function(err,rows){
			if (err) return callback(err);
			return callback(null, rows);
		});
	}
}

module.exports = () => {
	return Database
}