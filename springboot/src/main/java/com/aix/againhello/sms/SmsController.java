package com.aix.againhello.sms;

import com.aix.againhello.util.ServerUrlConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;


@RestController
@RequestMapping("/be")
public class SmsController {

    @Autowired
    private SmsService smsService;

    /**문자서비스 신청*/
    @PostMapping("/service/start")
    public ResponseEntity startSubscription(@RequestPart("deceasedData") DeceasedDataDTO deceasedDataDTO,
                                            @RequestPart(value = "chatData", required = true) MultipartFile chatData) {
        // 1. Authentication으로 유저의 정보 조회
        // 2. deceasedData service로 전달
        // 1. python으로 file 전달
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
        String filePath = savePath + "/" + savedName;
        String filePathOnDB = ServerUrlConstants.SPRING_URL + "/images/text/" + savedName;

        try {
            chatData.transferTo(new File(filePath));
            System.out.println("파일 저장 성공");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("대화록 업로드 실패");
        }

        int dbResult = smsService.getPromptFromLLM(deceasedDataDTO, filePathOnDB);

        return ResponseEntity.ok("오케이");  // 응답을 클라이언트로 반환합니다.
    }
}





