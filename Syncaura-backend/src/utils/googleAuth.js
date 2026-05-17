import { google } from "googleapis";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_PATH = path.join(__dirname, "../../token.json");


export const getCalendarClient = (tokens) => {
  const oauth2Client = new google.auth.OAuth2(

    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );


  oauth2Client.setCredentials(tokens);

  return google.calendar({
    version: "v3",
    auth: oauth2Client,
  });
};