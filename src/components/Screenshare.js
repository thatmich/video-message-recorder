import React, { useEffect } from "react";
import { useSettings, useSettingsUpdate } from "../context/SettingsProvider";

function Screenshare() {
    const mediaSettings = useSettings();
    const { mic, screen_audio } = mediaSettings;
    var { screenError } = mediaSettings;
    const mediaUpdateSettings = useSettingsUpdate();
    var videoElement;


    var displayMediaOptions = {
        video: {
            cursor: "always"
        },
        audio: !mic,
    };

    function handleScreenError() {
        mediaUpdateSettings({ ...mediaSettings, screen: false, screenError: true });
    }
    function handleSuccess() {
        

        mediaUpdateSettings({ ...mediaSettings, screen: true, screenError: false });
    }
    async function startCapture() {
        videoElement = document.getElementById("screenshare-video");
        try {
            
            videoElement.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
            videoElement.style.height = "25em";
            handleSuccess()
        } catch (err) {
            handleScreenError();
            let tracks = videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoElement.srcObject = null;
        }
    }
    useEffect(()=>{
        startCapture();
    }, [])
    
    return (
        <div>
            {}
        </div>
    );
}

export default Screenshare;