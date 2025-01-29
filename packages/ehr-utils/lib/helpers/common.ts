

export const getAddressString = (data: any) => {
    // Navigate to the `extension` array in the data
    const extensions = data.extension || [];
  
    // Find the extension with the `url` for virtual service
    const virtualServiceExtension = extensions.find(
        (ext: any) =>
            ext.url ===
            "https://extensions.fhir.zapehr.com/encounter-virtual-service-pre-release"
    );
  
    if (virtualServiceExtension) {
        // Find the channelType and ensure it matches "twilio-conversations"
        const channelType = virtualServiceExtension.extension?.find(
            (subExt: any) =>
                subExt.url === "channelType" &&
                subExt.valueCoding?.code === "twilio-conversations"
        );
  
        if (channelType) {
            // Extract the addressString
            const addressStringExtension = virtualServiceExtension.extension.find(
                (subExt: any) => subExt.url === "addressString"
            );
  
            return addressStringExtension?.valueString || null;
        }
    }
  
    return null; // Return null if not found
  };
  export interface ConversationLinkResponse {
    Attendee: object,
    Meeting: {
      token: string,
      tokenized: string,
      endpoint: string,
      generatedLink: string
    }
  }

  export const getConversationLink = async (
    token: string | undefined,
    conversationID: string,
    appointmentID: string | undefined,
    person: Object,
    VITE_APP_PROJECT_API_CONSOLE_URL: string, 
    VITE_APP_ZAPEHR_PROJECT_ID: string,
    VITE_APP_CHAT_ROOM_ENDPOINT: string
  ): Promise<ConversationLinkResponse> => {

    if(!token) {
      throw new Error('Failed to authenicate, are you sure you\'re logged in?');
    }
    
    const url = `${VITE_APP_PROJECT_API_CONSOLE_URL}/messaging/conversation/token`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
        'x-zapehr-project-id': VITE_APP_ZAPEHR_PROJECT_ID
      }
    };

    const res = await fetch(url, options);
    
    if(!res.ok) {
      throw new Error('Failed to obtain conversation token, are you sure you are allowed in?');
    }

    let to = await res.json();

    console.log(conversationID);
    
    let requestObject = {
      patient: person,
      sid: conversationID,
      appointmentId: appointmentID,
      token: to?.token
    };

    let meetingData = {
      token: to?.token,
      tokenized: btoa(JSON.stringify(requestObject)),
      endpoint: VITE_APP_CHAT_ROOM_ENDPOINT,
      generatedLink: `${VITE_APP_CHAT_ROOM_ENDPOINT}?payload=${btoa(JSON.stringify(requestObject))}`
    };

    let responseData = {
      Attendee: person,
      Meeting: meetingData
    } as ConversationLinkResponse;

    return Promise.resolve(responseData);
  };