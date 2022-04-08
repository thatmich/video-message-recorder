import React from "react"
import Webcam from "react-webcam"
import { useSettings, useSettingsUpdate } from "../context/SettingsProvider";
import './Camera.css'

function Camera(props) {
    const mediaSettings = useSettings();
    const mediaUpdateSettings = useSettingsUpdate();
    const { mic } = mediaSettings;

    function handleCameraError() {
        mediaUpdateSettings({ ...mediaSettings, camera: false, cameraError: true, cameraSuccess: false });
    }
    function handleSuccess() {
        mediaUpdateSettings({ ...mediaSettings, cameraError: false, cameraSuccess: true});
    }


    let videoConstraints = {
        height: props.settings.height,
        width: props.settings.width,
    }

    // const [active, setActive] = useState(true)
    // useEffect(() => {
    //     setActive(true);
    //     if(props.webcamRef.current !== null){
    //         console.log(props.webcamRef.current.stream);
    //     }
    // }, [active]);

    // const PictureInPictureVideoSrc = () =>{
    //     if(props.webcamRef.current !== null){
    //         console.log("HELLO");
    //         return(
    //             <video src={props.webcamRef.current.stream}/>
    //         )
    //     }
    //     else{
    //         return null;
    //     }
    // }

    



    return (
        <>
            <Webcam
                className="webcam"
                id="webcam1"
                audio={mic}
                key={mic}
                muted={true}
                videoConstraints={videoConstraints}
                ref={props.webcamRef}
                // mirrored={true}
                onUserMediaError={handleCameraError}
                onUserMedia={handleSuccess}
            />
        </>
    )

}

export default Camera;
