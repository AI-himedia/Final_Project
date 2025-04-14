package com.aix.againhello.sms;

import com.aix.againhello.common.DeceasedDataDTO;
import com.aix.againhello.sms.wrapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@RestController
@RequestMapping("/be/sms")
public class SmsController {

    @Autowired
    private SmsService smsService;

    /**문자서비스 신청*/
    @PostMapping("/service/start")
    public ResponseEntity<?> startSubscription(
            @RequestParam("subscriptionCode") int subscriptionCode,
            @RequestPart("deceasedData") DeceasedDataDTO deceasedDataDTO,
            @RequestPart(value = "chatFile", required = false) List<MultipartFile> chatFile
    ) {

        SmsResponse result = smsService.startService(subscriptionCode, deceasedDataDTO, chatFile);
//        // 1. rawfile
//        System.out.printf(String.valueOf(deceasedDataDTO));
//        System.out.printf("--------------------------------------");
//        System.out.printf("%s\n", chatData.getOriginalFilename());
//
//        // 프로필 이미지 서버 실물 경로에 저장(db에 들어갈 이미지 경로 setting)
//        // S3 로 바꾸면 코드 완전히 바꿔야함(캡슐화 해서 쓰면 좋을듯)
//        // 배포시점과 서버 변경시점에 backUrl 만 변경해주면 된다.(이미 db에 저장된 데이터는 backUrl 경로만 update)
//        String savePath = "C:/againhello/data/text/";
//        File fileDir = new File(savePath);
//        if(!fileDir.exists()){
//            fileDir.mkdirs();
//        }
//
//        String originalFileName = chatData.getOriginalFilename();
//        String ext = originalFileName.substring(originalFileName.lastIndexOf("."));
//        String savedName = UUID.randomUUID().toString().replace("-", "") + ext;
//        String filePath = savePath + savedName;
//        String filePathOnDB = ServerUrlConstants.SPRING_URL + "images/text/" + savedName;
//
//        try {
//            chatData.transferTo(new File(filePath));
//            System.out.println("파일 저장 성공");
//        } catch (IOException e) {
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("대화록 업로드 실패");
//        }
//        int dbResult = smsService.getPromptFromLLM(deceasedDataDTO, filePath);

        return ResponseEntity.ok(result);
    }

    /**문자서비스 실행시*/
    @GetMapping("/init-check")
    public ResponseEntity<SmsInitResponse> initCheck() {

        // 1. 문자서비스 미신청인 경우
        // 2. 서비스 신청은 했지만 아직 고인에 대한 데이터 없는 경우
        // 3. 서비스 신청, 고인 데이터 기록 모두 있는 경우
        
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
    public ResponseEntity<SmsResponse> chatWithAi(@RequestBody ChatRequestDTO requestDto) {

        SmsResponse response = smsService.sendUserInputToPython(requestDto);

        return ResponseEntity.ok(response);
    }

}





