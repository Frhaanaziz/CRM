import type { Contact } from '~/types';

export const globalStore = defineStore('global', () => {
    const twilioEnabled = ref(false);
    let callMethod: any = () => {};

    function setTwilioEnabled(value: boolean) {
        twilioEnabled.value = value;
    }

    function setMakeCall(value: (value: Contact) => any) {
        callMethod = value;
    }

    function makeCall(value: Contact) {
        callMethod(value);
    }

    return {
        twilioEnabled,
        makeCall,
        setTwilioEnabled,
        setMakeCall,
    };
});
