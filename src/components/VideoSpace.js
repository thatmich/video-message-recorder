import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "../context/SettingsProvider";
import Screenshare from "./Screenshare"
import Camera from "./Camera"
import SelectPrompt from "./SelectPrompt"
import "./VideoSpace.css"

function VideoSpace() {
    const mediaSettings = useSettings();
    var { screen, camera, mic, compose, cameraError, cameraSuccess, micError, screenError, screen_audio } = mediaSettings;
    // const [bothMedia, setBothMedia] = useState(false);
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
            //console.log(screenRef.current.srcObject.getVideoTracks()[0].getSettings().displaySurface)
            if (screenRef.current.srcObject.getVideoTracks()[0].getSettings().displaySurface == "monitor") {
                // full screen mode
                console.log("monitor")
                handleStartScreenOnly();

            }
            else if (screenRef.current.srcObject.getVideoTracks()[0].getSettings().displaySurface != "monitor") {
                // selected screen mode
                console.log("not monitor")
                handleStartCombined();
            }

        }
    }

    useEffect(() => { // doesn't work for firefox
        if (cameraSuccess && screen) {
            const video = document.getElementById("webcam1");
            console.log(webcamRef.current.stream)
            video.srcObject = webcamRef.current.stream;
            video.style.visibility = "hidden";
            video.style.height = "0px"
            video.addEventListener('loadedmetadata', () => {
                video.requestPictureInPicture();
            });
            setInPiP(true);
        }
        else if ((cameraSuccess === false && inPiP === true) || (screen === false && inPiP === true)) {
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
        // if (screen && camera) {
        //     setBothMedia(true)
        // }
        // else if (camera && !screen) {
        //     setBothMedia(false)
        // }
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
        //console.log(screen_audio)
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


        var canvas = document.createElement('canvas');
        canvas.id = "canvas1";
        //canvas.visibility = "hidden";

        var ctx = canvas.getContext("2d");
        canvas.height = screenRef.current.videoHeight;
        canvas.width = screenRef.current.videoWidth;
        ctx.fillStyle = "lightblue";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        function loop() {
            console.log(typeof webcamRef.current);
            if (webcamRef.current !== undefined && !webcamRef.current.paused && !webcamRef.current.ended) {
                console.log(webcamRef.current)
                ctx.drawImage(webcamRef.current.video, 0, 0);
                setTimeout(loop, 1000 / 30); // drawing at 30fps
            }
        };
        loop();
        document.body.appendChild(canvas);


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

    const handleStartCombined = useCallback(() => {
        
        // countdown?

        // canvas
        var canvas = document.createElement('canvas');
        canvas.id = "canvas1";
        //canvas.visibility = "hidden";

        var ctx = canvas.getContext("2d");
        canvas.height = screenRef.current.videoHeight;
        canvas.width = screenRef.current.videoWidth;
        ctx.fillStyle = "lightblue";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        function loop() {
            let camWidth = canvas.width/4;
            let camHeight = camWidth * (webcamRef.current.video.videoHeight/webcamRef.current.video.videoWidth);
            if (webcamRef.current !== undefined && !screenRef.current.paused && !screenRef.current.ended && !webcamRef.current.paused && !webcamRef.current.ended) {
                ctx.drawImage(screenRef.current, 0, 0);
                ctx.drawImage(webcamRef.current.video, 0, canvas.height - camHeight, camWidth, camHeight);
                setTimeout(loop, 1000 / 30); // drawing at 30fps
            }
        };
        loop();
        document.body.appendChild(canvas);     
        
        // recording
        setCapturing(true);
        var stream = canvas.captureStream(30 /*fps*/ );
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            handleDataAvailable
        );
        mediaRecorderRef.current.start();

    }, [webcamRef, screenRef, mic])

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
    }, [mediaRecorderRef, setCapturing]);


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
    // bothMedia={bothMedia} key={bothMedia} in camera

    return (
        <div className="video-space">
            {(cameraError || micError || screenError) ? <div className="error-mesasage">Please enable media permissions!</div> : null}
            {(screen && mic) ? <div className="error-mesasage onboard-audio">Reminder: yet to implement mic and system audio simultaneous recording. Using system audio if available.</div> : null}
            {capturing ? <RecordingMenu /> : null}
            {recordedChunks.length > 0 && (
                <button onClick={handleDownload}>Download1</button>
            )}
            <SelectPrompt className="settings-selector" handleStart={handleStartCaptureClick} webcamRef={webcamRef} />
            <video id="screenshare-video" ref={screenRef} autoPlay={true} src={null} muted={true} style={{ height: videoHeight }}></video>
            {(camera) ? <Camera settings={cameraSettings} webcamRef={webcamRef} /> : null}
            {screen ? <Screenshare /> : null}
        </div>
    )
}

export default VideoSpace