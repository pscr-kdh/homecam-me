'use client'
import { useState } from 'react'

export default function VoiceRecorderButton() {
    const [recording, setRecording] = useState<boolean>(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null
    )
    const [audioChunks, setAudioChunks] = useState<Blob[]>([])

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        })
        const recorder = new MediaRecorder(stream)
        setMediaRecorder(recorder)

        recorder.ondataavailable = (event) => {
            setAudioChunks((prev) => [...prev, event.data])
        }

        recorder.start()
        setRecording(true)
    }

    const stopAndSend = () => {
        if (mediaRecorder) {
            mediaRecorder.stop()
            mediaRecorder.stream.getTracks().forEach((track) => track.stop())
            setRecording(false)

            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
            const formData = new FormData()
            formData.append('voice', audioBlob, 'voice.wav')

            fetch('/api/voice', {
                method: 'POST',
                body: formData,
            })
        }
    }

    return (
        <button
            onClick={recording ? stopAndSend : startRecording}
            className="flex justify-center items-center w-16 h-16 bg-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
            <div
                className={`${
                    recording
                        ? 'w-8 h-8 bg-red-500'
                        : 'w-6 h-6 bg-red-500 rounded-full'
                }`}
            ></div>
        </button>
    )
}
