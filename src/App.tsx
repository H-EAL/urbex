//------------------------------------------------------------------------------
import { useContext, useEffect, useState } from "react";
import { type Livelink as LivelinkInstance, Entity } from "@3dverse/livelink";

import {
    Livelink,
    Canvas,
    Viewport,
    LivelinkContext,
    ViewportContext,
} from "@3dverse/livelink-react";
import { LoadingOverlay } from "@3dverse/livelink-react-ui";

//------------------------------------------------------------------------------
import "./App.css";

//------------------------------------------------------------------------------
const scene_id = "e58e152c-fa3d-43c5-adbc-8f8d5c77da01";
const token = "public_J9TC5mDhoFG3YeYB";
const characterControllerSceneUUID = "7392872d-6fb6-43a2-a8a2-8dc8f1afd014";

//------------------------------------------------------------------------------
export function App() {
    return (
        <Livelink sceneId={scene_id} token={token} LoadingPanel={LoadingOverlay}>
            <AppLayout />
        </Livelink>
    );
}

//------------------------------------------------------------------------------
function AppLayout() {
    const { instance } = useContext(LivelinkContext);

    useEffect(() => {
        if (!instance) {
            return;
        }

        async function instantiatePlayerSceneAndFindThirdPersonCamera(instance: LivelinkInstance) {
            const playerSceneEntity = await instance.scene.newEntity({
                name: "PlayerSceneEntity",
                components: {
                    local_transform: { position: [0, 1.7, 0] },
                    scene_ref: { value: characterControllerSceneUUID },
                },
                options: {
                    delete_on_client_disconnection: true,
                },
            });

            const children = await playerSceneEntity.getChildren();
            const thirdPersonCameraEntity = children.find((child) => child.camera !== undefined);

            console.log("Assigning client to scripts");
            if (thirdPersonCameraEntity && instance.session.client_id) {
                thirdPersonCameraEntity.assignClientToScripts({
                    client_uuid: instance.session.client_id,
                });
            }

            setStartSimulation(true);

            setCameraEntity(thirdPersonCameraEntity ?? null);
        }
        instantiatePlayerSceneAndFindThirdPersonCamera(instance);
    }, [instance]);

    const [startSimulation, setStartSimulation] = useState<boolean>(false);
    const [cameraEntity, setCameraEntity] = useState<Entity | null>(null);

    return (
        <Canvas className="w-full h-full">
            <Viewport cameraEntity={cameraEntity} className="w-full h-full">
                {startSimulation && <SimulationStarter />}
            </Viewport>
        </Canvas>
    );
}

//------------------------------------------------------------------------------
function SimulationStarter() {
    const { instance } = useContext(LivelinkContext);
    const { viewport, viewportDomElement } = useContext(ViewportContext);

    useEffect(() => {
        if (!instance || !viewport || !viewportDomElement) {
            return;
        }

        console.log("Setting up controller");

        if (viewportDomElement.requestPointerLock) {
            viewportDomElement.requestPointerLock();
        }

        instance.devices.keyboard.enable();
        instance.devices.gamepads_registry.enable();
        instance.devices.mouse.enableOnViewport({ viewport });

        instance.startSimulation();
    }, [instance, viewport, viewportDomElement]);

    return null;
}

export default App;
