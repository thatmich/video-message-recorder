import React, { useContext, useEffect, useState } from 'react';;

const SettingsContext = React.createContext({});
const SettingsUpdateContext = React.createContext();

export function useSettings() {
    return useContext(SettingsContext);
}
export function useSettingsUpdate() {
    return useContext(SettingsUpdateContext);
}

export function SettingsProvider({ children }) {
    const [mediaSettings, setMediaSettings] = useState(
        {
            screen: false,
            camera: false,
            mic: false,
            compose: false,
            micError: false,
            screenError: false,
            cameraError: false,
        }
    )

    function toggleMedia(val) {
        setMediaSettings(prevSettings => val);
    }

    return (
        <SettingsContext.Provider value={ mediaSettings }>
            <SettingsUpdateContext.Provider value={toggleMedia}>
                {children}
            </SettingsUpdateContext.Provider>
        </SettingsContext.Provider>
    );
}

