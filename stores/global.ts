export const globalStore = defineStore('global', () => {
    const twilioEnabled = ref(false);
    let callMethod: any = () => {};

    function setTwilioEnabled(value: boolean) {
        twilioEnabled.value = value;
    }

    function setMakeCall(value: any) {
        callMethod = value;
    }

    function makeCall(number: string) {
        callMethod(number);
    }

    return {
        twilioEnabled,
        makeCall,
        setTwilioEnabled,
        setMakeCall,
    };
});
