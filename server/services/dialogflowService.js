import dialogflow from "dialogflow";
import env from "../config/env.js";

const sessionClient = new dialogflow.SessionsClient({
  credentials: {
    client_email: env.dialogflow.clientEmail,
    private_key: env.dialogflow.privateKey,
  },
});

const detectIntent = async ({ sessionId, text, languageCode = "en" }) => {
  const sessionPath = sessionClient.sessionPath(env.dialogflow.projectId, sessionId);
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text,
        languageCode,
      },
    },
  };

  const [response] = await sessionClient.detectIntent(request);
  return response?.queryResult;
};

export { detectIntent };
