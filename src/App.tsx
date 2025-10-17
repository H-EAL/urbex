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
import { PerformancePanel, LoadingOverlay } from "@3dverse/livelink-react-ui";

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
                <InfoPanel />
                <div
                    className={`absolute top-[5vh] right-[5vw] w-40 px-4 py-2 text-amber-100
                            bg-[color-mix(in_srgb,var(--color-bg-foreground)_95%,transparent)]
                            backdrop-blur-xl rounded-lg shadow-[0px_24px_40px_10px_color-mix(in_srgb,black_40%,transparent)]
                        `}
                >
                    <PerformancePanel />
                </div>
            </Viewport>
        </Canvas>
    );
}

//------------------------------------------------------------------------------
function InfoPanel() {
    return (
        <div
            className={`absolute top-[5vh] left-[5vw] w-60 px-4 py-2 text-amber-100
                    bg-[color-mix(in_srgb,var(--color-bg-foreground)_95%,transparent)]
                    backdrop-blur-xl rounded-lg shadow-[0px_24px_40px_10px_color-mix(in_srgb,black_40%,transparent)]
                `}
        >
            <h3 className="font-semibold mb-2">Controls</h3>
            <ul className="list-disc list-inside text-sm">
                <li>
                    <kbd>WASD</kbd>: Move
                </li>
                <li>
                    <kbd>Mouse</kbd>: Look Around
                </li>
                <li>
                    <kbd>Shift</kbd>: Sprint
                </li>
                <li>
                    <kbd>Space</kbd>: Jump
                </li>
                <li>
                    <kbd>C</kbd>: Crouch
                </li>
                <li>
                    <kbd>X</kbd>: Toggle Light
                </li>
            </ul>
        </div>
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
