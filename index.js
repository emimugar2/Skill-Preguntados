/* eslint-disable  func-names */
/* eslint-disable  no-console */

/* Skill "Preguntados" para Alexa Amazon.
 * Creada por Emilio Martínez.
*/


const Alexa = require('ask-sdk');
const preguntas = require('./preguntas');

const skillBuilder = Alexa.SkillBuilders.standard();
const PREGUNTAS = preguntas.PREGUNTAS_ES_ES;
const SKILL_NAME = 'Juego Pregunta2';
const WELCOME_MESSAGE = '¡Bienvenido al ' + SKILL_NAME + '! Voy hacerte preguntas de cultura general. Contesta a las preguntas diciendo A, B, C o D... <break time="1s" /> ¡Que comience el juego!';
const WELCOME_REPROMPT = 'Contesta a las preguntas diciendo A, B, C... Para recibir ayuda, por favor di ayuda. Para salir, di salir.';
const DISPLAY_CARD_TITLE = SKILL_NAME;
const HELP_MESSAGE = 'Voy hacerte preguntas de cultura general. Contesta a la última pregunta diciendo A,B o C. También puedes salir. ¿Qué respondes?';
const HELP_REPROMPT = HELP_MESSAGE;
const STOP_MESSAGE = '<say-as interpret-as="interjection">Hasta luego, que tengas buen día</say-as>';
const NO_ENTIENDO_REPITE_POR_FAVOR = '<say-as interpret-as="interjection">¿Que has dicho?</say-as>. <break time="0.5s"/> Lo siento, no te he entendido. Repite por favor.';



const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {        

    const item = obtenerPreguntaAleatoriaYGuardarlaEnSesion(handlerInput);
    
    let ret = "Pregunta: " + preguntaToString(item);

    return handlerInput.responseBuilder
      .speak(WELCOME_MESSAGE + " " + ret)
      .reprompt(WELCOME_REPROMPT + " " + ret)
      .getResponse();
  },
};


const RespuestaHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RespuestaIntent';
  },
  handle(handlerInput) {    
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const itemSlot = handlerInput.requestEnvelope.request.intent.slots.respuesta;
    
    let itemNameMatched = "nada";
        
    if (itemSlot && itemSlot.resolutions && 
      itemSlot.resolutions.resolutionsPerAuthority) {

        itemNameMatched = itemSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    }
    else{
    }


    if (itemSlot && itemSlot.value) {
      

      let index = itemNameMatched.charCodeAt() - 'A'.charCodeAt()
      
      if(sessionAttributes.lastPregunta.respuestas.length < (index+1)){
        return handlerInput.responseBuilder
          .speak("Respuesta incorrecta. <break time='0.5s' />La respuesta " + itemNameMatched + " no existe en esta pregunta. Vuelve a intentarlo. " + preguntaToString(sessionAttributes.lastPregunta))
          .withSimpleCard(DISPLAY_CARD_TITLE)
          .reprompt(HELP_REPROMPT)
          .getResponse();
      }
      else if(sessionAttributes.lastPregunta.respuestas[index].correcta == true){
        
        var item = obtenerPreguntaAleatoriaYGuardarlaEnSesion(handlerInput);
        
        return handlerInput.responseBuilder
          .speak("¡Respuesta Correcta! Siguiente pregunta: " + preguntaToString(item))
          .withSimpleCard(DISPLAY_CARD_TITLE)
          .reprompt(HELP_REPROMPT)
          .getResponse();
      }
      else{
        return handlerInput.responseBuilder
          .speak("Respuesta incorrecta. <break time='0.5s' /> No es la " + itemNameMatched + ". Vuelve a intentarlo. " + preguntaToString(sessionAttributes.lastPregunta))
          .withSimpleCard(DISPLAY_CARD_TITLE)
          .reprompt(HELP_REPROMPT)
          .getResponse();
      }      
    }
  }
};


const NextHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NextIntent';
  },
  handle(handlerInput) {    
    var item = obtenerPreguntaAleatoriaYGuardarlaEnSesion(handlerInput);
        
    return handlerInput.responseBuilder
      .speak("Siguiente pregunta: " + preguntaToString(item))
      .withSimpleCard(DISPLAY_CARD_TITLE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};


const RepeatHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
  },
  handle(handlerInput) {    
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
    return handlerInput.responseBuilder
      .speak("Repito la pregunta: " + preguntaToString(sessionAttributes.lastPregunta))
      .withSimpleCard(DISPLAY_CARD_TITLE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};


const HelpHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {    
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};


const ExitHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {    
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};


const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    console.log("Inside SessionEndedRequestHandler");
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    return handlerInput.responseBuilder.getResponse();
  },
};


const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);  
    
    return handlerInput.responseBuilder
      .speak(NO_ENTIENDO_REPITE_POR_FAVOR)
      .reprompt(NO_ENTIENDO_REPITE_POR_FAVOR)
      .getResponse();
  },
};


function preguntaToString(pregunta){
    let ret = pregunta.texto + " ";
    for(var i=0; i<pregunta.respuestas.length; i++){
      ret += String.fromCharCode('A'.charCodeAt() + i) + ": " + pregunta.respuestas[i].respuesta + " ";
    }
    
    ret += "¿Qué letra eliges?";
    
    return ret;
  }


function getRandomItem(arrayOfItems) {
  let i = 0;
  i = Math.floor(Math.random() * arrayOfItems.length);
  return (arrayOfItems[i]);
};


function obtenerPreguntaAleatoriaYGuardarlaEnSesion(handlerInput){

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    var item = getRandomItem(PREGUNTAS); 
    sessionAttributes.lastPregunta = item;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    
    return item;
}


exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    RespuestaHandler,
    NextHandler,
    RepeatHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();