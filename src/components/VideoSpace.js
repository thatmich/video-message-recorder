import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "../context/SettingsProvider";
import Screenshare from "./Screenshare"
import Camera from "./Camera"
import SelectPrompt from "./SelectPrompt"
import "./VideoSpace.css"

function VideoSpace() {
    const mediaSettings = useSettings();
    var { screen, camera, mic, compose, cameraError, cameraSuccess, micError, screenError, screen_audio } = mediaSettings;
    const [bothMedia, setBothMedia] = useState(false);
    const webcamRef = useRef(null); // webcam video reference
    const screenRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [capturing, setCapturing] = useState(false); // boolean for displaying the capture window
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [videoHeight, setVideoHeight] = useState("0px");
    const [inPiP, setInPiP] = useState(false);
    let audioStream;
    
    function handleStartCaptureClick() {
        if (screen && !camera) {
            handleStartScreenOnly();
        }
        else if (camera && !screen) {
            handleStartCamOnly();
        }
        else if (mic && !camera && !screen) {
            handleStartMicOnly();
        }
        else if (screen && camera) {
            if(true){
                // full screen mode
                handleStartScreenOnly();
            }
            else{
                // selected screen mode
            }
        }
    }

    useEffect(()=>{ // doesn't work for firefox
        if(cameraSuccess && screen){
            const video = document.getElementById("webcam1");
            console.log("TRYING");
            console.log(webcamRef.current.stream)
            video.srcObject = webcamRef.current.stream;
            video.style.visibility="hidden";
            video.style.height = "0px"
            video.addEventListener('loadedmetadata', () => {
                video.requestPictureInPicture();
            });
            setInPiP(true);
        }
        else if((cameraSuccess === false && inPiP === true) || (screen === false && inPiP === true)){
            document.exitPictureInPicture();
            setInPiP(false);
        }
    }, [cameraSuccess, screen, mic, camera])

    useEffect(() => {
        const micCheck = async () => {
            if (mic) {
                audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: true
                });
            }
            else {
                audioStream = undefined;
            }
            //console.log(audioStream);
        };
        micCheck();
    }, [mic])

    useEffect(() => {
        if (screen && camera) {
            setBothMedia(true)
        }
        else if (camera && !screen) {
            setBothMedia(false)
        }
        if (screen === true) {
            setVideoHeight("700px")
        }
        else if (screen === true) {
            setVideoHeight("0px");
        }
    }, [camera, screen])

    const handleStartScreenOnly = useCallback(() => {
        setCapturing(true);
        if (audioStream) {
            console.log(audioStream)
            screenRef.current.srcObject.addTrack(audioStream.getAudioTracks()[0]);
        }
        mediaRecorderRef.current = new MediaRecorder(screenRef.current.srcObject);
        console.log(screen_audio)
        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            handleDataAvailable
        );
        // countdown?
        mediaRecorderRef.current.start();
    }, [screenRef, mediaRecorderRef, mic]);


    const handleStartCamOnly = useCallback(() => {
        setCapturing(true);
        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, { //webcamRef.current.stream
            mimeType: "video/webm"
        });

        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            handleDataAvailable
        );
        mediaRecorderRef.current.start();
    }, [webcamRef, setCapturing, mediaRecorderRef]);


    const handleStartMicOnly = useCallback(() => {
        setCapturing(true);
        mediaRecorderRef.current = new MediaRecorder(audioStream);
        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            handleDataAvailable
        );
        mediaRecorderRef.current.start();
    });


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
            const blob = new Blob(recordedChunks);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            a.download = "react-webcam-stream-capture.mp4";
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
            {(cameraError || micError || screenError) ? <div className="error-mesasage">Please enable media permissions!</div> : null}
            {(screen && mic) ? <div className="error-mesasage onboard-audio">Reminder: yet to implement mic and system audio simultaneous recording. Using system audio if available.</div> : null}
            {capturing ? <RecordingMenu /> : null}
            {recordedChunks.length > 0 && (
                <button onClick={handleDownload}>Download</button>
            )}
            <SelectPrompt className="settings-selector" handleStart={handleStartCaptureClick} webcamRef={webcamRef} />
            <video id="screenshare-video" ref={screenRef} autoPlay={true} src={null} muted={true} style={{ height: videoHeight }}></video>
            {(camera) ? <Camera settings={cameraSettings} webcamRef={webcamRef} bothMedia={bothMedia} key={bothMedia} /> : null}
            {screen ? <Screenshare /> : null}
        </div>
    )
}

export default VideoSpace