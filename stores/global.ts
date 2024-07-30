interface CallMethodInput {
    full_name: string;
    number: string;
}

export const globalStore = defineStore('global', () => {
    const twilioEnabled = ref(false);
    let callMethod: any = () => {};

    function setTwilioEnabled(value: boolean) {
        twilioEnabled.value = value;
    }

    function setMakeCall(value: (value: CallMethodInput) => any) {
        callMethod = value;
    }

    function makeCall(value: CallMethodInput) {
        callMethod(value);
    }

    return {
        twilioEnabled,
        makeCall,
        setTwilioEnabled,
        setMakeCall,
    };
});
