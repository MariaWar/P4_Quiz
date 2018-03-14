const readline = require('readline');

//Añado funciones de color
const {log, errorlog, colorize} = require("./out");

//Añado funciones de model
const model = require('./model');

exports.helpCmd = rl => {

    console.log("Comandos:");
    console.log(" h/help - Muestra esta ayuda.");
    console.log(" list - Listar los quizzes existentes.");
    console.log(" show <id> - Muestra la pregunta y la respuesta del quiz indicado.");
    console.log(" add - Añadir nuevo quiz interactivamente.");
    console.log(" delete <id> - Borrar el quiz indicado");
    console.log(" edit <id> - Editar el quiz indicado");
    console.log(" test <id> - Probar el quiz indicado");
    console.log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes");
    console.log(" credits - Créditos");
    console.log(" q|quit - Salir del programa");
    rl.prompt();
};

exports.listCmd = rl => {
    model.getAll().forEach((quiz, id) => {
        log(` [${colorize(id, 'yellow')}]: ${quiz.question}`);
    });
    rl.prompt();
};

exports.showCmd = (rl, id) => {
	if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else{
        try{
            const quiz = model.getByIndex(id);
            log( `[${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        } catch(error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};

exports.addCmd = rl => {
    rl.question(colorize(' Introduzca una pregunta: ', 'yellow'), question => {
        rl.question(colorize(' Introduzca la respuesta: ', 'yellow'), answer => {
            model.add(question, answer),
            log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`)
            rl.prompt();
        });

    });
	
};

exports.deleteCmd = (rl, id) => {
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else{
        try{
            model.deleteByIndex(id);
        } catch(error){
            errorlog(error.message);
        }
    }

	rl.prompt();
};

exports.editCmd = (rl, id) => {
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
            rl.question(colorize(' Introduzca una pregunta: ', 'yellow'), question => {
                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
                rl.question(colorize(' Introduzca la respuesta ', 'yellow'), answer => {
                    model.update(id, question, answer),
                    log(` Se ha campiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')}`)
                    rl.prompt();
                });

             });
        } catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }

};

exports.testCmd = (rl, id) => { //poner que de igual mayúsculas/minúsculas y espacios
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);

            rl.question(quiz.question, answer => {

                if (answer.trim().toLowerCase() === quiz.answer.trim().toLowerCase()){
                    biglog('Correcto', 'green');
                } else {
                    biglog('Incorrecto', 'red');
                }
                rl.prompt();
            });
        } catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};

exports.playCmd = rl => {
    let score = 0; //variable puntos que almacene cuantas preguntas se acierten
    //Para no repetir preguntas
    let toBeResolved = [];
    toBeResolved = model.getAll();

    const random = (min, max) =>{
        return Math.random() * (max-min) + min;
    };
    //almacena las que me queden por contestar
    //for que meta todos los id existentes

    const playOne = () =>{
          
            if (toBeResolved.length == 0){
                log('Has terminado!', 'grey');
                log('Has conseguido:');log(score,"blue"); log ('puntOTs');
                rl.prompt();
                return;
            } else {
                //cogemos pregunta al azar
                let id = Math.floor(random(0, toBeResolved.length));
                
                //model.deleteByIndex(idx);
                let quiz = toBeResolved[id];
              
                rl.question(quiz.question, answer => {
                    if( answer.trim().toLowerCase() == quiz.answer.trim().toLowerCase() ){
                        toBeResolved.splice(id, 1);
                        console.log(toBeResolved.length);
                        log('Respuesta correcta', 'green');
                        score = score + 1;
                        log(score ,'green');


                        playOne();
                    }else{
                        toBeResolved.splice(0, toBeResolved.length);
                        log('Respuesta incorrecta', 'red');
                        log(score,'red');
                        rl.prompt();
                        return;
                    }
                });
            }
    
    

    }
    playOne();
};

exports.creditsCmd = rl => {

    log('Autores del prácticOT:');
    log('PaulaWar', 'magenta');
    log('MariaWar', 'magenta');
    rl.prompt();
};

exports.quitCmd= rl => {
    
    rl.close();
    rl.prompt();
};
