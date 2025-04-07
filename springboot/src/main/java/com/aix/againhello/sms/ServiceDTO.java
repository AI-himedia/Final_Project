package com.aix.againhello.sms;

public class ServiceDTO {
    public int code;              // 서비스 고유 식별자
    public String serviceName;    // 서비스 이름 (예: SMS, 전화)

    public ServiceDTO() {
    }

    public ServiceDTO(int code, String serviceName) {
        this.code = code;
        this.serviceName = serviceName;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    @Override
    public String toString() {
        return "ServiceDTO{" +
                "code=" + code +
                ", serviceName='" + serviceName + '\'' +
                '}';
    }
}
