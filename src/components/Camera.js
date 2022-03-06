import React, { useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import { useSettings, useSettingsUpdate } from "../context/SettingsProvider";
import './Camera.css'

function Camera(props){
    const mediaSettings = useSettings();
    const mediaUpdateSettings = useSettingsUpdate();
    const {mic} = mediaSettings;

    function handleCameraError(){
        mediaUpdateSettings({...mediaSettings, camera: false, cameraError: true});
    }
    function handleSuccess(){
        mediaUpdateSettings({...mediaSettings,  cameraError: false});
    }

    let videoConstraints = {
        height: props.settings.height,
        width: props.settings.width,
        
        
    }
    const WebcamComponent = () => <Webcam audio={mic} key={mic} muted={true} videoConstraints={videoConstraints} ref={props.webcamRef} mirrored={true} onUserMediaError={handleCameraError} onUserMedia={handleSuccess}/>;
    
    return(
        <div className="camera-frame">
            {WebcamComponent()}
        </div>
    )
}

export default Camera;