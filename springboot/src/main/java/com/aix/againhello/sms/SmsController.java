package com.aix.againhello.sms;

import com.aix.againhello.common.DeceasedDataDTO;
import com.aix.againhello.sms.apiWrapper.ChatRequestDTO;
import com.aix.againhello.sms.apiWrapper.RecentContentsDTO;
import com.aix.againhello.sms.apiWrapper.SmsInitResponse;
import com.aix.againhello.util.ServerUrlConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/be/sms")
public class SmsController {

    @Autowired
    private SmsService smsService;

    /**문자서비스 신청*/
    @PostMapping("/service/start")
    public ResponseEntity startSubscription(@RequestPart("deceasedData") DeceasedDataDTO deceasedDataDTO,
                                            @RequestPart(value = "chatData", required = true) MultipartFile chatData) {
        // 1. Authentication으로 유저의 정보 조회
        // 2. raw file 로컬 저장소에 저장
        // 3. deceasedData, 저장소url service로 전달
        // 4. service에서 DB 저장
        // 5. python으로 file url 전달
        // 2. return 값 + deceasedData DB 저장
        System.out.printf(String.valueOf(deceasedDataDTO));
        System.out.printf("--------------------------------------");
        System.out.printf("%s\n", chatData.getOriginalFilename());

        // 프로필 이미지 서버 실물 경로에 저장(db에 들어갈 이미지 경로 setting)
        // S3 로 바꾸면 코드 완전히 바꿔야함(캡슐화 해서 쓰면 좋을듯)
        // 배포시점과 서버 변경시점에 backUrl 만 변경해주면 된다.(이미 db에 저장된 데이터는 backUrl 경로만 update)
        String savePath = "C:/againhello/data/text/";
        File fileDir = new File(savePath);
        if(!fileDir.exists()){
            fileDir.mkdirs();
        }

        String originalFileName = chatData.getOriginalFilename();
        String ext = originalFileName.substring(originalFileName.lastIndexOf("."));
        String savedName = UUID.randomUUID().toString().replace("-", "") + ext;
        String filePath = savePath + savedName;
        String filePathOnDB = ServerUrlConstants.SPRING_URL + "images/text/" + savedName;

        try {
            chatData.transferTo(new File(filePath));
            System.out.println("파일 저장 성공");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("대화록 업로드 실패");
        }
        int dbResult = smsService.getPromptFromLLM(deceasedDataDTO, filePath);

        return ResponseEntity.ok("오케이" + dbResult);
    }

    /**문자서비스 실행시*/
    @GetMapping("/init-check")
    public ResponseEntity<SmsInitResponse> initCheck() {
        // 1. 유저 정보 추출
        // 인증된 유저 정보 추출 (세션, JWT, 또는 헤더 기반)
//        String userEmail = request.getUserPrincipal().getName();

        // 인증 체크
//        if (userCode == null) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                    .body(new SmsInitResponse<>("UNAUTHORIZED", "로그인이 필요합니다.", null));
//        }
        // 유저 코드
        int userCode = 3;
        return ResponseEntity.ok(smsService.checkInit(userCode));
    }

    /**특정 채팅방 입장시*/
    @GetMapping("/recent-contents/{subscriptionCode}")
    public ResponseEntity<List<RecentContentsDTO>> getRecentContents(
            @PathVariable int subscriptionCode) {

        return ResponseEntity.ok(smsService.getRecentContents(subscriptionCode));
    }

    /**문자 입력시*/
    @PostMapping("/chat")
    public ResponseEntity<String> chatWithAi(@RequestBody ChatRequestDTO requestDto) {

        String response = smsService.sendUserInputToPython(requestDto);

        return ResponseEntity.ok(response);
    }




}





