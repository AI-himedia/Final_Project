package com.aix.againhello.call;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
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

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

public class ClovaSpeechClient {

    // Clova Speech secret key
    private static final String SECRET = "8d0a301d5bd74d56962a5d60cca8bd7b";
    // Clova Speech invoke URL
    private static final String INVOKE_URL = "https://clovaspeech-gw.ncloud.com/external/v1/10958/de48a511bb7758f55ce82456a2e8602e0f49afae3779ac31e894fc7af4f5bdf1";

    private CloseableHttpClient httpClient = HttpClients.createDefault();
    private Gson gson = new Gson();

    private static final Header[] HEADERS = new Header[] {
            new BasicHeader("Accept", "application/json"),
            new BasicHeader("X-CLOVASPEECH-API-KEY", SECRET),
    };

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
        private Integer speakerCountMin;
        private Integer speakerCountMax;

        public Boolean getEnable() {
            return enable;
        }

        public void setEnable(Boolean enable) {
            this.enable = enable;
        }

        public Integer getSpeakerCountMin() {
            return speakerCountMin;
        }

        public void setSpeakerCountMin(Integer speakerCountMin) {
            this.speakerCountMin = speakerCountMin;
        }

        public Integer getSpeakerCountMax() {
            return speakerCountMax;
        }

        public void setSpeakerCountMax(Integer speakerCountMax) {
            this.speakerCountMax = speakerCountMax;
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
        HttpPost httpPost = new HttpPost(INVOKE_URL + "/recognizer/url");
        httpPost.setHeaders(HEADERS);
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
        HttpPost httpPost = new HttpPost(INVOKE_URL + "/recognizer/object-storage");
        httpPost.setHeaders(HEADERS);
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
        HttpPost httpPost = new HttpPost(INVOKE_URL + "/recognizer/upload");
        httpPost.setHeaders(HEADERS);
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
    public void extractSpeakerSegmentsIndividually(String responseJson, File audioFile, Path baseOutputDir) throws Exception {
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
            System.out.println("세그먼트 데이터를 찾을 수 없습니다.");
            return;
        }

        JsonArray segments = responseData.getAsJsonArray("segments");
        if (segments.size() == 0) {
            System.out.println("세그먼트가 없습니다.");
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

    public static void main(String[] args) {
        try {
            // 입력 폴더 경로
            String inputFolder = "/Users/jin/final_project/Final_Project/Final_Project/springboot/src/main/java/com/aix/againhello/call/input";
            File folder = new File(inputFolder);

            // 출력 기본 디렉토리
            Path baseOutputDir = Paths.get("/Users/jin/final_project/Final_Project/Final_Project/springboot/src/main/java/com/aix/againhello/call/output");
            Files.createDirectories(baseOutputDir);

            // 지원되는 미디어 파일 목록 가져오기
            File[] mediaFiles = folder.listFiles(file ->
                    file.isFile() && isSupportedMediaFile(file)
            );

            if (mediaFiles == null || mediaFiles.length == 0) {
                System.out.println("지원되는 미디어 파일을 찾을 수 없습니다.");
                return;
            }

            // API 클라이언트 초기화
            final ClovaSpeechClient clovaSpeechClient = new ClovaSpeechClient();

            // 모든 미디어 파일 처리
            for (File mediaFile : mediaFiles) {
                System.out.println("처리 중: " + mediaFile.getName());

                // 요청 객체 설정
                NestRequestEntity requestEntity = new NestRequestEntity();

                // 화자 분리 활성화
                Diarization diarization = new Diarization();
                diarization.setEnable(Boolean.TRUE);
                requestEntity.setDiarization(diarization);

                // 음성 인식 및 화자 분리 요청
                System.out.println("음성 파일 업로드 및 화자 분리 요청 중...");
                final String result = clovaSpeechClient.upload(mediaFile, requestEntity);

                // 응답 확인 및 처리
                if (result != null && !result.isEmpty()) {
                    try {
                        // JSON 파싱 테스트
                        JsonObject jsonResponse = JsonParser.parseString(result).getAsJsonObject();

                        System.out.println("API 요청 성공! 화자별 개별 세그먼트 추출 중...");
                        clovaSpeechClient.extractSpeakerSegmentsIndividually(result, mediaFile, baseOutputDir);
                        System.out.println(mediaFile.getName() + " 처리 완료!");
                    } catch (Exception e) {
                        System.out.println("응답 처리 중 오류 발생: " + e.getMessage());
                        System.out.println("응답 텍스트: " + result);
                    }
                } else {
                    System.out.println("API 요청 실패!");
                    System.out.println("API URL과 키가 올바르게 설정되었는지 확인하세요.");
                }
            }

            System.out.println("모든 파일 처리 완료!");

        } catch (Exception e) {
            System.out.println("오류 발생: " + e.getMessage());
            e.printStackTrace();
        }
    }
}