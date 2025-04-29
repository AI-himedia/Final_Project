import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import ReactMarkdown from 'react-markdown';
import { axiosInstance } from '../../api/AxiosInstance';
import styles from './AdminPage.module.css';

export default function AdminPage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axiosInstance.post(
        '/admin/query',
        { admin_query: prompt }
      );
      setResult(response.data);
    } catch (error) {
      setResult({
        error:
          'API 호출 실패: ' +
          (error.response?.data?.error || error.message),
      });
    } finally {
      setLoading(false);
    }
  };

  // 표 렌더링 (툴팁 없이 ...만)
  const renderTable = (data, columns) => {
    if (!Array.isArray(data) || data.length === 0) return <div>데이터 없음</div>;
    if (Array.isArray(columns) && Array.isArray(data[0])) {
      return (
        <table>
          <thead>
            <tr>
              {columns.map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {row.map((val, i) => {
                  const strVal = val === null || val === undefined
                    ? ''
                    : typeof val === 'object'
                      ? JSON.stringify(val)
                      : String(val);
                  return (
                    <td key={i}>
                      {strVal.length > 30
                        ? strVal.slice(0, 30) + '...'
                        : strVal}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    const header = columns && columns.length > 0 ? columns : Object.keys(data[0]);
    return (
      <table>
        <thead>
          <tr>
            {header.map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {header.map((key, i) => {
                const strVal = row[key] === null || row[key] === undefined
                  ? ''
                  : typeof row[key] === 'object'
                    ? JSON.stringify(row[key])
                    : String(row[key]);
                return (
                  <td key={i}>
                    {strVal.length > 30
                      ? strVal.slice(0, 30) + '...'
                      : strVal}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // 파스텔 감정별 색상 팔레트
  const emotionColorMap = {
    '긍정': '#b8e0fc',
    '매우 긍정': '#a2c7e5',
    '부정': '#ffc1c1',
    '매우 부정': '#ffb3b3',
    '중립': '#e0e0e0',
    '기타': '#d6c1ff'
  };
  // 파스텔 카테고리 팔레트 (그래프마다 다르게)
  const pastelPalette = [
    '#b8e0fc', '#b5ead7', '#ffdac1', '#e2f0cb', '#f3b0c3', '#d6c1ff', '#ffd6e0', '#ffe1a8'
  ];

  // Plotly 공통 스타일
  const plotlyLayoutCommon = {
    paper_bgcolor: 'rgba(255,255,255,0.96)',
    plot_bgcolor: 'rgba(255,255,255,0.96)',
    font: {
      family: "'Toss Product Sans', 'Pretendard', 'Noto Sans KR', sans-serif",
      color: '#222',
      size: 18,
    },
    margin: { l: 40, r: 20, t: 48, b: 40 },
    title: { font: { size: 22, color: '#1877c9', family: "'Toss Product Sans',sans-serif" } },
  };

  // 그래프 렌더링
  const renderGraph = (graphData) => {
    if (!graphData || !graphData.type) return <div>그래프 데이터 없음</div>;
    let plotProps = {};
    if (graphData.type === 'pie') {
      const labels = graphData.data.labels;
      const values = graphData.data.values;
      const isEmotion = labels.every(label => emotionColorMap[label]);
      const colors = isEmotion
        ? labels.map(label => emotionColorMap[label] || pastelPalette[0])
        : labels.map((_, i) => pastelPalette[i % pastelPalette.length]);
      plotProps = {
        data: [{
          type: 'pie',
          labels,
          values,
          hole: 0.4,
          textinfo: 'label+percent',
          textposition: 'inside',
          marker: { colors },
        }],
        layout: {
          ...plotlyLayoutCommon,
          width: 420,
          height: 420,
          title: graphData.layout?.title || 'Pie Chart',
          showlegend: false,
        },
        config: { displayModeBar: false },
      };
    } else if (graphData.type === 'bar') {
      const labels = graphData.data.x;
      const values = graphData.data.y;
      const isEmotion = labels.every(label => emotionColorMap[label]);
      const colors = isEmotion
        ? labels.map(label => emotionColorMap[label] || pastelPalette[0])
        : labels.map((_, i) => pastelPalette[i % pastelPalette.length]);
      plotProps = {
        data: [{
          type: 'bar',
          x: labels,
          y: values,
          marker: { color: colors },
        }],
        layout: {
          ...plotlyLayoutCommon,
          width: 600,
          height: 420,
          title: graphData.layout?.title || 'Bar Chart',
          xaxis: graphData.layout?.xaxis,
          yaxis: graphData.layout?.yaxis,
        },
        config: { displayModeBar: false },
      };
    } else if (graphData.type === 'line') {
      plotProps = {
        data: [{
          type: 'scatter',
          mode: 'lines+markers',
          x: graphData.data.x,
          y: graphData.data.y,
          line: { color: pastelPalette[0], width: 3 },
          marker: { color: pastelPalette[0], size: 8 },
        }],
        layout: {
          ...plotlyLayoutCommon,
          width: 600,
          height: 420,
          title: graphData.layout?.title || 'Line Chart',
          xaxis: graphData.layout?.xaxis,
          yaxis: graphData.layout?.yaxis,
        },
        config: { displayModeBar: false },
      };
    } else {
      return <pre>{JSON.stringify(graphData, null, 2)}</pre>;
    }
    return (
      <div className={styles['plotly-outer']}>
        <Plot {...plotProps} />
      </div>
    );
  };

  // 분석/요약 결과
  const renderAnalysis = (data) => {
    if (!Array.isArray(data)) return <div>분석 데이터 없음</div>;
    return (
      <div>
        {data.map((item, idx) => (
          <div key={idx} className={styles['ai-analysis-outer']}>
            {item.llm_response && (
              <div className={styles['ai-analysis-box']}>
                <b>AI 요약/분석:</b>
                <div>
                  <ReactMarkdown>{item.llm_response}</ReactMarkdown>
                </div>
              </div>
            )}
            {item.analysis_rows && item.analysis_rows.length > 0 && (
              <div className={styles['ai-analysis-box']}>
                <b>유사 대화:</b>
                <div className={styles['table-outer']}>
                  <div className={styles['table-box']}>
                    {renderTable(item.analysis_rows)}
                  </div>
                </div>
              </div>
            )}
            {item.stats && item.stats.length > 0 && (
              <div className={styles['ai-analysis-box']}>
                <b>통계 데이터:</b>
                <div className={styles['table-outer']}>
                  <div className={styles['table-box']}>
                    {renderTable(item.stats)}
                  </div>
                </div>
              </div>
            )}
            {item.usage_stats && item.usage_stats.length > 0 && (
              <div className={styles['ai-analysis-box']}>
                <b>사용 통계:</b>
                <div className={styles['table-outer']}>
                  <div className={styles['table-box']}>
                    {renderTable(item.usage_stats)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // 혼합 결과
  const renderMixed = (result) => {
    return (
      <div>
        {result.table_data && result.table_data.data && (
          <div>
            <div className={styles['section-title']}>표 데이터</div>
            <div className={styles['table-outer']}>
              <div className={styles['table-box']}>
                {renderTable(result.table_data.data, result.table_data.columns)}
              </div>
            </div>
          </div>
        )}
        {result.graph_data && ['pie','bar','line'].includes(result.graph_data.type) && (
          <div>
            <div className={styles['section-title']}>그래프</div>
            {renderGraph(result.graph_data)}
          </div>
        )}
        {result.graph_data && result.graph_data.type === 'table' && (
          <div>
            <div className={styles['section-title']}>표 데이터</div>
            <div className={styles['table-outer']}>
              <div className={styles['table-box']}>
                {renderTable(result.graph_data.data, result.graph_data.columns)}
              </div>
            </div>
          </div>
        )}
        {result.rag_data && (
          <div>
            <div className={styles['section-title']}>AI 분석/요약</div>
            {renderAnalysis(result.rag_data)}
          </div>
        )}
      </div>
    );
  };

  // 결과 렌더링
  const renderResult = () => {
    if (loading) return null;
    if (!result) return null;
    if (result.error) return <div style={{ color: 'red' }}>{result.error}</div>;

    if (result.type === 'table') {
      return (
        <>
          <div className={styles['section-title']}>표 데이터</div>
          <div className={styles['table-outer']}>
            <div className={styles['table-box']}>
              {renderTable(result.data, result.columns)}
            </div>
          </div>
        </>
      );
    }
    if (result.type === 'graph') {
      return (
        <>
          <div className={styles['section-title']}>그래프</div>
          {renderGraph(result.graph_data)}
        </>
      );
    }
    if (result.type === 'analysis') {
      return (
        <>
          <div className={styles['section-title']}>AI 분석/요약</div>
          {renderAnalysis(result.data)}
        </>
      );
    }
    if (result.type === 'mixed') {
      return renderMixed(result);
    }
    return <pre>{JSON.stringify(result, null, 2)}</pre>;
  };

  return (
    <div className={styles['prompt-container']}>
      <div className={styles['prompt-box']}>
        {loading && (
          <div className={`${styles['prompt-message']} ${styles['ai-message']} ${styles['typing-indicator']}`}>
            잠시만 기다려 주세요...
          </div>
        )}
        <div>{renderResult()}</div>
      </div>
      <div className={styles['prompt-input-wrapper']}>
        <textarea
          className={styles['prompt-input']}
          placeholder="프롬프트 입력"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        <button
          className={styles['send-button']}
          onClick={handleSubmit}
          disabled={loading}
        >
          전송
        </button>
      </div>
    </div>
  );
}
