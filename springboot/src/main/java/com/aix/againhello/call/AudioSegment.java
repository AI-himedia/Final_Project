package com.aix.againhello.call;

import java.io.File;
import java.io.IOException;

class AudioSegment {
    private File inputFile;
    private int startTime; // 밀리초
    private int endTime; // 밀리초
    private int duration; // 밀리초

    public AudioSegment(File inputFile, int startTime, int endTime) {
        this.inputFile = inputFile;
        this.startTime = startTime;
        this.endTime = endTime;
        this.duration = endTime - startTime;
    }

    public int getDuration() {
        return duration;
    }

    // JavaSound API + FFmpeg을 사용하여 오디오 세그먼트 추출
    public void exportToWav(String outputFilePath) throws IOException, InterruptedException {
        // FFmpeg 명령어 구성
        String duration = String.format("%.3f", (endTime - startTime) / 1000.0);
        String startTimeStr = String.format("%.3f", startTime / 1000.0);

        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg",
                "-i", inputFile.getAbsolutePath(),
                "-ss", startTimeStr,
                "-t", duration,
                "-acodec", "pcm_s16le",
                "-ar", "16000",
                "-ac", "1",
                outputFilePath
        );

        Process process = pb.start();
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new IOException("FFmpeg process failed with exit code: " + exitCode);
        }
    }
}
