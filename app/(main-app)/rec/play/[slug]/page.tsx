"use client";
import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export default function RecordPlay({
    params,
}: {
    params: { slug: string }
}) {
    return (
        
        <div>
            <ReactPlayer url={'/api/livestream/7/' + params.slug} />
        </div>
    )
}