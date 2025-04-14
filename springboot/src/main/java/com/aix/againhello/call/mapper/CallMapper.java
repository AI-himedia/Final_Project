package com.aix.againhello.call.mapper;

import com.aix.againhello.common.DeceasedDataDTO;
import com.aix.againhello.common.RawFileDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CallMapper {

    void insertDeceasedData(DeceasedDataDTO deceasedData);
    void insertRawFile(RawFileDTO rawFile);
    int updateDeceasedData(DeceasedDataDTO deceasedDataDto);

}
