import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "../context/SettingsProvider";
import Screenshare from "./Screenshare"
import Camera from "./Camera"
import SelectPrompt from "./SelectPrompt"
import "./VideoSpace.css"

function VideoSpace() {
    const mediaSettings = useSettings();
    var { screen, camera, mic, compose, cameraError, micError, screenError } = mediaSettings;
    const [imageWidth, setImageWidth] = useState("600px")
    const webcamRef = useRef(null);
    const screenRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [capturing, setCapturing] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);

    const handleStartCaptureClick = useCallback(() => {
        setCapturing(true);
        mediaRecorderRef.current = new MediaRecorder(screenRef.current.srcObject, { //webcamRef.current.stream
            mimeType: "video/webm"
        });
        
        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            handleDataAvailable
        );
        mediaRecorderRef.current.start();
    }, [screenRef, setCapturing, mediaRecorderRef]);

    const handleDataAvailable = useCallback(
        ({ data }) => {
            if (data.size > 0) {
                setRecordedChunks((prev) => prev.concat(data));
            }
        },
        [setRecordedChunks]
    );

    const handleStopCaptureClick = useCallback(() => {
        mediaRecorderRef.current.stop();
        setCapturing(false);
    }, [mediaRecorderRef, screenRef, setCapturing]);

    const handleDownload = useCallback(() => {
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, {
                type: "video/webm"
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            a.download = "react-webcam-stream-capture.webm";
            a.click();
            window.URL.revokeObjectURL(url);
            setRecordedChunks([]);
        }
    }, [recordedChunks]);

    const [cameraSettings, setCameraSettings] = useState(
        {
            x: 0,
            y: 0,
            width: "1280",
            height: "720",
        }
    );
    useEffect(() => {
        if (screen && camera) {
            setImageWidth("200px")
        }
        else if (camera && !screen) {
            setImageWidth("600px")
        }
    }, [camera, screen])

    const RecordingMenu = () => (
        <>
            <div className="recordingMenu">
                {/* <button id="pauseRecordBtn" onClick={onPause}>Pause Recording</button> */}
                <button id="stopRecordBtn" onClick={handleStopCaptureClick}>Stop Recording</button>
            </div>
            
        </>
    )

    return (

        <div className="video-space">

            {(cameraError || micError || screenError) ? <div className="error-message">Please enable media permissions!</div> : null}

            <video id="screenshare-video" ref={screenRef} autoPlay={true} src={null} style={{ height: "0px" }}></video>
            
            {screen ? <Screenshare /> : null}
            
            {(mic && !camera) ? <>Test</> : null}
            {capturing ? <RecordingMenu/> : null}
            {recordedChunks.length > 0 && (
                <button onClick={handleDownload}>Download</button>
            )}

            <SelectPrompt className="settings-selector" handleStart={handleStartCaptureClick}/>
            {(camera) ? <Camera settings={cameraSettings} webcamRef={webcamRef} imageWidth={imageWidth}/> : null}

        </div>
    )
}

export default VideoSpace