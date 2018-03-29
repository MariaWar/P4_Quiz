const readline = require('readline');

//Añado funciones de model
const model = require("./model");

//Añado las funciones de color
const {log, errorlog, colorize} = require("./out");

//Añado funciones de cmds
const cmds = require("./cmds");

const net = require("net");


//Crea el socket servidor
net.createServer(socket => {
	
	console.log("Se ha conectado un cliente desde" + socket.remoteAddress);
	//Mensaje inicial
	log(socket, 'CORE Quiz', 'green');


	const rl = readline.createInterface({
	    input: socket,
	    output: socket,
	    prompt: colorize("quiz > ","green"), 
	    completer: (line) => {
		  const completions = 'help h list show add delete edit test p play credits quit q'.split(' ');
		  const hits = completions.filter((c) => c.startsWith(line));
		  // show all completions if none found
		  return [hits.length ? hits : completions, line];
	    }
	});
	
	socket
	.on("end", () => {
		rl.close();
	})
	.on("error", () => {
		rl.close();
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
		    cmds.helpCmd(socket, rl);
		    break;
	
		case 'list':
		    cmds.listCmd(socket, rl);
		    break;
	
		case 'show':
		     cmds.showCmd(socket, rl, args[1]);
		     break;
	
		case 'add':
		     cmds.addCmd(socket, rl);
		     break;
	
		case 'delete':
		     cmds.deleteCmd(socket, rl, args[1]);
		     break;
	
		case 'edit':
		     cmds.editCmd(socket, rl, args[1]);
		     break;
	
		case 'test':
		     cmds.testCmd(socket, rl, args[1]);
		     break;
	
		case 'p':
		case 'play':
		     cmds.playCmd(socket, rl);
		     break;         
	
		case 'credits':
		   cmds.creditsCmd(socket, rl);
		   break;
	
		case 'quit':
		case 'q':
		    cmds.quitCmd(socket, rl);
		    break;
	
		default:
		    log(socket, `Comando desconocido: '${colorize(cmd, 'red')}'`);
		    log(socket, `Use ${colorize('help', 'blue')} para ver todos los comandos disponibles.`);
	        rl.prompt();
		    break;
		}
	
	
	
	}).on('close', () => {
	
	    log(socket, 'Hasta luegOT!');
	   // process.exit(0);
	});
	
	})
.listen(3030);













