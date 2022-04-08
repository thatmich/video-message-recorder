import React, { useEffect, useState } from 'react';
import { useSettings, useSettingsUpdate } from '../context/SettingsProvider';
import './SelectPrompt.css'

function SelectPrompt(props) {
    const mediaSettings = useSettings();
    const mediaUpdateSettings = useSettingsUpdate();

    var { screen, camera, mic, compose, cameraSuccess } = mediaSettings;

    const [cantRecord, setRecordError] = useState(false);
   

    const whiteColor = "#FFFFFF";
    const greyColor = "#202020";
    const activatedBtn = "linear-gradient(to right, #AA076B 0%, #61045F  51%, #AA076B  100%)"
    
    

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
        
        
        function startTimer(){
            const recordButton = document.getElementById("recordBtn");
            var counter = 3;
            recordButton.innerHTML = counter;
            setInterval(function() {
                counter--;
                if (counter >= 0) {
                  recordButton.innerHTML = counter;
                }
                if (counter === 0) {
                    clearInterval(counter);
                    if (!screen && !camera && !compose && !mic) {
                        setRecordError(true);
                    }
                    else {
                        setRecordError(false);
                        props.handleStart();
                    }
                }
              }, 1000);
        }
        startTimer();
    }

    const Settings = () => (
        <>
            <div className="select-prompt">
                
                <button className="prompt-button" id="screenBtn" onClick={onScreenChange} style={{ backgroundImage: screen ? activatedBtn : whiteColor , color: screen ? whiteColor : greyColor}}>Screen</button>
                <button className="prompt-button" id="cameraBtn" onClick={onCamChange} style={{ backgroundImage: camera ? activatedBtn : whiteColor, color: camera ? whiteColor : greyColor }}>Camera</button>
                <button className="prompt-button" id="micBtn" onClick={onMicChange} style={{ backgroundImage: mic ? activatedBtn : whiteColor, color: mic ? whiteColor : greyColor }}>Microphone</button>
                {/* <button className="prompt-button" id="composeBtn" onClick={onComposeChange} style={{ backgroundImage: compose ? activatedBtn : whiteColor, color: compose ? whiteColor : greyColor }}>Compose</button> */}
            </div>
            <div className="record">
                <button className="recordBtn" id="recordBtn" onClick={onRecord}>Start Recording</button>
                {cantRecord ? <div className='record-error-message'>Error: No recording source!</div> : null}
            </div>
        </>
    )

    

    return (
        <>
            <Settings />
        </>
    )
}

export default SelectPrompt;