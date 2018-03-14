const readline = require('readline');

//Añado funciones de model
const model = require('./model');

//Añado las funciones de color
const {log, errorlog, colorize} = require("./out");

//Añado funciones de cmds
const cmds = require('./cmds');

//Mensaje inicial
log('CORE Quiz', 'green');


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colorize("quiz > ","green"), 
    completer: (line) => {
	  const completions = 'help h list show add delete edit test p play credits quit q'.split(' ');
	  const hits = completions.filter((c) => c.startsWith(line));
	  // show all completions if none found
	  return [hits.length ? hits : completions, line];
    }
});

rl.prompt();

rl.on('line', (line) => {
	let args = line.split(" ");
	let cmd = args[0].toLowerCase().trim();

    switch (cmd) {

	case '':
        rl.prompt();
	    break;

	case 'help':
	case 'h':
	    cmds.helpCmd(rl);
	    break;

	case 'list':
	    cmds.listCmd(rl);
	    break;

	case 'show':
	     cmds.showCmd(rl, args[1]);
	     break;

	case 'add':
	     cmds.addCmd(rl);
	     break;

	case 'delete':
	     cmds.deleteCmd(rl, args[1]);
	     break;

	case 'edit':
	     cmds.editCmd(rl, args[1]);
	     break;

	case 'test':
	     cmds.testCmd(rl, args[1]);
	     break;

	case 'p':
	case 'play':
	     cmds.playCmd(rl);
	     break;         

	case 'credits':
	   cmds.creditsCmd(rl);
	   break;

	case 'quit':
	case 'q':
	    cmds.quitCmd(rl);
	    break;

	default:
	    console.log(`Comando desconocido: '${colorize(cmd, 'red')}'`);
	    console.log(`Use ${colorize('help', 'blue')} para ver todos los comandos disponibles.`);
        rl.prompt();
	    break;
	}



}).on('close', () => {

    console.log('Hasta luegOT!');
    process.exit(0);
});













