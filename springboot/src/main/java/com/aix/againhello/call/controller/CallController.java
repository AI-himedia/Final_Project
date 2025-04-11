package com.aix.againhello.call.controller;

import com.aix.againhello.call.dto.*;
import com.aix.againhello.call.service.AudioProcessingService;
import com.aix.againhello.call.service.CallService;
import com.aix.againhello.common.SubscriptionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/be/call")
@CrossOrigin
public class CallController {

    @Autowired
    private CallService callService;

    @Autowired
    private AudioProcessingService audioProcessingService;

    /**
     * 전화 서비스 신청
     */
    @PostMapping("/service/start")
    public ResponseEntity<?> startService(
            @RequestParam("userCode") int userCode,
            @RequestPart("serviceRequest") ServiceRequestDTO serviceRequestDto,
            @RequestPart(value = "audioFiles", required = false) List<MultipartFile> audioFiles) {

        SubscriptionDTO subscription = callService.startService(userCode, serviceRequestDto, audioFiles);
        return ResponseEntity.ok(subscription);
    }

    /**
     * 화자 분리
     */
    @PostMapping("/separate/speakers")
    public ResponseEntity<?> separateSpeakers() {
        try {
            PreviewResponseDTO response = audioProcessingService.separateSpeakers();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("화자 분리 처리 중 오류 발생: " + e.getMessage());
        }
    }

    /**
     * 오디오 파일 스트리밍(미리 듣기)
     */
    @GetMapping("/audio/{filename:.+}")
    public ResponseEntity<Resource> getAudio(@PathVariable String filename) {
        try {
            ResourceResponseDTO resourceResponse = audioProcessingService.getAudioResource(filename);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(resourceResponse.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resourceResponse.getFilename() + "\"")
                    .body(resourceResponse.getResource());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 선택된 화자 저장
     */
    @PostMapping("/save/selected-speakers")
    public ResponseEntity<?> saveSelectedSpeakers(@RequestBody SelectedSpeakersDTO request) {
        try {
            SaveResponseDTO response = audioProcessingService.saveSelectedSpeakers(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("화자 파일 저장 중 오류 발생: " + e.getMessage());
        }
    }
}