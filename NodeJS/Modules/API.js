Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

const moment = require('moment');
let authData = [];

function randomizeNumber(length) {
	let char = "1234567890".split("")
	let str = ""
	for (i=0;i<length;i++) {
		str+=char[Math.floor(Math.random() * char.length)]
	}
	return str;
}

function generateAuth(userId, callback) {
	if (userId==null) return null;
	let data = {
		userId: userId,
		code: null,
		expired: moment().format(),
		_callback: callback
	}
	data.code = randomizeNumber(6)
	data.expired = moment().add(15, 'minutes').format()
	authData.push(data);
	return data;
}

function close(code, resultData) {
	let data = authData.find(f=>f.code===code);
	let callbackData = Object.assign(data, resultData)
	data._callback(callbackData)
	authData = authData.remove(data);
}

module.exports = () => {
	return {generateAuth,close,authData}
};