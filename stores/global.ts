import type { Contact, Lead, Opportunity } from '~/types';

interface IMakeCall {
    contact: Contact;
    lead_id?: Lead['id'];
    opportunity_id?: Opportunity['id'];
}

export const globalStore = defineStore('global', () => {
    const twilioEnabled = ref(false);
    let callMethod: any = () => {};

    function setTwilioEnabled(value: boolean) {
        twilioEnabled.value = value;
    }

    function setMakeCall(value: (value: IMakeCall) => any) {
        callMethod = value;
    }

    function makeCall(value: IMakeCall) {
        callMethod(value);
    }

    return {
        twilioEnabled,
        makeCall,
        setTwilioEnabled,
        setMakeCall,
    };
});
