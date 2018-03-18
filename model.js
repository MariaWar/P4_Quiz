const Sequelize = require ('sequelize');
const sequelize = new Sequelize("sqlite:quizzes.sqlite", {logging: false});
sequelize.define('quiz', {
	question: {
		type: Sequelize.STRING,
		unique: {msg:"Ya existe esta pregunta"},
		validate:{notEmpty:{msg:"La pregunta no puede estar vacía"}}
	},
	answer: {
		type: Sequelize.STRING,
		validate:{notEmpty:{msg:"La respuesta no puede estar vacía"}}

	}
});

sequelize.sync()
.then(() => sequelize.models.quiz.count())
.then(count => {
	if (!count){
		return sequelize.models.quiz.bulkCreate([
			{
    		question: "¿Quién ha sido la ganadora de OT 2017?",
    		answer: "Amaia"
 			},
    		{
    		question: "¿Quién es la Bikina?",
    		answer: "Ana War"
   			},
    		{
    		question: "¿Dónde está la sede de OT?",
    		answer: "Barcelona"
    		},
   			{
    		question: "¿En qué canal emitían OT?",
    		answer: "TVE"
    		},
    		{
    		question: "¿Quiénes cantan Lo Malo?",
    		answer: "Aitana y Ana War"
    		}

			]);
	}
})
.catch(error => {
	console.log(error);
});
module.exports = sequelize;





















/*const readline = require('readline');

const fs = require("fs");

//Fichero donde se guardan las preguntas
const DB_FILENAME = "quizzes.json";


//Todos los quizzes existentes
let quizzes = [
    {
    	question: "¿Quién ha sido la ganadora de OT 2017?",
    	answer: "Amaia"
    },
    {
    	question: "¿Quién es la Bikina?",
    	answer: "Ana War"
    },
    {
    	question: "¿Dónde está la sede de OT?",
    	answer: "Barcelona"
    },
   {
    	question: "¿En qué canal emitían OT?",
    	answer: "TVE"
    },
    {
    	question: "¿Quiénes cantan Lo Malo?",
    	answer: "Aitana y Ana War"
    }
    
];

//Carga el fichero DB_FILENAME
const load = () => {
	fs.readFile(DB_FILENAME, (err, data) => {
		if(err){

			//La primera vez no existe el fichero
			if(err.code === "ENOENT"){
				save();
				return;
			}
			throw err;
		}
		let json = JSON.parse(data);
		if (json){
			quizzes = json;
		}
	});
};

//Guarda las preguntas en el fichero
const save = () => {
	fs.writeFile(DB_FILENAME, JSON.stringify(quizzes), 

		err => {
			if (err) throw err;
		});
};

//

//Número total de preguntas
exports.count = () => quizzes.length;

//Añadir nuevo quiz
exports.add = (question, answer) => {
	quizzes.push({
		question: (question || "").trim(),
		answer:(answer || "").trim()
	});
	save();
};

//Actualiza el quiz situado en esa posición
exports.update = (id, question, answer) => {
	const quiz = quizzes[id];
	if (typeof quiz === "undefined"){
		throw new Error(`El valor del parámetro id no es válido.`); 
	}
	quizzes.splice(id, 1, {
		question: (question || "").trim(),
		answer: (answer || "").trim()
	});
	save();
};

//Devuelve quizzes existentes
exports.getAll = () => JSON.parse(JSON.stringify(quizzes));

//Devuelve un clon del quiz almacenado en esa posición
exports.getByIndex = id => {
	const quiz = quizzes[id];
	if (typeof quiz === "undefined"){
		throw new Error(`El valor del parámetro id no es válido.`); 
	}
	return JSON.parse(JSON.stringify(quiz));
};

//Borrar elemento del array
exports.deleteByIndex = id => {
	const quiz = quizzes[id];
	if (typeof quiz === "undefined"){
		throw new Error(`El valor del parámetro id no es válido.`); 
	}
	quizzes.splice(id, 1);
	save();
};

//Carga los OT quizzes almacenados en el fichero
load();*/
