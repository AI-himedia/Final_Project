package com.aix.againhello.call;

import com.aix.againhello.common.DeceasedDataDTO;

public class ServiceRequestDTO {
    private int serviceCode;
    private boolean existingSmsUser;
    private boolean usingSameDeceased;
    private DeceasedDataDTO deceasedData;

    public int getServiceCode() {
        return serviceCode;
    }

    public void setServiceCode(int serviceCode) {
        this.serviceCode = serviceCode;
    }

    public boolean isExistingSmsUser() {
        return existingSmsUser;
    }

    public void setExistingSmsUser(boolean existingSmsUser) {
        this.existingSmsUser = existingSmsUser;
    }

    public boolean isUsingSameDeceased() {
        return usingSameDeceased;
    }

    public void setUsingSameDeceased(boolean usingSameDeceased) {
        this.usingSameDeceased = usingSameDeceased;
    }

    public DeceasedDataDTO getDeceasedData() {
        return deceasedData;
    }

    public void setDeceasedData(DeceasedDataDTO deceasedData) {
        this.deceasedData = deceasedData;
    }
}