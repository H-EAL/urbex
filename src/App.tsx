//------------------------------------------------------------------------------
import { useContext } from "react";
import { CameraControllerPresets } from "@3dverse/livelink";

import {
    Livelink,
    Canvas,
    Viewport,
    CameraController,
    useCameraEntity,
    LivelinkContext,
} from "@3dverse/livelink-react";
import { LoadingOverlay } from "@3dverse/livelink-react-ui";

//------------------------------------------------------------------------------
import "./App.css";

//------------------------------------------------------------------------------
const scene_id = "e58e152c-fa3d-43c5-adbc-8f8d5c77da01";
const token = "public_J9TC5mDhoFG3YeYB";

//------------------------------------------------------------------------------
export function App() {
    return (
        <Livelink sceneId={scene_id} token={token} LoadingPanel={LoadingOverlay}>
            <AppLayout />
        </Livelink>
    );
}

//------------------------------------------------------------------------------
const cameraSettings = {
    voxels: false,
    // Fog
    fog: true,
    fogZeroHeight: 0,
    fogHeightDensity: 1,
    fogDistanceDensity: 0.0001,
    // Env
    skybox: true,
    gradient: false,
    brightness: 0.01,
    ambientIntensity: 0.01,
    //Editing
    grid: false,
    selectionOutlines: false,
    // PostFX
    sharpen: true,
    filterSpecular: true,
    bloom: true,
    bloomThreshold: 1,
    bloomStrength: 2,
};

//------------------------------------------------------------------------------
function AppLayout() {
    const { cameraEntity } = useCameraEntity({ settings: cameraSettings });
    const { isConnecting } = useContext(LivelinkContext);

    return (
        <Canvas className="h-dvh">
            <Viewport cameraEntity={cameraEntity} className="w-full h-full">
                {!isConnecting && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-green-800 text-sm text-white rounded-full py-1 px-3 pointer-events-none animate-[fade-out_.5s_2s_forwards]">
                        Connected.
                    </div>
                )}
                <CameraController preset={CameraControllerPresets.fly} />
            </Viewport>
        </Canvas>
    );
}

export default App;
