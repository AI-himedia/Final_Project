package com.aix.againhello.call;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.github.cdimascio.dotenv.Dotenv;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicHeader;
import org.apache.http.util.EntityUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class CallService {

    Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

    AwsBasicCredentials credentials = AwsBasicCredentials.create(
            dotenv.get("AWS_ACCESS_KEY_ID"),
            dotenv.get("AWS_SECRET_ACCESS_KEY")
    );

    String clovaSpeechSecret = dotenv.get("CLOVA_SPEECH_SECRET");
    String clovaSpeechInvokeUrl = dotenv.get("CLOVA_SPEECH_INVOKE-URL");

    private final S3Client s3Client;

    private String bucketName = "ai-himedia";

    // S3 출력 경로 설정
    private static final String S3_OUTPUT_PREFIX = "call/output/";
    private static final String S3_OUTPUT_TEMP = S3_OUTPUT_PREFIX + "temp/"; // 세그먼트 파일 저장 경로
    private static final String S3_OUTPUT_LONG = S3_OUTPUT_PREFIX + "long/"; // 가장 긴 세그먼트 파일 저장 경로
    private static final String S3_OUTPUT_COMBINED = S3_OUTPUT_PREFIX + "combined/"; // 추후 사용 예정

    private CloseableHttpClient httpClient = HttpClients.createDefault();
    private Gson gson = new Gson();
    private final ExecutorService executorService = Executors.newFixedThreadPool(5);

    // 지원되는 파일 확장자 목록
    // 음성
    private static final List<String> SUPPORTED_AUDIO_EXTENSIONS = Arrays.asList(
            ".mp3", ".aac", ".ac3", ".ogg", ".flac", ".wav", ".m4a"
    );

    // 영상
    private static final List<String> SUPPORTED_VIDEO_EXTENSIONS = Arrays.asList(
            ".avi", ".mp4", ".mov", ".wmv", ".flv", ".mkv"
    );

    public CallService() {
        // S3 클라이언트 초기화
        s3Client = S3Client.builder()
                .region(Region.of(dotenv.get("AWS_REGION", "ap-northeast-2")))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }

    private Header[] getHeaders() {
        return new Header[] {
                new BasicHeader("Accept", "application/json"),
                new BasicHeader("X-CLOVASPEECH-API-KEY", clovaSpeechSecret),
        };
    }

    /**
     * 클라이언트에서 업로드한 파일들을 처리
     * @param files 업로드된 파일 목록 (최대 3개)
     * @param language 언어 설정 (기본값: ko-KR)
     * @param speakerCountMin 최소 화자 수
     * @param speakerCountMax 최대 화자 수
     * @return 처리 결과 맵
     */
    public Map<String, Object> processFiles(List<MultipartFile> files, String language,
                                            Integer speakerCountMin, Integer speakerCountMax) throws Exception {
        // 결과를 저장할 맵
        Map<String, Object> results = new HashMap<>();
        List<Map<String, Object>> fileResults = new ArrayList<>();

        // 임시 디렉토리 생성
        Path tempDir = Files.createTempDirectory("upload-media-temp");

        try {
            // 비동기 처리를 위한 CompletableFuture 리스트
            List<CompletableFuture<Map<String, Object>>> futures = new ArrayList<>();

            // 각 파일에 대한 처리
            for (MultipartFile file : files) {
                if (!isSupportedMediaFile(file.getOriginalFilename())) {
                    Map<String, Object> errorResult = new HashMap<>();
                    errorResult.put("fileName", file.getOriginalFilename());
                    errorResult.put("error", "지원되지 않는 파일 형식입니다.");
                    fileResults.add(errorResult);
                    continue;
                }

                // 비동기 처리
                CompletableFuture<Map<String, Object>> future = CompletableFuture.supplyAsync(() -> {
                    try {
                        return processFile(file, language, speakerCountMin, speakerCountMax, tempDir);
                    } catch (Exception e) {
                        Map<String, Object> errorResult = new HashMap<>();
                        errorResult.put("fileName", file.getOriginalFilename());
                        errorResult.put("error", "파일 처리 중 오류: " + e.getMessage());
                        return errorResult;
                    }
                }, executorService);

                futures.add(future);
            }

            // 모든 처리 결과 수집
            for (CompletableFuture<Map<String, Object>> future : futures) {
                fileResults.add(future.get());
            }

        } finally {
            // 임시 디렉토리 정리
            cleanupTempDirectory(tempDir);
        }

        results.put("files", fileResults);
        results.put("totalFiles", fileResults.size());
        return results;
    }

    /**
     * 단일 파일 처리
     */
    private Map<String, Object> processFile(MultipartFile file, String language,
                                            Integer speakerCountMin, Integer speakerCountMax,
                                            Path tempDir) throws Exception {
        Map<String, Object> result = new HashMap<>();
        result.put("fileName", file.getOriginalFilename());

        // 임시 파일 생성
        File tempFile = saveMultipartToTempFile(file, tempDir);

        try {
            // 요청 객체 설정
            NestRequestEntity requestEntity = new NestRequestEntity();
            requestEntity.setLanguage(language);

            // 화자 분리 활성화
            Diarization diarization = new Diarization();
            diarization.setEnable(Boolean.TRUE);

            if (speakerCountMin != null) {
                diarization.setSpeakerCountMin(speakerCountMin);
            }
            if (speakerCountMax != null) {
                diarization.setSpeakerCountMax(speakerCountMax);
            }

            requestEntity.setDiarization(diarization);

            // API 호출
            final String apiResponse = upload(tempFile, requestEntity);

            // JSON 파싱 테스트
            JsonObject jsonResponse = JsonParser.parseString(apiResponse).getAsJsonObject();

            // 화자 세그먼트 추출 및 S3 업로드
            Map<String, Object> segmentResults = extractSpeakerSegmentsAndUploadToS3(
                    apiResponse, tempFile, tempDir);

            // 결과 저장
            result.put("status", "success");
            result.put("segments", segmentResults);

            // 인식된 텍스트 추가 (있는 경우)
            if (jsonResponse.has("text")) {
                result.put("fullText", jsonResponse.get("text").getAsString());
            }

            return result;
        } catch (Exception e) {
            result.put("status", "error");
            result.put("error", e.getMessage());
            return result;
        } finally {
            // 임시 파일 삭제
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    /**
     * MultipartFile을 임시 파일로 저장
     */
    private File saveMultipartToTempFile(MultipartFile file, Path tempDir) throws IOException {
        Path tempFile = tempDir.resolve(file.getOriginalFilename());
        Files.copy(file.getInputStream(), tempFile, StandardCopyOption.REPLACE_EXISTING);
        return tempFile.toFile();
    }

    /**
     * 임시 디렉토리 정리
     */
    private void cleanupTempDirectory(Path tempDir) {
        try {
            Files.walk(tempDir)
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
        } catch (IOException e) {
            System.err.println("임시 디렉토리 정리 중 오류: " + e.getMessage());
        }
    }

    /**
     * 파일이 지원되는 오디오/비디오 형식인지 확인
     */
    public boolean isSupportedMediaFile(String fileName) {
        if (fileName == null) return false;

        fileName = fileName.toLowerCase();
        String extension = fileName.substring(fileName.lastIndexOf('.'));

        return SUPPORTED_AUDIO_EXTENSIONS.contains(extension) ||
                SUPPORTED_VIDEO_EXTENSIONS.contains(extension);
    }

    /**
     * Clova Speech API를 호출하여 음성인식 수행
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
     * 화자별로 오디오 세그먼트를 추출하고 S3에 업로드하는 메소드
     */
    public Map<String, Object> extractSpeakerSegmentsAndUploadToS3(String responseJson, File audioFile, Path tempDir) throws Exception {
        Map<String, Object> results = new HashMap<>();
        List<Map<String, Object>> segmentList = new ArrayList<>();
        Map<String, List<String>> speakerFiles = new HashMap<>();

        // 출력 디렉토리 생성 (로컬 임시 저장소)
        String fileName = audioFile.getName().replaceFirst("[.][^.]+$", "");
        Path outputDir = tempDir.resolve(fileName);
        Files.createDirectories(outputDir);

        // 가장 긴 세그먼트를 위한 디렉토리 생성
        Path longOutputDir = tempDir.resolve("long");
        Files.createDirectories(longOutputDir);

        // 원본 파일 이름 (확장자 제외)
        String fileNameWithoutExt = audioFile.getName().replaceFirst("[.][^.]+$", "");

        // JSON 응답 파싱
        JsonObject responseData = JsonParser.parseString(responseJson).getAsJsonObject();

        // 세그먼트 데이터 가져오기
        if (!responseData.has("segments")) {
            results.put("error", "세그먼트 데이터를 찾을 수 없습니다.");
            return results;
        }

        JsonArray segments = responseData.getAsJsonArray("segments");
        if (segments.size() == 0) {
            results.put("error", "세그먼트가 없습니다.");
            return results;
        }

        // 화자별 세그먼트 맵 (가장 긴 세그먼트 찾기 위함)
        Map<String, List<AudioSegment>> speakerSegments = new HashMap<>();
        Map<String, String> speakerInfo = new HashMap<>();

        // 각 세그먼트를 개별적으로 처리하여 저장
        for (int i = 0; i < segments.size(); i++) {
            JsonObject segment = segments.get(i).getAsJsonObject();

            // speaker 정보 추출
            String speakerKey;
            String speakerName;
            if (segment.has("speaker") && segment.get("speaker").isJsonObject()) {
                JsonObject speaker = segment.getAsJsonObject("speaker");
                String speakerId = speaker.has("label") ? speaker.get("label").getAsString() : "unknown";
                speakerName = speaker.has("name") ? speaker.get("name").getAsString() : "Speaker_" + speakerId;
                speakerKey = speakerId + "_" + speakerName;
            } else {
                // speaker가 문자열이거나 다른 형태인 경우
                speakerKey = segment.has("speaker") ? segment.get("speaker").getAsString() : "unknown";
                speakerName = "Speaker_" + speakerKey;
            }

            // 화자 정보 저장
            speakerInfo.put(speakerKey, speakerName);

            // 시간 정보 추출
            int startTime = segment.has("start") ?
                    (int)(Float.parseFloat(segment.get("start").getAsString()) * 1000) : 0;
            int endTime = segment.has("end") ?
                    (int)(Float.parseFloat(segment.get("end").getAsString()) * 1000) : 0;

            // 텍스트 내용 추출 (있는 경우)
            String text = segment.has("text") ? segment.get("text").getAsString() : "";

            // 세그먼트 객체 생성
            AudioSegment segmentAudio = new AudioSegment(audioFile, startTime, endTime);

            // 로컬 임시 파일명
            String outputFileName = String.format("%s_speaker_%s_%03d_.wav", fileNameWithoutExt, speakerKey, i);
            File outputFile = outputDir.resolve(outputFileName).toFile();

            // 오디오 세그먼트 저장 (로컬)
            segmentAudio.exportToWav(outputFile.getAbsolutePath());

            // S3에 업로드 - temp 폴더에 저장
            String s3Key = S3_OUTPUT_TEMP + outputFileName;
            uploadFileToS3(outputFile, s3Key);

            // 세그먼트 정보 저장
            Map<String, Object> segmentInfo = new HashMap<>();
            segmentInfo.put("segmentId", i);
            segmentInfo.put("speaker", speakerKey);
            segmentInfo.put("speakerName", speakerName);
            segmentInfo.put("start", startTime / 1000.0);
            segmentInfo.put("end", endTime / 1000.0);
            segmentInfo.put("duration", (endTime - startTime) / 1000.0);
            segmentInfo.put("text", text);
            segmentInfo.put("s3Url", s3Key);

            segmentList.add(segmentInfo);

            // 화자별 파일 리스트에 추가
            if (!speakerFiles.containsKey(speakerKey)) {
                speakerFiles.put(speakerKey, new ArrayList<>());
            }
            speakerFiles.get(speakerKey).add(s3Key);

            // 로컬 임시 파일 삭제
            outputFile.delete();

            // 화자별 세그먼트 목록에 추가
            if (!speakerSegments.containsKey(speakerKey)) {
                speakerSegments.put(speakerKey, new ArrayList<>());
            }
            speakerSegments.get(speakerKey).add(segmentAudio);
        }

        // 각 화자별로 가장 긴 세그먼트 찾아서 저장
        Map<String, String> longestSegments = new HashMap<>();
        for (Map.Entry<String, List<AudioSegment>> entry : speakerSegments.entrySet()) {
            String speakerKey = entry.getKey();
            List<AudioSegment> segmentsList = entry.getValue();

            // 가장 긴 세그먼트 찾기
            AudioSegment longestSegment = segmentsList.stream()
                    .max(Comparator.comparing(AudioSegment::getDuration))
                    .orElse(null);

            if (longestSegment != null) {
                // 로컬 임시 파일명
                String outputFileName = String.format("%s_speaker_%s_longest.wav", fileNameWithoutExt, speakerKey);
                File outputFile = longOutputDir.resolve(outputFileName).toFile();

                // 가장 긴 세그먼트 저장
                longestSegment.exportToWav(outputFile.getAbsolutePath());

                // S3에 업로드 - long 폴더에 저장
                String s3Key = S3_OUTPUT_LONG + outputFileName;
                uploadFileToS3(outputFile, s3Key);

                // 가장 긴 세그먼트 정보 저장
                longestSegments.put(speakerKey, s3Key);

                // 로컬 임시 파일 삭제
                outputFile.delete();
            }
        }

        // 결과 구성
        results.put("segments", segmentList);
        results.put("speakers", speakerInfo);
        results.put("speakerFiles", speakerFiles);
        results.put("longestSegments", longestSegments);

        return results;
    }

    /**
     * 파일을 S3에 업로드
     */
    public void uploadFileToS3(File file, String s3Key) {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType("audio/wav")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromFile(file));
        } catch (Exception e) {
            throw new RuntimeException("S3 업로드 실패: " + e.getMessage(), e);
        }
    }

    // 내부 클래스들 정의
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
}