package com.aix.againhello.call.mapper;

import com.aix.againhello.call.dto.CallDeceasedInfoDTO;
import com.aix.againhello.common.DeceasedDataDTO;
import com.aix.againhello.common.RawFileDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CallMapper {

    void insertDeceasedData(DeceasedDataDTO deceasedData);
    void insertRawFile(RawFileDTO rawFile);
    int updateDeceasedData(DeceasedDataDTO deceasedDataDto);
    List<CallDeceasedInfoDTO> findDeceasedListForCallServiceByUser(int userCode);
    List<CallDeceasedInfoDTO> findDeceasedListForCallStreamingServiceByUser(int userCode);
}
