import { google } from "googleapis";
import { getCalendarClient } from "../utils/googleAuth.js";

export const createCalendarEvent = async ({
  title,
  description,
  startTime,
  endTime,
}) => {
  const auth = getCalendarClient();

  const calendar = google.calendar({
    version: "v3",
    auth,
  });

  const event = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: title,
      description,
      start: { dateTime: startTime },
      end: { dateTime: endTime },
      conferenceData: {
        createRequest: {
          requestId: Date.now().toString(),
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    },
  });

  return event.data;
};