const moment = require('moment');
const fs = require('fs');

"use strict";
class Logger {
	#logFolder = './Logs/';
	#fileName = 'DD-MM-YYYY HH.mm.ss';
	#fileExt = '.log';
	#logFormat = '\\[DD/MM/YYYY - HH.mm.ss \| [{cond}\]\]:';
	#created = moment();
	#file;

	createFile() {
		this.#file = this.#created.format(this.#fileName) + this.#fileExt;
		if (!fs.existsSync(this.#logFolder)) {
			fs.mkdir(this.#logFolder, function(err){
				if (err) throw err;
			});
		}
		fs.writeFile(this.#logFolder + this.#file, '##### AUTO GENERATED - CREATED AT '+this.#created.format("DD/MM/YYYY - HH:mm:ss")+" #####\n", {overwrite:false},function(err){
			if (err) throw err;
		});
	}
	/*
 Set the file name (momentjs support).
 @params {string} fileName
 */
	setFilename(fileName) {
		this.#fileName = fileName
		return this;
	}
	log(...string) {
		this.createFile();
		let module=this
		fs.readFile(this.#logFolder + this.#file,function(err,e){
			let writeStream = fs.createWriteStream(module.#logFolder + module.#file);
			writeStream.write(e+moment().format(module.#logFormat).replace('{cond}', 'LOG')+" "+string.join(' ')+'\n')
			console.log(moment().format(module.#logFormat).replace('{cond}', 'LOG'), ...string);
			writeStream.end();
		})
	}
	warn(...string) {
		this.createFile();
		let e = fs.readFileSync(this.#logFolder + this.#file)
		fs.writeFileSync(this.#logFolder + this.#file, e+moment().format(this.#logFormat).replace('{cond}', 'WARN')+" "+string.join(' ')+'\n')
		console.warn(moment().format(this.#logFormat).replace('{cond}', 'WARN'), ...string);
	}
	error(...string) {
		this.createFile();
		let e = fs.readFileSync(this.#logFolder + this.#file)
		fs.writeFileSync(this.#logFolder + this.#file, e+moment().format(this.#logFormat).replace('{cond}', 'ERROR')+" "+string.join(' ')+'\n')
		console.warn(moment().format(this.#logFormat).replace('{cond}', 'ERROR'), ...string);
	}
}

module.exports = Logger;