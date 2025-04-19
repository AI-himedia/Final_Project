package com.aix.againhello.call.service;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.beans.factory.annotation.Value;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicHeader;
import org.apache.http.util.EntityUtils;
import org.springframework.stereotype.Component;

import javax.sound.sampled.AudioFileFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.UnsupportedAudioFileException;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

// 오디오 세그먼트
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

@Component
public class ClovaSpeechClient {

    @Value("${clova.speech.secret}")
    private String clovaSpeechSecret;

    @Value("${clova.speech.invoke-url}")
    private String clovaSpeechInvokeUrl;

    private final CloseableHttpClient httpClient = HttpClients.createDefault();
    private final Gson gson = new Gson();

    private Header[] getHeaders() {
        return new Header[] {
                new BasicHeader("Accept", "application/json"),
                new BasicHeader("X-CLOVASPEECH-API-KEY", clovaSpeechSecret),
        };
    }

    // 지원되는 파일 확장자 목록
    // 음성
    private static final List<String> SUPPORTED_AUDIO_EXTENSIONS = Arrays.asList(
            ".mp3", ".aac", ".ac3", ".ogg", ".flac", ".wav", ".m4a"
    );

    // 영상
    private static final List<String> SUPPORTED_VIDEO_EXTENSIONS = Arrays.asList(
            ".avi", ".mp4", ".mov", ".wmv", ".flv", ".mkv"
    );

    public static class Boosting {
        private String words;

        public String getWords() {
            return words;
        }

        public void setWords(String words) {
            this.words = words;
        }
    }

    public static class Diarization {
        private Boolean enable = Boolean.FALSE;

        public Boolean getEnable() {
            return enable;
        }

        public void setEnable(Boolean enable) {
            this.enable = enable;
        }
    }

    public static class NestRequestEntity {
        private String language = "ko-KR";
        private String completion = "sync";
        private String callback;
        private Map<String, Object> userdata;
        private Boolean wordAlignment = Boolean.TRUE;
        private Boolean fullText = Boolean.TRUE;
        private List<Boosting> boostings;
        private String forbiddens;
        private Diarization diarization;

        public String getLanguage() {
            return language;
        }

        public void setLanguage(String language) {
            this.language = language;
        }

        public String getCompletion() {
            return completion;
        }

        public void setCompletion(String completion) {
            this.completion = completion;
        }

        public String getCallback() {
            return callback;
        }

        public Boolean getWordAlignment() {
            return wordAlignment;
        }

        public void setWordAlignment(Boolean wordAlignment) {
            this.wordAlignment = wordAlignment;
        }

        public Boolean getFullText() {
            return fullText;
        }

        public void setFullText(Boolean fullText) {
            this.fullText = fullText;
        }

        public void setCallback(String callback) {
            this.callback = callback;
        }

        public Map<String, Object> getUserdata() {
            return userdata;
        }

        public void setUserdata(Map<String, Object> userdata) {
            this.userdata = userdata;
        }

        public String getForbiddens() {
            return forbiddens;
        }

        public void setForbiddens(String forbiddens) {
            this.forbiddens = forbiddens;
        }

        public List<Boosting> getBoostings() {
            return boostings;
        }

        public void setBoostings(List<Boosting> boostings) {
            this.boostings = boostings;
        }

        public Diarization getDiarization() {
            return diarization;
        }

        public void setDiarization(Diarization diarization) {
            this.diarization = diarization;
        }
    }

     /**
     *      * recognize media using URL
     *      * @param url required, the media URL
     *      * @param nestRequestEntity optional
     * @return string
     */
    public String url(String url, NestRequestEntity nestRequestEntity) {
        HttpPost httpPost = new HttpPost(clovaSpeechInvokeUrl + "/recognizer/url");
        httpPost.setHeaders(getHeaders());
        Map<String, Object> body = new HashMap<>();
        body.put("url", url);
        body.put("language", nestRequestEntity.getLanguage());
        body.put("completion", nestRequestEntity.getCompletion());
        body.put("callback", nestRequestEntity.getCallback());
        body.put("userdata", nestRequestEntity.getUserdata());
        body.put("wordAlignment", nestRequestEntity.getWordAlignment());
        body.put("fullText", nestRequestEntity.getFullText());
        body.put("forbiddens", nestRequestEntity.getForbiddens());
        body.put("boostings", nestRequestEntity.getBoostings());
        body.put("diarization", nestRequestEntity.getDiarization());
        HttpEntity httpEntity = new StringEntity(gson.toJson(body), ContentType.APPLICATION_JSON);
        httpPost.setEntity(httpEntity);
        return execute(httpPost);
    }

    /**
     * recognize media using Object Storage
     * @param dataKey required, the Object Storage key
     * @param nestRequestEntity optional
     * @return string
     */
    public String objectStorage(String dataKey, NestRequestEntity nestRequestEntity) {
        HttpPost httpPost = new HttpPost(clovaSpeechInvokeUrl + "/recognizer/object-storage");
        httpPost.setHeaders(getHeaders());
        Map<String, Object> body = new HashMap<>();
        body.put("dataKey", dataKey);
        body.put("language", nestRequestEntity.getLanguage());
        body.put("completion", nestRequestEntity.getCompletion());
        body.put("callback", nestRequestEntity.getCallback());
        body.put("userdata", nestRequestEntity.getUserdata());
        body.put("wordAlignment", nestRequestEntity.getWordAlignment());
        body.put("fullText", nestRequestEntity.getFullText());
        body.put("forbiddens", nestRequestEntity.getForbiddens());
        body.put("boostings", nestRequestEntity.getBoostings());
        body.put("diarization", nestRequestEntity.getDiarization());
        StringEntity httpEntity = new StringEntity(gson.toJson(body), ContentType.APPLICATION_JSON);
        httpPost.setEntity(httpEntity);
        return execute(httpPost);
    }

    /**
     * recognize media using a file
     * @param file required, the media file
     * @param nestRequestEntity optional
     * @return string
     */
    public String upload(File file, NestRequestEntity nestRequestEntity) {
        HttpPost httpPost = new HttpPost(clovaSpeechInvokeUrl + "/recognizer/upload");
        httpPost.setHeaders(getHeaders());
        HttpEntity httpEntity = MultipartEntityBuilder.create()
                .addTextBody("params", gson.toJson(nestRequestEntity), ContentType.APPLICATION_JSON)
                .addBinaryBody("media", file, ContentType.MULTIPART_FORM_DATA, file.getName())
                .build();
        httpPost.setEntity(httpEntity);
        return execute(httpPost);
    }

    private String execute(HttpPost httpPost) {
        try (final CloseableHttpResponse httpResponse = httpClient.execute(httpPost)) {
            final HttpEntity entity = httpResponse.getEntity();
            return EntityUtils.toString(entity, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 파일이 지원되는 오디오/비디오 형식인지 확인
     * @param file 확인할 파일
     * @return 지원되면 true, 아니면 false
     */
    public static boolean isSupportedMediaFile(File file) {
        String fileName = file.getName().toLowerCase();
        String extension = fileName.substring(fileName.lastIndexOf('.'));

        return SUPPORTED_AUDIO_EXTENSIONS.contains(extension) ||
                SUPPORTED_VIDEO_EXTENSIONS.contains(extension);
    }

    /**
     * 화자별로 오디오 세그먼트를 추출하는 메소드
     *
     * @param responseJson API 응답 데이터 (JSON 문자열)
     * @param audioFile 오디오 파일
     * @param baseOutputDir 기본 출력 디렉토리
     * @throws Exception 파일 처리 오류
     */
    /**
     * 화자별로 오디오 세그먼트를 추출하는 메소드
     *
     * @param responseJson API 응답 데이터 (JSON 문자열)
     * @param audioFile 오디오 파일
     * @param baseOutputDir 기본 출력 디렉토리
     * @throws Exception 파일 처리 오류
     */
    public void extractSpeakerSegmentsIndividually(String responseJson, File audioFile, Path baseOutputDir) throws Exception {
        // 🔵 전체 응답 로그 출력
        System.out.println("🔵 Clova 응답 원문:");
        System.out.println(responseJson);

        // 출력 디렉토리 생성
        Path outputDir = baseOutputDir.resolve(audioFile.getName().replaceFirst("[.][^.]+$", ""));
        Files.createDirectories(outputDir);

        // 가장 긴 세그먼트를 위한 디렉토리 생성
        Path longOutputDir = baseOutputDir.resolve("long");
        Files.createDirectories(longOutputDir);

        // JSON 응답 파싱
        JsonObject responseData = JsonParser.parseString(responseJson).getAsJsonObject();

        // 세그먼트 데이터 가져오기
        if (!responseData.has("segments")) {
            System.out.println("🟡 segments 필드를 찾을 수 없습니다.");
            return;
        }

        JsonArray segments = responseData.getAsJsonArray("segments");
        System.out.println("🟢 segments 배열 크기: " + segments.size());

        if (segments.size() == 0) {
            System.out.println("🟠 segments 배열은 존재하지만, 항목이 0개입니다.");
            return;
        }

        // 화자별 세그먼트 맵 (가장 긴 세그먼트 찾기 위함)
        Map<String, List<AudioSegment>> speakerSegments = new HashMap<>();

        // 각 세그먼트를 개별적으로 처리하여 저장
        for (int i = 0; i < segments.size(); i++) {
            JsonObject segment = segments.get(i).getAsJsonObject();

            // speaker 정보 추출
            String speakerKey;
            if (segment.has("speaker") && segment.get("speaker").isJsonObject()) {
                JsonObject speaker = segment.getAsJsonObject("speaker");
                String speakerId = speaker.has("label") ? speaker.get("label").getAsString() : "unknown";
                String speakerName = speaker.has("name") ? speaker.get("name").getAsString() : "Speaker_" + speakerId;
                speakerKey = speakerId + "_" + speakerName;
            } else {
                // speaker가 문자열이거나 다른 형태인 경우
                speakerKey = segment.has("speaker") ? segment.get("speaker").getAsString() : "unknown";
            }

            // 시간 정보 추출
            int startTime = segment.has("start") ?
                    (int)(Float.parseFloat(segment.get("start").getAsString())) : 0;
            int endTime = segment.has("end") ?
                    (int)(Float.parseFloat(segment.get("end").getAsString())) : 0;

            // 텍스트 내용 추출 (있는 경우)
            String text = segment.has("text") ? segment.get("text").getAsString() : "";

            // 세그먼트 객체 생성
            AudioSegment segmentAudio = new AudioSegment(audioFile, startTime, endTime);

            // 파일명 생성 및 저장 - 인덱스 번호 추가하여 순서 유지
            String outputFile = outputDir.resolve(
                    String.format("speaker_%s_%03d_.wav", speakerKey, i)
            ).toString();

            // 오디오 세그먼트 저장
            segmentAudio.exportToWav(outputFile);

            // 화자별 세그먼트 목록에 추가
            if (!speakerSegments.containsKey(speakerKey)) {
                speakerSegments.put(speakerKey, new ArrayList<>());
            }
            speakerSegments.get(speakerKey).add(segmentAudio);
        }

        // 각 화자별로 가장 긴 세그먼트 찾아서 저장
        for (Map.Entry<String, List<AudioSegment>> entry : speakerSegments.entrySet()) {
            String speakerKey = entry.getKey();
            List<AudioSegment> segments_list = entry.getValue();

            // 가장 긴 세그먼트 찾기
            AudioSegment longestSegment = segments_list.stream()
                    .max(Comparator.comparing(AudioSegment::getDuration))
                    .orElse(null);

            if (longestSegment != null) {
                // 파일명 생성 - 파일명과 화자 정보를 포함
                String fileName = audioFile.getName().replaceFirst("[.][^.]+$", "");
                String outputFile = longOutputDir.resolve(
                        String.format("%s_speaker_%s_longest.wav", fileName, speakerKey)
                ).toString();

                // 가장 긴 세그먼트 저장
                longestSegment.exportToWav(outputFile);
            }
        }
    }


    public File combineAudioFiles(List<File> files) throws IOException, UnsupportedAudioFileException {
        // ByteArrayOutputStream 생성
        ByteArrayOutputStream bos = new ByteArrayOutputStream();

        // AudioInputStream을 사용하여 파일 연결
        for (File file : files) {
            AudioInputStream ais = AudioSystem.getAudioInputStream(file);
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = ais.read(buffer)) != -1) {
                bos.write(buffer, 0, bytesRead);
            }
            ais.close();
        }

        // 연결된 오디오 데이터를 ByteArrayInputStream으로 변환
        ByteArrayInputStream bis = new ByteArrayInputStream(bos.toByteArray());

        // 연결된 오디오 파일을 저장
        AudioInputStream concatenatedAis = new AudioInputStream(bis, AudioSystem.getAudioFileFormat(files.get(0)).getFormat(), bos.size());

        // 임시 파일 생성
        File tempFile = File.createTempFile("temp", ".wav");
        tempFile.deleteOnExit(); // 프로그램 종료 시 삭제

        AudioSystem.write(concatenatedAis, AudioFileFormat.Type.WAVE, tempFile);

        return tempFile;
    }

}