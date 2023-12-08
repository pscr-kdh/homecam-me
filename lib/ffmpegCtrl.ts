//TODO: Logging
import { RecConf } from "@prisma/client";
import { spawn, ChildProcess, exec } from "child_process";
import { prisma } from "./prisma";
import {homedir} from "os";
type FormatDetail = { videoType: string, size: string, fps: number };
type ParsedResult = FormatDetail;

interface Props {
    camDevId: string;
    resolution: string;
    fps: string;
    type: string;
    micDevId: string | null;
    motionEnabled: boolean;
    soundClassEnabled: boolean;
    isRecording: boolean;
}

//isStreamOnly인 경우 5분 후 ffmpeg 프로세스를 자동으로 종료
interface CameraStreamDetails {
    process: ChildProcess;
    lastAccessed: Date;
    props: Props;
}

//cameraIdResolutionFps: 예를 들어 Camera ID 3, Resolution 1920x1080, 60fps라면 '3-1920x1080-60'
interface CameraStreamMap {
    [camDevId: string]: CameraStreamDetails;
}


const cameraStreams: CameraStreamMap = {};
const videoRegex = /usb[a-zA-Z_\- 0-9]*index0/g;

export async function updateStream(prop: Props) {
    if (prop.camDevId in cameraStreams) {
        let prevProp = cameraStreams[prop.camDevId].props;
        //동일한 prop으로 이미 실행 중
        if(prevProp.camDevId == prop.camDevId && prevProp.isRecording == prop.isRecording && prevProp.fps == prop.fps && prevProp.isRecording == prop.isRecording && prevProp.micDevId == prop.micDevId && prevProp.motionEnabled == prop.motionEnabled && prevProp.resolution == prevProp.resolution && prevProp.soundClassEnabled == prop.soundClassEnabled && prevProp.type == prop.type) {
            console.log(`Stream already running for ${prop.camDevId}, updating lastAccessed`);
            cameraStreams[prop.camDevId].lastAccessed = new Date();
            return 200;
        }
        
        //새로운 파라미터가 있는 경우 기존 프로세스 정지 후 새 프로세스 생성 진행
        console.log(`To change stream options of ${prop.camDevId}, killing previous one`);
        console.log(`Previous: ${JSON.stringify(prevProp)}, New: ${JSON.stringify(prop)}`)
        await stopCameraStream(prop.camDevId);
        
        console.log(`Starting ${prop.camDevId}`);
        startCameraStream(prop);
        return 200;
    }
    startCameraStream(prop);
    return 200;
}

//이 함수는 입력으로 들어온 파라미터에 대응되는 카메라 옵션들이 실존하는지 검증하지 않는다
//caller에서 검증할 것!!

function startCameraStream(prop: Props) {

    const streamOptions = ffmpegStreamOptionGenerator(prop);
    console.log(streamOptions);
    const ffmpegProcess = spawn('ffmpeg', streamOptions);

    cameraStreams[prop.camDevId] = {process: ffmpegProcess, lastAccessed: new Date(), props: prop};

    ffmpegProcess.on('close', () => {
        delete cameraStreams[prop.camDevId];
        console.log(`Stream for camera ${prop.camDevId} has stopped`);
    });

    ffmpegProcess.stderr.on('data', (data) => {
        console.error(`stderr from ${prop.camDevId}: ${data}`);
    });

    ffmpegProcess.on('error', (error) => {
        console.error(`Failed to start ffmpeg process for ${prop.camDevId}: ${error.message}`);
    });


    ffmpegProcess.on('close', () => {
        delete cameraStreams[prop.camDevId];
    });
}

export async function stopCameraStream(camDevId: string) {
    const streamDetails = cameraStreams[camDevId];
    if (streamDetails) {
        streamDetails.process.kill();
    }
}

//i'm lovin hardcoding
function ffmpegStreamOptionGenerator({camDevId, resolution, fps, type, micDevId, motionEnabled, soundClassEnabled, isRecording}: Props): string[] {
    const fullCamDevId = '/dev/v4l/by-id/'.concat(camDevId);
    let sourceFormat = 'yuyv422'
    if(type == 'MJPG') sourceFormat = 'mjpeg';

    let options = Array('-f', 'v4l2', '-input_format', sourceFormat, '-framerate', fps, '-video_size', resolution, '-i', fullCamDevId);
    
    if(micDevId) {
        options.push('-f', 'alsa', '-sample_rate', '24000', '-channels', '1', '-thread_queue_size', '8192', '-i', micDevId, '-c:a', 'aac', '-b:a', '64k');
    }

    options.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17');
    
    if(motionEnabled && !isRecording) {
        options.push( '-filter_complex', `[0:v]split=2[stream1][stream2];[stream2]select='gt(scene,0.03)'[motion]`, '-map', '[stream1]');
        if(micDevId) {
            options.push('-map', '1:a');
        }
        options.push('-f', 'hls', '-hls_time', '2',  '-hls_list_size', '3', '-hls_flags', 'delete_segments', '-strftime', '1', '-hls_playlist_type', 'event', '-hls_segment_filename',
             homedir() + '/.hc/' + camDevId + '-%Y%m%dT%H%M%S%z.ts', homedir() + '/.hc/' + camDevId + '-live.m3u8', '-map', '[motion]', '-vsync', 'vfr', '-strftime', '1', homedir() + '/.hc/' + camDevId + '-%Y%m%dT%H%M%S%z.png');

    } else if(motionEnabled && isRecording) {
        options.push('-filter_complex', `[0:v]split=3[stream1][stream2][stream3];[stream2]select='gt(scene,0.03)'[motion]`, '-map', '[stream1]');
        if(micDevId) {
            options.push('-map', '1:a');
        }
        options.push('-f', 'hls', '-hls_time', '2',  '-hls_list_size', '3', '-hls_flags', 'delete_segments', '-strftime', '1', '-hls_playlist_type', 'event', '-hls_segment_filename', 
            homedir() + '/.hc/' + camDevId + '-%Y%m%dT%H%M%S%z.ts', homedir() + '/.hc/' + camDevId + '-live.m3u8', '-map', '[stream3]');
        if(micDevId) {
            options.push('-map', '1:a');
        }
        options.push('-f', 'segment', '-segment_time', '1800', '-strftime', '1', '-reset_timestamps', '1', homedir() + '/.hc/' + camDevId + '-%Y%m%dT%H%M%S%z.mp4', '-map', 
            '[motion]', '-vsync', 'vfr', '-strftime', '1', homedir() + '/.hc/' + camDevId + '-%Y%m%dT%H%M%S%z.png');

    } else if(!motionEnabled && isRecording) {
        if(micDevId) options.push('-map', '1:a');
        options.push('-map', '0:v', '-f', 'hls', '-hls_time', '2',  '-hls_list_size', '3', '-hls_flags', 'delete_segments', '-strftime', '1', 
        '-hls_playlist_type', 'event', '-hls_segment_filename', homedir() + '/.hc/' + camDevId + '-%Y%m%dT%H%M%S%z.ts', homedir() + '/.hc/' + camDevId + '-live.m3u8');
        
        if(micDevId) options.push('-map', '1:a');
        options.push('-map', '0:v', '-f', 'segment', '-segment_time', '1800', '-strftime', '1', '-reset_timestamps', '1', homedir() + '/.hc/' + camDevId + '-%Y%m%dT%H%M%S%z.mp4');

    } else { //stream only
        if(micDevId) options.push('-map', '1:a');
        options.push('-map', '0:v', '-f', 'hls', '-hls_time', '2', '-hls_list_size', '3', '-hls_flags', 'delete_segments', '-strftime', '1', 
            '-hls_playlist_type', 'event', '-hls_segment_filename', homedir() + '/.hc/' + camDevId + '-%Y%m%dT%H%M%S%z.ts', homedir() + '/.hc/' + camDevId + '-live.m3u8');
    }

    if(soundClassEnabled) {
        options.push('-map', '1:a', '-c:a', 'pcm_s16le', '-f', 'segment', '-segment_time', '10', '-strftime', '1', '-reset_timestamps', '1', homedir() + '/.hc/' + camDevId + '-%Y%m%dT%H%M%S%z.wav');
    }
    return options;
}

function execCmd(command: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args);
        let output = '';

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(`Command failed with exit code ${code}`);
            }
        });
    });
}

export async function checkWebcamExists(devId: string): Promise<boolean> {
    try {
        const lsOutput = await execCmd('ls', ['-al', '/dev/v4l/by-id/']);
        const matches = lsOutput.match(videoRegex);
        
        if(matches?.length == 0) return false;
        return matches!.includes(devId);
        
    } catch (error) {
        console.error('Error getting webcam lists:', error);
        return false;
    }
}

export async function getWebcamsLists() {
    try {
        const lsOutput = await execCmd('ls', ['-al', '/dev/v4l/by-id/']);
        const matches = lsOutput.match(videoRegex);

        return matches;

    } catch (error) {
        console.error('Error getting webcam lists:', error);
    }
}


export async function getWebcamInfo(devId: string) {
    const fullDevId = ''.concat('/dev/v4l/by-id/', devId);
    let obj = null;
    try {
        const v4l2Output = await execCmd('v4l2-ctl', ['--list-formats-ext', '--device', fullDevId]);
        obj = parseV4l2ctlOutput(v4l2Output);
        //console.log(obj);
    } catch (error) {
        console.error(`Error getting webcam info for ${devId}:`, error);
    }
    return obj
}

export async function getAudioLists() {
    try {
        const arecordOutput = await execCmd('arecord', ['-L']);
        return parseAudioDevices(arecordOutput);
    } catch(error) {
        console.error(`Error getting audio info`, error);
        return [];
    }
}

export async function playWav(fileLoc: string) {
    try {
        const res = await execCmd('ffmpeg', ['-i', fileLoc, '-f', 'alsa', 'default']);
        return res;
    } catch(error) {
        console.error(`Voice Playback Error: ${error}`);
    }
}
type VideoFormat = {
    type: string;
    resolution: string;
    fps: string;
}

function parseAudioDevices(input: string) {
    const devices: { micDevId: string; name: string }[] = [];
  
    const lines = input.split('\n');
  
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
  
        if (line.startsWith('plughw:CARD=')) {
            const micDevId = line.split(' ')[0];
            const name = lines[i + 1].trim();
            devices.push({ micDevId, name });
        }
    }
    return devices;
}

export async function getRecordedVideoList() {
    const ls = (await execCmd('ls', [homedir() + '/.hc/'])).trim();
    const lines = ls.split('\n');
    return lines;
}

function parseV4l2ctlOutput(input: string) {
    const lines = input.split('\n');
    const result = new Set<VideoFormat>();
    let currentFormat = '';
    let seenCombinations = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('[')) {
            const formatMatch = line.match(/'([^']+)'/);
            if (formatMatch) {
                currentFormat = formatMatch[1];
            }
        }

        if (line.startsWith('Size:')) {
            const sizeMatch = line.match(/\b(\d+x\d+)\b/);
            let resolution = sizeMatch ? sizeMatch[1] : '';

            let j = i + 1;
            while (j < lines.length && lines[j].includes('Interval:')) {
                const intervalMatch = lines[j].trim().match(/\(([\d.]+) fps\)/);
                let fps = intervalMatch ? intervalMatch[1] : '';
                const formatDetails: VideoFormat = { type: currentFormat, resolution: resolution, fps: fps };

                const uniqueId = `${currentFormat}-${resolution}-${fps}`;
                if (!seenCombinations.has(uniqueId)) {
                    seenCombinations.add(uniqueId);
                    result.add(formatDetails);
                }
                j++;
            }
        }
    }

    return Array.from(result);
}


