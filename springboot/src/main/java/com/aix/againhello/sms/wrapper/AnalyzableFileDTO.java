package com.aix.againhello.sms.wrapper;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzableFileDTO {
    private String fileUrl;                  // 업로드된 S3 URL
    private String presignedUrl;             // 이미지일 경우만
    private DeceasedHintDTO deceasedHint;    // 이 파일에 해당하는 고인 힌트
}
