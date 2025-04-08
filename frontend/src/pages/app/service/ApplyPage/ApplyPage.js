import './ApplyPage.mobile.css';

export default function ApplyPage() {
  return (
    <div className="ApplyPage_Container_app">
      <div className="ApplyPage_Title">
        <h2>
          고인과 통화로 안부를
          <br />
          전할 수 있는 "다시, 안녕"
        </h2>
      </div>

      <div className="ApplyPage_Banner">
        <img
          src="/assets/call.jpg"
          alt="플레이스토어"
          className="SideMenu_CustomIcon"
        />
      </div>

      <button className="ApplyPage_Button">시작하기</button>
    </div>
  );
}
