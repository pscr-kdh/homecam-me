"use client";

import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });
interface Props {
    id: number;
    name: string;
    isRecording: boolean;
}
export default function CameraViewCard({id, name, isRecording}: Props) {

    return (
        <div className="border p-4 flex flex-col bg-white rounded-lg shadow items-center justify-center">
            <div className="font-bold flex justify-between w-full">
              <span>{name}</span>
              <span className="text-red-500">{isRecording ? '● REC' : ''}</span>
            </div>
            <div className="aspect-ratio-16-9">
              <div className="react-player-wrapper flex items-center justify-center">
                <ReactPlayer width='100%' height='100%' url={`/api/livestream/${id.toString()}/live.m3u8`} controls={true} muted={true} playing={true} config={{file: {forceHLS: true, hlsOptions: {
                  
                }}}} />
              </div>
            </div>
          </div>
    );
}