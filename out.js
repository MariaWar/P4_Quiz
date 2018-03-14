const figlet = require ('figlet');
const chalk = require ('chalk');

colorize = (msg, color) => {

	if (typeof color !== "undefined"){
		msg = chalk[color].bold(msg);
	}
	return msg;
};

log = (msg, color) => {
	console.log(colorize(msg, color));
};

/*biglog = (msg, color) => {
	log(figlet.textSync(msg, { horizontalLayout: 'full' }), color);
};*/

errorlog = (emensajOT) => {
	console.log(`${colorize("Error", "red")}: ${colorize(colorize(emsg, "red"), "bgYellowBright")}`);
};

exports = module.exports = {
	colorize,
	log,
	
	errorlog
};
