// @returns {ReadableStream | number} - returns a HTTP Code in number when an error occures
import { ReadableOptions } from "stream";
import fs, {Stats} from "fs";

export function streamFile(path: string, options?: ReadableOptions): ReadableStream<Uint8Array>{
    const downloadStream = fs.createReadStream(path, options);
    
    return new ReadableStream({
        start(controller) {
            downloadStream.on("data", (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
            downloadStream.on("end", () => controller.close());
            downloadStream.on("error", (error: NodeJS.ErrnoException) => controller.error(error));
        },
        cancel() {
            downloadStream.destroy();
        },
    });
}