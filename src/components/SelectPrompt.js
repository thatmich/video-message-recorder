import React, { useState } from 'react';
import { useSettings, useSettingsUpdate } from '../context/SettingsProvider';
import './SelectPrompt.css'

function SelectPrompt(props) {
    const mediaSettings = useSettings();
    const mediaUpdateSettings = useSettingsUpdate();

    var { screen, camera, mic, compose } = mediaSettings;

    const [cantRecord, setRecordError] = useState(false);
    const [isRecording, setIsRecord] = useState(false);

    const whiteColor = "#FFFFFF";
    const greenColor = "#c1ff83";

    function onScreenChange() {
        mediaUpdateSettings({ ...mediaSettings, screen: !mediaSettings.screen });
        setRecordError(false);
    }
    function onCamChange() {
        mediaUpdateSettings({ ...mediaSettings, camera: !mediaSettings.camera });
        setRecordError(false);
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
                
                <button id="screenBtn" onClick={onScreenChange} style={{ backgroundColor: screen ? greenColor : whiteColor }}>Screen</button>
                <button id="cameraBtn" onClick={onCamChange} style={{ backgroundColor: camera ? greenColor : whiteColor }}>Camera</button>
                <button id="micBtn" onClick={onMicChange} style={{ backgroundColor: mic ? greenColor : whiteColor }}>Microphone</button>
                <button id="composeBtn" onClick={onComposeChange} style={{ backgroundColor: compose ? greenColor : whiteColor }}>Compose</button>
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