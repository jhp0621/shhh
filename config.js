const ZoomEventType = {
  MEETING: {
    PARTICIPANT_JOINED: "meeting.participant_joined",
    PARTICIPANT_LEFT: "meeting.participant_left",
  },
  USER: {
    PRESENCE_STATUS_UPDATED: "user.presence_status_updated",
  },
};

const ZoomUserPresenceStatus = {
  AVAILABLE: "Available",
  AWAY: "Away",
  DO_NOT_DISTURB: "Do_Not_Disturb",
  IN_MEETING: "In_Meeting",
  PRESENTING: "Presenting",
  IN_CALENDAR_EVENT: "In_Calendar_Event",
  ON_PHONE_CALL: "On_Phone_Call",
  OFFLINE: "Offline",
};

const userPresenceUpdatedExample = {
  event: "user.presence_status_updated",
  event_ts: 1668633833110,
  payload: {
    account_id: "bJX4J5aWQxuPho8pYPqc5Q",
    object: {
      date_time: "2022-11-16T21:23:53Z",
      email: "ji@launchpadlab.com",
      id: "6_6i90scqy2rdcud_m17pa",
      presence_status: "In_Meeting",
    },
  },
};

const meetingParticipantJoinedExample = {
  event: "meeting.participant_joined",
  event_ts: 1668633538589,
  payload: {
    account_id: "bJX4J5aWQxuPho8pYPqc5Q",
    object: {
      uuid: "RxXsefvASOujYR4yX9RmYw==",
      participant: {
        user_id: "16778240",
        user_name: "Ji Park",
        participant_user_id: "6_6I90sCQY2RdcuD_m17PA",
        id: "6_6I90sCQY2RdcuD_m17PA",
        join_time: "2022-11-16T21:19:56Z",
        email: "ji@launchpadlab.com",
      },
      id: "86191416733",
      type: 1,
      topic: "Ji Park's Zoom Meeting",
      host_id: "6_6I90sCQY2RdcuD_m17PA",
      duration: 808591414,
      start_time: "2022-11-16T21:18:55Z",
      timezone: "",
    },
  },
};

const meetingParticipantLeftExample = {
  event: "meeting.participant_left",
  event_ts: 1668633729526,
  payload: {
    account_id: "bJX4J5aWQxuPho8pYPqc5Q",
    object: {
      uuid: "/fn5XvEnQAiSCcJa36Dhfw==",
      participant: {
        leave_time: "2022-11-16T21:22:06Z",
        user_id: "16879616",
        user_name: "Ji Park",
        registrant_id: "",
        participant_user_id: "6_6I90sCQY2RdcuD_m17PA",
        id: "6_6I90sCQY2RdcuD_m17PA",
        leave_reason: "left the meeting. Reason : left the meeting",
        email: "ji@launchpadlab.com",
      },
      id: "83465221546",
      type: 2,
      topic: "Zoom Meeting",
      host_id: "PHC6HC-FSYexKI10QEfdfg",
      duration: 60,
      start_time: "2022-11-16T18:02:21Z",
      timezone: "America/Chicago",
    },
  },
};

module.exports = { ZoomEventType, ZoomUserPresenceStatus };
