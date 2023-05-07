const Alexa = require('ask-sdk-core');
const axios = require('axios');

const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-3.5-turbo';
const KEY = 'GET YOUR KEY FROM https://platform.openai.com/account/api-keys';

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'Hello Sir, Jarvis mode activated. How may I help you?';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const ChatGPTIntentHandler = {
  canHandle(handlerInput) {
    return true;
  },
  async handle(handlerInput) {
    const question = Alexa.getSlotValue(handlerInput.requestEnvelope, 'question');

    try {
      const response = await axios.post(API_URL, {
        model: MODEL,
        messages: [{ "role": "user", "content": question }],
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KEY}`,
        },
      });
      const responseData = response.data;
      const speakOutput = responseData.choices[0].message.content;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse();
    } catch (error) {
      console.error(error);
      const speakOutput = 'I am sorry sir, there appears to be a problem with the connection.';
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse();
    }
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'Hello sir, how may I be of service?';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Very well sir, goodbye.';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`~~~~ Error handled: ${error.stack}`);
    const speakOutput = `I am sorry sir, a critical error has occurred and I must shut down.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    ChatGPTIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(
    ErrorHandler,
  )
  .lambda();
