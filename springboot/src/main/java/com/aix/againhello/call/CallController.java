package com.aix.againhello.call;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/be/call")
public class CallController {

    @Autowired
    private CallService callService;

    public void setCallService(CallService callService) {
        this.callService = callService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeSpeech(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "language", required = false, defaultValue = "ko-KR") String language,
            @RequestParam(value = "speakerCountMin", required = false) Integer speakerCountMin,
            @RequestParam(value = "speakerCountMax", required = false) Integer speakerCountMax) {

        if (files.size() > 3) {
            return ResponseEntity.badRequest().body("최대 3개의 파일만 업로드할 수 있습니다.");
        }

        try {
            Map<String, Object> results = callService.processFiles(files, language, speakerCountMin, speakerCountMax);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("파일 처리 중 오류 발생: " + e.getMessage());
        }
    }

}
