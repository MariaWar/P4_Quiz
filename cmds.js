const Sequelize = require('sequelize');

const readline = require('readline');

//Añado funciones de color
const {log, errorlog, colorize} = require("./out");

//Añado funciones de model
const {models} = require('./model');

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

    models.quiz.findAll() //promesa
    .each(quiz => { 
            log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
        })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();

    });
};

//como promesa
const validateId = id => {
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
exports.showCmd = (rl, id) => {
    validateId(id) //devuelve promesa
    .then(id => models.quiz.findById(id)) //busco quiz por id
    .then(quiz => {
        if (!quiz) {
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }
        log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);

    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};


const makeQuestion = (rl, text) => {
    return new Sequelize.Promise ((resolve, reject) => {
        rl.question(colorize(text, 'red'), answer => {
            resolve(answer.trim()); //trim para quitar espacios
        });
    });
};


exports.addCmd = rl => {
    makeQuestion(rl, 'Introduzca una pregunta: ') //hasta que no introduzca no finaliza
    .then(q => {
        return makeQuestion(rl, 'Introduzca la respuesta ')
        .then(a => {
            return {question: q, answer: a}; 
        });
    })
    .then(quiz =>{
        return models.quiz.create(quiz);
    })
    .then((quiz) => {
        log(` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`)
    })
    .catch(Sequelize.ValidationError, error => {
        errorlog('El quiz es erróneo:');
        error.errors.forEach(({message}) => errorlog(message)); //error que ocurre (array de errores)
    })
    .catch(error => {
        errorlog(error.message);       
    })
    .then(() =>{
        rl.prompt();
    });
};

//valida y borra con destroy
exports.deleteCmd = (rl, id) => {
    validateId(id)
    .then(id => models.quiz.destroy({where: {id}}))
    .catch(error => {
        errorlog(error.message);
    })
    .then(() =>{
        rl.prompt();
    });
};


exports.editCmd = (rl, id) => {
    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if(!quiz) { //si no encuentra quiz lanza error
            throw new Error (`No existe un quiz asociado al id=${id}.`);
        }
        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
        return makeQuestion(rl, 'Introduzca la pregunta: ')
        .then(q =>{
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
            return makeQuestion(rl, 'Introduzca la respuesta ')
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
        log(` Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
    })
    .catch(Sequelize.ValidationError, error => {
        errorlog('El quiz es erróneo:');
        error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
        errorlog(error.message);       
    })
    .then(() =>{
        rl.prompt();
    });
};

exports.testCmd = (rl, id) => {
    
    validateId(id) //devuelve promesa
    .then(id => models.quiz.findById(id)) //busco quiz por id
    .then(quiz => {
        if (!quiz) {
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }
        log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question}`)
        return makeQuestion(rl, 'Introduzca la respuesta ')
        .then(a =>{
             if (a.trim().toLowerCase() === quiz.answer.trim().toLowerCase()){
                  
                    log('Correcto', 'green');
        } else {
                    log('Incorrecto', 'red');
                }
               
        })
    })    
    .catch(error =>{
            errorlog(error.message);
            rl.prompt();
    })
    .then(() =>{
        rl.prompt();
    
    });
};




exports.playCmd = rl => { 
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

                    log('Has terminado!', 'grey');
                    log( `Has conseguido: ${colorize(score,'blue')} puntOTs`); 
                    resolve();
                }
                //return;
                 else {
                //cogemos pregunta al azar
                    let id = Math.floor(random(0, toBeResolved.length));
                    let quiz = toBeResolved[id];
                    log(quiz.question, 'green');
                    makeQuestion(rl, [log("Introduzca la respuesta:", 'magenta')])
                         .then (a =>{
                            if (a.trim().toLowerCase() === quiz.answer.trim().toLowerCase()){
                                toBeResolved.splice(id, 1);

                                //.then(id => toBeResolved.splice({where: {id}}))
                                log('Respuesta correcta', 'green');
                                score = score + 1;
                                log(score, 'green');
                                resolve(playOne());
                            } else {
                                log('Respuesta incorrecta', 'red');
                                log(score,'red');
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
        errorlog(error.message);
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
