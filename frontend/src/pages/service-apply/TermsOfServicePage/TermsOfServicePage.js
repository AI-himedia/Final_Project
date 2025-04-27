import { useState, useEffect } from 'react';
import Header from '../../../components/Header/variants/HeaderTerms';
import './TermsOfServicePage.mobile.css';

export default function TermsOfServicePage() {
  const [checkedItems, setCheckedItems] = useState({
    all: false,
    personal: false,
    deceased: false,
    copyright: false,
    relationship: false,
    payment: false,
    storage: false,
    marketing: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열기/닫기 상태
  const [modalContent, setModalContent] = useState(''); // 모달에 들어갈 내용

  // 필수 항목 5개 모두 동의했는지 여부
  const isTermsAgreed =
    checkedItems.personal &&
    checkedItems.deceased &&
    checkedItems.copyright &&
    checkedItems.relationship &&
    checkedItems.payment;

  useEffect(() => {
    // console.log('[DEBUG] ', isTermsAgreed);
  }, [isTermsAgreed]);

  // 체크박스 상태 토글 핸들러
  const handleToggle = (key) => {
    if (key === 'all') {
      const newState = !checkedItems.all;
      setCheckedItems({
        all: newState,
        personal: newState,
        deceased: newState,
        copyright: newState,
        relationship: newState,
        payment: newState,
        storage: newState,
        marketing: newState,
      });
    } else {
      const updated = { ...checkedItems, [key]: !checkedItems[key] };
      const allRequiredChecked =
        updated.personal &&
        updated.deceased &&
        updated.copyright &&
        updated.relationship &&
        updated.payment;
      setCheckedItems({
        ...updated,
        all: allRequiredChecked && updated.storage && updated.marketing,
      });
    }
  };

  // 모달 열기
  const openModal = (content) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent('');
  };

  return (
    <>
      {/* Header는 약관 동의 상태만 props로 전달 */}
      <Header isTermsAgreed={isTermsAgreed} />

      <div className="Terms_Container">
        <div className="Terms_Title">
          <h1 className="Terms_Heading">
            서비스 이용을 위한
            <br />
            동의 안내
          </h1>
          <p className="Terms_Description">
            “다시, 안녕” 서비스 이용에 꼭 필요한 사항입니다.
            <br />
            아래 약관을 확인 후 동의해 주세요.
          </p>
        </div>

        <ul className="Terms_CheckboxList">
          {[
            'all',
            'personal',
            'deceased',
            'copyright',
            'relationship',
            'payment',
            'storage',
            'marketing',
          ].map((key) => (
            <li
              key={key}
              className="Terms_CheckboxItem"
              onClick={() => handleToggle(key)}
            >
              <span
                className={`Terms_CheckboxLabel ${
                  key === 'all' ? 'Terms_CheckboxLabel__All' : ''
                }`}
              >
                {key === 'all' ? (
                  '전체 동의'
                ) : key === 'personal' ? (
                  <span
                    className="Terms_RequiredUnderline"
                    onClick={() =>
                      openModal(
                        <>
                          <h3>1. 개인정보 수집 및 이용 동의</h3>
                          <br />
                          <p>
                            <strong>1.1 수집 목적:</strong> 본 서비스는 원활한
                            서비스 제공, 사용자 식별, 문의 응대, 고지 사항 전달,
                            맞춤형 정보 제공, 서비스 개선 및 새로운 서비스 개발
                            등을 위해 사용자의 개인정보를 수집하고 이용합니다.
                            또한, 관련 법규 준수를 위해서도 개인정보 처리가
                            필요할 수 있습니다.
                          </p>
                          <br />
                          <p>
                            <strong>1.2 수집 항목:</strong> 서비스 이용 과정에서
                            수집될 수 있는 개인정보 항목은 다음과 같습니다.
                            (예시) 이름, 연락처 (전화번호, 이메일 주소), 주소,
                            생년월일, 서비스 이용 기록, 결제 정보, 기기 정보 (IP
                            주소, OS 정보, 브라우저 정보 등). 수집되는 정보는
                            서비스의 종류와 제공 방식에 따라 달라질 수 있으며,
                            민감 정보는 원칙적으로 수집하지 않습니다.
                          </p>
                          <br />
                          <p>
                            <strong>1.3 보유 및 이용 기간:</strong> 사용자의
                            개인정보는 서비스 이용 계약이 유지되는 동안 보유 및
                            이용됩니다. 회원 탈퇴 또는 서비스 이용 종료 시에는
                            관련 법규에 따라 일정 기간 보관 후 안전하게
                            파기됩니다. 단, 정보통신망 이용촉진 및 정보보호 등에
                            관한 법률 등 관련 법령에 특별한 규정이 있는 경우에는
                            해당 법령에 따라 보관될 수 있습니다.
                          </p>
                          <br />
                          <p>
                            <strong>1.4 동의 거부 권리 및 불이익:</strong>{' '}
                            사용자는 개인정보 수집 및 이용에 대한 동의를 거부할
                            권리가 있습니다. 다만, 필수 항목에 대한 동의를
                            거부하실 경우 서비스 이용이 제한될 수 있습니다. 선택
                            항목에 대한 동의를 거부하시더라도 서비스 이용에는
                            제한이 없으나, 해당 선택 서비스 또는 기능 이용에
                            어려움이 있을 수 있습니다.
                          </p>
                        </>
                      )
                    }
                  >
                    [필수] 개인정보 이용 동의
                  </span>
                ) : key === 'deceased' ? (
                  <span
                    className="Terms_RequiredUnderline"
                    onClick={() =>
                      openModal(
                        <>
                          <h3>2. 고인 데이터 활용 동의</h3>
                          <br />
                          <p>
                            <strong>2.1 고인 데이터의 중요성:</strong> 본
                            서비스는 고인의 생애와 관련된 다양한 데이터를
                            기반으로 추모 및 기억 공간을 제공하는 것을 주
                            목적으로 합니다. 따라서 고인의 사진, 영상, 메시지,
                            관계 정보 등은 서비스의 핵심적인 요소입니다.
                          </p>
                          <br />
                          <p>
                            <strong>2.2 활용 목적:</strong> 수집된 고인의
                            데이터는 추모 페이지 구성, 사용자 간의 공유 및 소통
                            지원, 고인의 삶을 기리는 다양한 콘텐츠 제작, 서비스
                            개선 및 관련 연구 등에 활용될 수 있습니다.
                          </p>
                          <br />
                          <p>
                            <strong>2.3 데이터 관리 및 보호:</strong> 고인의
                            데이터는 엄격한 보안 시스템 하에 안전하게 관리되며,
                            무단 접근, 유출, 변조, 훼손 등을 방지하기 위해
                            최선을 다하고 있습니다. 또한, 데이터 활용 시에는
                            고인의 존엄성을 훼손하지 않도록 신중하게 처리합니다.
                          </p>
                          <br />
                          <p>
                            <strong>2.4 동의의 효력:</strong> 본 항목에
                            동의함으로써 사용자는 서비스 제공 목적 범위 내에서
                            고인의 데이터를 활용하는 것에 동의하며, 이는 서비스
                            이용 기간 동안 유효합니다.
                          </p>
                        </>
                      )
                    }
                  >
                    [필수] 고인 데이터 활용 동의
                  </span>
                ) : key === 'copyright' ? (
                  <span
                    className="Terms_RequiredUnderline"
                    onClick={() =>
                      openModal(
                        <>
                          <h3>3. 고인 권리 사용 책임 동의</h3>
                          <br />
                          <p>
                            <strong>3.1 권리 존중 의무:</strong> 서비스 내에서
                            사용자가 업로드하거나 공유하는 고인의 사진, 영상,
                            음성, 저작물 등에 대한 모든 권리는 원칙적으로 해당
                            권리자에게 있습니다. 사용자는 이러한 권리를 존중하고
                            침해하지 않아야 합니다.
                          </p>
                          <br />
                          <p>
                            <strong>3.2 사용자의 책임:</strong> 사용자는
                            서비스에 고인의 자료를 업로드하거나 공유할 때, 해당
                            자료에 대한 적법한 권리를 가지고 있거나 필요한
                            동의를 얻었음을 보증해야 합니다. 만약 사용자가 권리
                            없이 자료를 사용하거나 공유하여 발생하는 법적 문제에
                            대한 모든 책임은 사용자에게 있습니다.
                          </p>
                          <br />
                          <p>
                            <strong>3.3 서비스 제공자의 면책:</strong> 서비스
                            제공자는 사용자가 업로드하거나 공유한 자료에 대한
                            권리 관계를 보증하지 않으며, 이로 인해 발생하는
                            어떠한 법적 책임도 지지 않습니다.
                          </p>
                          <br />
                          <p>
                            <strong>3.4 권리 침해 시 조치:</strong> 만약 서비스
                            내에서 권리 침해가 발생했다고 판단될 경우, 해당
                            자료는 사전 통지 없이 삭제될 수 있으며, 필요한 경우
                            법적 조치가 취해질 수 있습니다.
                          </p>
                        </>
                      )
                    }
                  >
                    [필수] 고인 권리 사용 책임 동의
                  </span>
                ) : key === 'relationship' ? (
                  <span
                    className="Terms_RequiredUnderline"
                    onClick={() =>
                      openModal(
                        <>
                          <h3>4. 고인과의 관계 확인</h3>
                          <br />
                          <p>
                            <strong>4.1 관계 확인의 중요성:</strong> 본 서비스는
                            고인과의 관계를 기반으로 다양한 기능을 제공하며,
                            서비스의 신뢰성과 안정성을 확보하기 위해 사용자-고인
                            간의 관계 확인 절차가 필요합니다.
                          </p>
                          <br />
                          <p>
                            <strong>4.2 확인 절차:</strong> 서비스 이용 과정에서
                            사용자는 고인과의 관계를 명확하게 밝히고, 필요한
                            경우 이를 증명할 수 있는 자료를 제출해야 할 수
                            있습니다. 제공된 정보는 관계 확인 목적으로만
                            사용되며, 안전하게 관리됩니다.
                          </p>
                          <br />
                          <p>
                            <strong>4.3 관계 정보의 정확성:</strong> 사용자는
                            고인과의 관계 정보를 사실에 기반하여 정확하게
                            제공해야 합니다. 허위 또는 부정확한 정보를 제공하여
                            발생하는 모든 문제에 대한 책임은 사용자에게
                            있습니다.
                          </p>
                          <br />
                          <p>
                            <strong>4.4 관계 확인의 효력:</strong> 사용자가
                            제공한 관계 정보는 서비스 이용 자격 확인 및 관련
                            기능 제공의 근거가 됩니다. 관계 확인 결과에 따라
                            서비스 이용이 제한될 수 있습니다.
                          </p>
                        </>
                      )
                    }
                  >
                    [필수] 고인과의 관계 확인
                  </span>
                ) : key === 'payment' ? (
                  <span
                    className="Terms_RequiredUnderline"
                    onClick={() =>
                      openModal(
                        <>
                          <h3>5. 유료 서비스 안내 동의</h3>
                          <br />
                          <p>
                            <strong>5.1 유료 서비스의 종류 및 내용:</strong> 본
                            서비스는 일부 기능을 유료로 제공할 수 있으며, 유료
                            서비스의 구체적인 내용, 이용 요금, 결제 방식 등은
                            해당 서비스 이용 안내 페이지에 상세하게 명시됩니다.
                          </p>
                          <br />
                          <p>
                            <strong>5.2 결제 의무:</strong> 유료 서비스를
                            이용하고자 하는 사용자는 서비스 이용 전에 해당
                            요금을 결제해야 하며, 결제 완료 후 유료 서비스를
                            이용할 수 있습니다. 결제와 관련된 모든 책임은
                            사용자에게 있습니다.
                          </p>
                          <br />
                          <p>
                            <strong>5.3 환불 정책:</strong> 유료 서비스의 환불
                            정책은 관련 법규 및 서비스 정책에 따라 결정되며, 각
                            서비스의 안내 페이지에 상세하게 안내됩니다.
                          </p>
                          <br />
                          <p>
                            <strong>5.4 서비스 변경 및 중단:</strong> 서비스
                            제공자는 유료 서비스의 내용, 요금, 제공 방식 등을
                            변경하거나 서비스를 일시적 또는 영구적으로 중단할 수
                            있습니다. 이 경우, 사전에 사용자에게 공지합니다.
                          </p>
                        </>
                      )
                    }
                  >
                    [필수] 유료 서비스 안내 동의
                  </span>
                ) : key === 'storage' ? (
                  '[선택] 고인 데이터 보관·연구 동의'
                ) : (
                  '[선택] 서비스 콘텐츠 수신 동의'
                )}
              </span>

              <div
                className={`Terms_CheckboxCircle ${
                  checkedItems[key] ? 'checked' : ''
                }`}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="ModalOverlay" onClick={closeModal}>
          <div className="ModalContent">
            <h3>약관 상세 설명</h3>
            <p>{modalContent}</p>
            <button onClick={closeModal}>닫기</button>
          </div>
        </div>
      )}
    </>
  );
}
