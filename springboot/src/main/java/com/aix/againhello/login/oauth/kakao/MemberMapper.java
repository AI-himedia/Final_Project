package com.aix.againhello.oauth.kakao;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface MemberMapper {
    @Insert("INSERT INTO refresh_tokens (member_id, refresh_token) VALUES (#{memberId}, #{refreshToken})")
    void saveRefreshToken(@Param("memberId") Long memberId, @Param("refreshToken") String refreshToken);

    @Select("SELECT refresh_token FROM refresh_tokens WHERE member_id = #{memberId}")
    String getRefreshTokenByMemberId(@Param("memberId") Long memberId);
}
