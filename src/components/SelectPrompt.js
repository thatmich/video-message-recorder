import React, { useEffect, useState } from 'react';
import { useSettings, useSettingsUpdate } from '../context/SettingsProvider';
import './SelectPrompt.css'

function SelectPrompt(props) {
    const mediaSettings = useSettings();
    const mediaUpdateSettings = useSettingsUpdate();

    var { screen, camera, mic, compose, cameraSuccess } = mediaSettings;

    const [cantRecord, setRecordError] = useState(false);
    const [isRecording, setIsRecord] = useState(false);
   

    const whiteColor = "#FFFFFF";
    const greenColor = "#c1ff83";

    // function createVideo(c = 50000) {
    //     console.log(c);
        
    //     if(cameraSuccess){
    //         console.log("SUCECESS")
    //         const video = document.getElementById("webcam1");
    //         console.log(props.webcamRef.current.stream)
    //         video.srcObject = props.webcamRef.current.stream;
    //         video.style.width=0;
    //         console.log(video.srcObject);
    //         video.addEventListener('loadedmetadata', () => {
    //             video.requestPictureInPicture();
    //         });
    //     }
    //     else if(cameraSuccess === false && c > 0){
    //         window.setTimeout(createVideo((c-10)), 10);
    //     }
        
    // }

    function onScreenChange() {
        mediaUpdateSettings({ ...mediaSettings, screen: !mediaSettings.screen });
        setRecordError(false);
    }
    function onCamChange() {
        if(cameraSuccess){
            mediaUpdateSettings({ ...mediaSettings, camera: !mediaSettings.camera, cameraSuccess: false });
        }
        else{
            mediaUpdateSettings({ ...mediaSettings, camera: !mediaSettings.camera });
        }
        
        setRecordError(false);
        // createVideo();
    }

    
    


    function onMicChange() {
        mediaUpdateSettings({ ...mediaSettings, mic: !mediaSettings.mic });
        setRecordError(false);
    }
    function onComposeChange() {
        mediaUpdateSettings({ ...mediaSettings, compose: !mediaSettings.compose });
        setRecordError(false);
    }

    function onRecord() {
        if (!screen && !camera && !compose && !mic) {
            setRecordError(true);
        }
        else {
            setRecordError(false);
            setIsRecord(true);
            props.handleStart();
        }
    }

    const Settings = () => (
        <>
            <div className="select-prompt">
                
                <button className="prompt-button" id="screenBtn" onClick={onScreenChange} style={{ backgroundColor: screen ? greenColor : whiteColor }}>Screen</button>
                <button className="prompt-button" id="cameraBtn" onClick={onCamChange} style={{ backgroundColor: camera ? greenColor : whiteColor }}>Camera</button>
                <button className="prompt-button" id="micBtn" onClick={onMicChange} style={{ backgroundColor: mic ? greenColor : whiteColor }}>Microphone</button>
                <button className="prompt-button" id="composeBtn" onClick={onComposeChange} style={{ backgroundColor: compose ? greenColor : whiteColor }}>Compose</button>
            </div>
            <div className="record">
                <button id="recordBtn" onClick={onRecord}>Start Recording</button>
                {cantRecord ? <div className='record-error-message'>Error: No recording source!</div> : null}
            </div>
        </>
    )

    

    return (
        <div>
            {isRecording ? null : <Settings />}
        </div>
    )
}

export default SelectPrompt;