import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSettings, useSettingsUpdate } from "../context/SettingsProvider";
import Screenshare from "./Screenshare"
import Camera from "./Camera"
import SelectPrompt from "./SelectPrompt"
import "./VideoSpace.css"

function VideoSpace() {
    const mediaSettings = useSettings();
    /* eslint-disable no-unused-vars */
    var { screen, camera, mic, compose, cameraError, cameraSuccess, micError, screenSuccess, screenError, screen_audio } = mediaSettings;
    const mediaUpdateSettings = useSettingsUpdate();
    // const [bothMedia, setBothMedia] = useState(false);
    const webcamRef = useRef(null); // webcam video reference
    const screenRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [capturing, setCapturing] = useState(false); // boolean for displaying the capture window
    const [prompting, setPrompt] = useState(true);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [videoHeight, setVideoHeight] = useState("0px");
    const [inPiP, setInPiP] = useState(false);
    const [canvasLoading, setCanvasLoading] = useState(false);
    var stream;
    var audioStream;
    var canvas = document.createElement('canvas');
    const canvasStreamRef = useRef(stream);
    const audioStreamRef = useRef(audioStream);
    const canvasRef = useRef(canvas);
    const [canvasLoaded, setCanvasLoaded] = useState(false);

    function handleStartCaptureClick() {
        setCapturing(true);
        setPrompt(false);
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
            if (screenRef.current.srcObject.getVideoTracks()[0].getSettings().displaySurface === "monitor") {
                // full screen mode
                console.log("monitor")
                handleStartScreenOnly();

            }
            else if (screenRef.current.srcObject.getVideoTracks()[0].getSettings().displaySurface !== "monitor") {
                // selected screen mode
                console.log("not monitor")
                handleStartCombined();
            }

        }
    }

    useEffect(() => { // doesn't work for firefox
        if (cameraSuccess && screen && screenRef.current.srcObject != null && screenRef.current.srcObject.getVideoTracks()[0].getSettings().displaySurface === "monitor") {
            console.log("Monitor");
            const video = document.getElementById("webcam1");
            video.srcObject = webcamRef.current.stream;
            video.style.visibility = "hidden";
            video.style.height = "0px"
            if (!inPiP) {
                video.addEventListener('loadedmetadata', () => {
                    video.requestPictureInPicture();
                });
                setInPiP(true);
            }
        }

        else if ((cameraSuccess === false && inPiP === true) || (screen === false && inPiP === true) || (inPiP === true && screenRef.current.srcObject != null && screenRef.current.srcObject.getVideoTracks()[0].getSettings().displaySurface !== "monitor")) {
            document.exitPictureInPicture();
            setInPiP(false);
        }
        else if (cameraSuccess && screenSuccess && screenRef.current.srcObject != null && screenRef.current.srcObject.getVideoTracks()[0].getSettings().displaySurface !== "monitor") {
            console.log("HELLO")
            const camVideo = document.getElementById("webcam1");
            const screenVideo = document.getElementById("screenshare-video");
            camVideo.style.visibility = "hidden";
            camVideo.style.height = "0px";
            screenVideo.style.visibility = "hidden";
            screenVideo.style.height = "0px";
            setCanvasLoading(true);
        }
    }, [cameraSuccess, camera, screenSuccess, screen, mic, inPiP])

    useEffect(() => {

        function loadCanvas() {
            let canv = canvasRef.current;
            const currentDiv = document.getElementById("canvas-space");
            // canvas
            canv.id = "canvas1";
            //canvas.visibility = "hidden";
            if (screenRef.current.readyState === HTMLMediaElement.HAVE_NOTHING) {
                // default
                canv.height = 300;
                canv.width = 1080;
            }
            else {
                canv.height = screenRef.current.videoHeight;
                canv.width = screenRef.current.videoWidth;
            }

            let camWidth = canv.width / 4;
            let camHeight = camWidth * (webcamRef.current.video.videoHeight / webcamRef.current.video.videoWidth);
            document.body.appendChild(canv);
            canvasStreamRef.current = canv.captureStream(30 /*fps*/);
            currentDiv.appendChild(canv);
            canv.style.marginLeft = 0;
            canv.style.marginRight = 0;
            loop(canv, camWidth, camHeight);
            // webcamRef.current.video.addEventListener('playing', function () {
            //     loop(canv, camWidth, camHeight);
            // });
        }


        function loop(c, w, h) {
            var ctx = c.getContext("2d");
            let canv = canvasRef.current;
            //https://stackoverflow.com/questions/44156528/canvas-doesnt-repaint-when-tab-inactive-backgrounded-for-recording-webgl
            if (screenRef.current.readyState === HTMLMediaElement.HAVE_NOTHING) {
                // default
                canv.height = 300;
                canv.width = 1080;
            }
            else {
                canv.height = screenRef.current.videoHeight;
                canv.width = screenRef.current.videoWidth;
            }
            if (webcamRef.current != null && webcamRef.current.video != null && screenRef.current != null &&
                webcamRef.current.stream.getTracks()[0].readyState !== 'ended') {
                if (isNaN(h)) {
                    h = w * (webcamRef.current.video.videoHeight / webcamRef.current.video.videoWidth);
                }
                ctx.drawImage(screenRef.current, 0, 0);
                ctx.drawImage(webcamRef.current.video, 0, 0, w, h);

                requestAnimationFrame(function () {
                    loop(c, w, h);
                });
            }
            else {
                console.log("Ending Recording");
                setCanvasLoaded(false);
            }

        };

        if (canvasLoading === true) {
            loadCanvas();
            setCanvasLoaded(true);
        }
    }, [canvasLoading, capturing])

    useEffect(() => {
        const micCheck = async () => {
            if (mic) {
                audioStreamRef.current = await navigator.mediaDevices.getUserMedia({
                    audio: true
                });
            }
            else {
                audioStreamRef.current = undefined;
            }
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
        else if (screen === false) {
            setVideoHeight("0px");
            if (screenRef.current.srcObject != null) {
                let tracks = screenRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                screenRef.current.srcObject = null;
            }
        }
    }, [camera, screen])

    const handleDataAvailable = useCallback(
        ({ data }) => {
            if (data.size > 0) {
                setRecordedChunks((prev) => prev.concat(data));
            }
        },
        [setRecordedChunks]
    );

    const handleStartScreenOnly = useCallback(() => {

        if (audioStreamRef.current) {
            console.log(audioStreamRef.current)
            screenRef.current.srcObject.addTrack(audioStreamRef.current.getAudioTracks()[0]);
        }
        mediaRecorderRef.current = new MediaRecorder(screenRef.current.srcObject);
        //console.log(screen_audio)
        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            handleDataAvailable
        );
        // countdown?
        mediaRecorderRef.current.start();
    }, [screenRef, mediaRecorderRef, handleDataAvailable]);


    const handleStartCamOnly = useCallback(() => {
        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, { //webcamRef.current.stream
            mimeType: "video/webm"
        });
        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            handleDataAvailable
        );
        mediaRecorderRef.current.start();
    }, [webcamRef, mediaRecorderRef, handleDataAvailable]);


    const handleStartMicOnly = useCallback(() => {
        mediaRecorderRef.current = new MediaRecorder(audioStreamRef.current);
        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            handleDataAvailable
        );
        mediaRecorderRef.current.start();
    }, [audioStreamRef, mediaRecorderRef, handleDataAvailable]);

    const handleStartCombined = useCallback(() => {

        // countdown?

        // recording
        mediaRecorderRef.current = new MediaRecorder(canvasStreamRef.current);

        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            handleDataAvailable
        );
        mediaRecorderRef.current.start();

    }, [canvasStreamRef, handleDataAvailable])

    const handleStopCaptureClick = useCallback(() => {
        mediaRecorderRef.current.stop();
        if (audioStreamRef.current != null) {
            let tracks = audioStreamRef.current.getAudioTracks();
            tracks.forEach(function (track) {
                track.stop();
            });
        }
        if (webcamRef.current != null) {
            let tracks1 = webcamRef.current.stream.getTracks();
            tracks1.forEach(function (track) {
                track.stop();
            });
            webcamRef.current.video.style.height = 0;
        }
        console.log(screenRef.current.srcObject);
        if (screenRef.current.srcObject != null) {
            let tracks2 = screenRef.current.srcObject.getTracks();
            tracks2.forEach(function (track) {
                track.stop();
            });
            console.log(screenRef.current)
            screenRef.current.style.height = 0;
        }


        setCapturing(false);
        setCanvasLoading(false);
        mediaUpdateSettings(
            {
                screen: false,
                camera: false,
                mic: false,
                compose: false,
                micError: false,
                screenError: false,
                screenSuccess: false,
                cameraError: false,
                cameraSuccess: false,
            })

        // canvas
        const canvasObj = document.getElementById("canvas1");
        if (canvasObj) {
            canvasObj.parentNode.removeChild(canvasObj);
        }
    }, [mediaRecorderRef]);


    const handleDownload = useCallback(() => {
        if (recordedChunks.length) {
            console.log("hi")
            const blob = new Blob(recordedChunks);
            var url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            a.download = "react-webcam-stream-capture.mp4";
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        }
    }, [recordedChunks]);

    const onReturn = () => {
        setPrompt(true);
        setRecordedChunks([]);


    }


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
                <button className="recordBtn" id="stopRecordBtn" onClick={handleStopCaptureClick}>Stop Recording</button>
            </div>
        </>
    )
    // bothMedia={bothMedia} key={bothMedia} in camera

    const FinishMenu = () => (
        <div className="finishMenu">
            <button className="recordBtn" onClick={handleDownload}>Download Video</button>
            <button className="recordBtn" onClick={onReturn}>Record Again</button>
        </div>
    )
    var isChrome = navigator.userAgent.includes("Chrome") && navigator.vendor.includes("Google Inc");
    return (
        <div className="video-space" id="main-space">
            {(!isChrome) ? <div className="error-message">Please use Chrome or Edge for the full experience.</div> : null}
            {(cameraError || micError || screenError) ? <div className="error-message">Please enable media permissions!</div> : null}
            {/* {(screen && mic) ? <div className="error-mesasage onboard-audio">Reminder: yet to implement mic and system audio simultaneous recording. Using system audio if available.</div> : null} */}
            {capturing ? <RecordingMenu /> : null}
            {recordedChunks.length > 0 ? <FinishMenu /> : null}
            {prompting && !capturing ? <SelectPrompt className="settings-selector" handleStart={handleStartCaptureClick} webcamRef={webcamRef} /> : null}
            <div className="video-box">
                <div id="canvas-space" style={{ position: "absolute" }}>
                </div>
                {(!screen || !mic || !camera) ?
                    <p className="prompt-message">
                        Please select a video/audio source</p> : null}
                <div style={{ position: "absolute" }}>
                    <video id="screenshare-video" ref={screenRef} autoPlay={true} src={null} muted={true} style={{ height: videoHeight }}></video>
                </div>


                {(camera) ? <Camera settings={cameraSettings} webcamRef={webcamRef} /> : null}
                {screen ? <Screenshare /> : null}
            </div>

        </div>
    )
}

export default VideoSpace