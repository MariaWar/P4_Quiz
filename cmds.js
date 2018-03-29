const Sequelize = require('sequelize');

const readline = require('readline');

//Añado funciones de color
const {log, errorlog, colorize} = require("./out");

//Añado funciones de model
const {models} = require('./model');

exports.helpCmd = (socket, rl) => {

    log(socket, "Comandos:");
    log(socket, " h/help - Muestra esta ayuda.");
    log(socket, " list - Listar los quizzes existentes.");
    log(socket, " show <id> - Muestra la pregunta y la respuesta del quiz indicado.");
    log(socket, " add - Añadir nuevo quiz interactivamente.");
    log(socket, " delete <id> - Borrar el quiz indicado");
    log(socket, " edit <id> - Editar el quiz indicado");
    log(socket, " test <id> - Probar el quiz indicado");
    log(socket, " p|play - Jugar a preguntar aleatoriamente todos los quizzes");
    log(socket, " credits - Créditos");
    log(socket, " q|quit - Salir del programa");
    rl.prompt();
};

exports.listCmd = (socket, rl) => {

    models.quiz.findAll() //promesa
    .each(quiz => { 
            log(socket, `[${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
        })
    .catch(error => {
        errorlog(socket, error.message);
    })
    .then(() => {
        rl.prompt();

    });
};

//como promesa
const validateId = (socket, id) => {
    return new Sequelize.Promise ((resolve, reject) => {
        if (typeof id == "undefined") { 
            reject(new Error(`Falta el parámetro <id>.`));
        }else{
            id = parseInt(id); //convertir id en número
            if (Number.isNaN(id)){
                reject(new Error(`El valor del parámetro <id> no es un número.`));
            }else{
                resolve(id); //se resuelve promesa
            }
        }
    });
        
};

//coge id y va a la base de datos para ver quiz asociado
exports.showCmd = (socket, rl, id) => {
    validateId(socket, id) //devuelve promesa
    .then(id => models.quiz.findById(id)) //busco quiz por id
    .then(quiz => {
        if (!quiz) {
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }
        log(socket, `[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);

    })
    .catch(error => {
        errorlog(socket, error.message);
    })
    .then(() => {
        rl.prompt();
    });
};


const makeQuestion = (socket, rl, text) => {
    return new Sequelize.Promise ((resolve, reject) => {
        rl.question(colorize(text, 'red'), answer => {
            resolve(answer.trim()); //trim para quitar espacios
        });
    });
};


exports.addCmd = (socket, rl) => {
    makeQuestion(socket, rl, 'Introduzca una pregunta: ') //hasta que no introduzca no finaliza
    .then(q => {
        return makeQuestion(socket, rl, 'Introduzca la respuesta ')
        .then(a => {
            return {question: q, answer: a}; 
        });
    })
    .then(quiz =>{
        return models.quiz.create(quiz);
    })
    .then((quiz) => {
        log(socket, ` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`)
    })
    .catch(Sequelize.ValidationError, error => {
        errorlog(socket, 'El quiz es erróneo:');
        error.errors.forEach(({message}) => errorlog(socket, message)); //error que ocurre (array de errores)
    })
    .catch(error => {
        errorlog(socket, error.message);       
    })
    .then(() =>{
        rl.prompt();
    });
};

//valida y borra con destroy
exports.deleteCmd = (socket, rl, id) => {
    validateId(socket, id)
    .then(id => models.quiz.destroy({where: {id}}))
    .catch(error => {
        errorlog(socket, error.message);
    })
    .then(() =>{
        rl.prompt();
    });
};


exports.editCmd = (socket, rl, id) => {
    validateId(socket, id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if(!quiz) { //si no encuentra quiz lanza error
            throw new Error (`No existe un quiz asociado al id=${id}.`);
        }
        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
        return makeQuestion(socket, rl, 'Introduzca la pregunta: ')
        .then(q =>{
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
            return makeQuestion(socket, rl, 'Introduzca la respuesta ')
            .then(a =>{
                quiz.question = q;
                quiz.answer = a;
                return quiz;  //devuelve quiz nuevo que interesa
            });

        });
    })
    .then(quiz => {
        return quiz.save(); //guardar en base de datos
    })
    .then(quiz =>{
        log(socket, ` Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
    })
    .catch(Sequelize.ValidationError, error => {
        errorlog(socket, 'El quiz es erróneo:');
        error.errors.forEach(({message}) => errorlog(socket, message));
    })
    .catch(error => {
        errorlog(socket, error.message);       
    })
    .then(() =>{
        rl.prompt();
    });
};

exports.testCmd = (socket, rl, id) => {
    
    validateId(socket, id) //devuelve promesa
    .then(id => models.quiz.findById(id)) //busco quiz por id
    .then(quiz => {
        if (!quiz) {
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }
        log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question}`)
        return makeQuestion(socket, rl, 'Introduzca la respuesta ')
        .then(a =>{
             if (a.trim().toLowerCase() === quiz.answer.trim().toLowerCase()){
                  
                    log(socket, 'Correcto', 'green');
        } else {
                    log(socket, 'Incorrecto', 'red');
                }
               
        })
    })    
    .catch(error =>{
            errorlog(socket, error.message);
            rl.prompt();
    })
    .then(() =>{
        rl.prompt();
    
    });
};




exports.playCmd = (socket, rl) => { 
    let score = 0; //variable puntos que almacene cuantas preguntas se acierten
    //Para no repetir preguntas
    let toBeResolved = [];
    models.quiz.findAll()
    .each((quiz, id )=> {
        toBeResolved[id] = quiz;

    })


    const random = (min, max) =>{
        return Math.random() * (max-min) + min;
    };
    //almacena las que me queden por contestar
    //for que meta todos los id existentes

    const playOne = () =>{
        
        return new Sequelize.Promise((resolve, reject) =>{
                if(toBeResolved.length === 0){

                    log(socket, 'Has terminado!', 'grey');
                    log(socket,  `Has conseguido: ${colorize(score,'blue')} puntOTs`); 
                    log(socket, "FIN",'magenta');
                    resolve();
                }
                //return;
                else {
                //cogemos pregunta al azar
                    let id = Math.floor(random(0, toBeResolved.length));
                    let quiz = toBeResolved[id];
                    log(socket, quiz.question, 'green');
                    makeQuestion(socket, rl, [log(socket, "Introduzca la respuesta:", 'magenta')])
                         .then (a =>{
                            if (a.trim().toLowerCase() === quiz.answer.trim().toLowerCase()){
                                toBeResolved.splice(id, 1);

                                //.then(id => toBeResolved.splice({where: {id}}))
                                log(socket, 'Respuesta correcta', 'green');
                                score = score + 1;
                                log(socket, score, 'green');
                                resolve(playOne());
                            } else {
                                log(socket, 'Respuesta incorrecta', 'red');
                                log(socket, score,'red');
                                log(socket, "FIN",'magenta');
                                resolve();
                            }
                   
                         });
                }
        });
    };
            
    models.quiz.findAll()
    .then(() =>{
        return playOne();
    })

    .catch(error => {
        errorlog(socket, error.message);
    })
        
    .then(() => {
        rl.prompt();

    });

    

};


              /*

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
};*/

exports.creditsCmd = (socket, rl) => {

    log(socket, 'Autores del prácticOT:');
    log(socket, 'PaulaWar', 'magenta');
    log(socket, 'MariaWar', 'magenta');
    rl.prompt();
};

exports.quitCmd= (socket, rl) => {
    
    rl.close();
    rl.prompt();
};
