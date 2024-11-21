import { Button } from 'primereact/button';
import React, { useEffect, useRef, useState } from 'react';

interface CameraComponentProps {
    onCapture: (image: File) => void;
    fileName: string;
    isDisabled: boolean;
    cameraFacing: 'user' | 'environment'; // 'user' for front camera, 'environment' for rear camera
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, cameraFacing, fileName, isDisabled }) => {
    const width = 320;
    const [height, setHeight] = useState<number>(0);
    const [streaming, setStreaming] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraActive, setCameraActive] = useState<boolean>(false);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    useEffect(() => {
        if (!cameraActive) return;

        const video = videoRef.current!;
        const canvas = canvasRef.current!;
        if (!video) return;
        const startup = () => {
            navigator.mediaDevices
                .getUserMedia({ video: { facingMode: cameraFacing }, audio: false })
                .then((stream) => {
                    video.srcObject = stream;
                    video.play();
                    // console.log("Success: Stream started");
                })
                .catch((err) => {
                    console.error(`An error occurred: ${err}`);
                    alert("Không tìm được camera trên thiết bị")
                });

            video.addEventListener('canplay', () => {
                if (video && !streaming) {
                    let calculatedHeight = video.videoHeight / (video.videoWidth / width);
                    if (isNaN(calculatedHeight)) {
                        calculatedHeight = width / (4 / 3);
                    }
                    setHeight(calculatedHeight);
                    video.setAttribute('width', width.toString());
                    video.setAttribute('height', calculatedHeight.toString());
                    canvas.setAttribute('width', width.toString());
                    canvas.setAttribute('height', calculatedHeight.toString());
                    setStreaming(true);
                }
            });

            clearphoto();
        };

        startup();

        const handleOrientationChange = () => {
            setHeight(video.videoHeight / (video.videoWidth / width));
        };

        window.addEventListener('resize', handleOrientationChange);

        return () => {
            window.removeEventListener('resize', handleOrientationChange);
            if (video.srcObject) {
                (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraActive, streaming, height, cameraFacing]);

    const clearphoto = () => {
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;
        context.fillStyle = '#AAA';
        context.fillRect(0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL('image/png');
        // console.log("Success: Photo cleared");
    };

    const takepicture = () => {
        const canvas = canvasRef.current!;
        const video = videoRef.current!;
        const context = canvas.getContext('2d')!;
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);
            const data = canvas.toDataURL('image/png');
            setCapturedPhoto(data);
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], fileName, { type: 'image/png' });
                    onCapture(file); // Call the parent callback with the captured image file
                    // console.log("Success: Picture taken");
                }
            }, 'image/png');
            // console.log("Success: Picture taken");
        } else {
            clearphoto();
        }
    };

    const handleToggleCamera = () => {
        setCameraActive(!cameraActive);
        if (!cameraActive) {
            setCapturedPhoto(null);
        }
    };

    return (
        <>
            {!cameraActive ? <Button disabled={isDisabled} className='btnUploadImage' onClick={handleToggleCamera}>
                Chụp ảnh
            </Button> : ""}
            {cameraActive && (
                <div className="contentarea">
                    <div className="camera">
                        {!capturedPhoto ? (
                            <video playsInline className="responsive-media" ref={videoRef} id="video">
                                Video stream not available.
                            </video>
                        ) : (
                            <img src={capturedPhoto} alt="Captured" className="responsive-media" />
                        )}
                        {!capturedPhoto && (
                            <div className='text-center'>
                                <Button className='btnTakePhoto mb-3' type="button" id="startbutton" onClick={takepicture}>
                                    <i className='pi pi-camera'></i>
                                </Button>
                            </div>
                        )}
                    </div>
                    <canvas ref={canvasRef} id="canvas" style={{ display: 'none' }}></canvas>
                </div>
            )}
        </>
    );
};

export default CameraComponent;
