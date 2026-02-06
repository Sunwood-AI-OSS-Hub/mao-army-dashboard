import { getMonitorData } from '@/lib/team-monitor';

/**
 * チーム名のバリデーション（ホワイトリスト方式）
 */
function isValidTeamName(name: string): boolean {
  // アルファベット、数字、ハイフン、アンダースコアのみ許可
  const validPattern = /^[a-zA-Z0-9-_]+$/;
  // パストラバーサル防止
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    return false;
  }
  return validPattern.test(name) && name.length > 0 && name.length <= 100;
}

/**
 * SSE (Server-Sent Events) ストリーミングAPI
 * クライアントにリアルタイム更新をプッシュ
 */
export async function GET(request: Request) {
  const encoder = new TextEncoder();

  // URLパラメータを取得
  const url = new URL(request.url);
  const teamName = url.searchParams.get('team');

  // teamNameが指定されている場合はバリデーション
  if (teamName && !isValidTeamName(teamName)) {
    return new Response('Invalid team name', { status: 400 });
  }

  // ストリームを作成
  const stream = new ReadableStream({
    async start(controller) {
      let dataIntervalId: NodeJS.Timeout | null = null;
      let heartbeatIntervalId: NodeJS.Timeout | null = null;
      let lastDataHash = '';
      let isClosed = false;

      const sendEvent = (data: unknown) => {
        if (isClosed) return;
        const jsonData = JSON.stringify(data);
        const dataHash = jsonData; // 簡易ハッシュとしてJSON文字列を使用

        if (dataHash !== lastDataHash) {
          lastDataHash = dataHash;
          try {
            controller.enqueue(encoder.encode(`data: ${jsonData}\n\n`));
          } catch {
            // クライアント切断済みなどで controller が close 済みの場合がある
            isClosed = true;
          }
        }
      };

      const sendHeartbeat = () => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          isClosed = true;
        }
      };

      // 監視データを取得して送信
      const fetchAndSendData = async () => {
        try {
          const monitorData = await getMonitorData();

          // teamNameが指定されている場合はフィルタリング
          const filteredData = teamName
            ? monitorData.filter(d => d.config.name === teamName)
            : monitorData;

          sendEvent({
            type: 'update',
            timestamp: Date.now(),
            data: filteredData
          });
        } catch (error) {
          console.error('Error fetching monitor data:', error);
          sendEvent({
            type: 'error',
            timestamp: Date.now(),
            error: 'Failed to fetch monitor data'
          });
        }
      };

      try {
        // 初期データを送信
        await fetchAndSendData();

        // 3秒ごとに監視データを送信
        dataIntervalId = setInterval(async () => {
          await fetchAndSendData();
        }, 3000);

        // 5秒ごとにハートビートを送信（接続維持用）
        heartbeatIntervalId = setInterval(() => {
          sendHeartbeat();
        }, 5000);

        // リクエストがキャンセルされたらクリーンアップ
        request.signal.addEventListener('abort', () => {
          isClosed = true;
          if (dataIntervalId) {
            clearInterval(dataIntervalId);
          }
          if (heartbeatIntervalId) {
            clearInterval(heartbeatIntervalId);
          }
          try {
            controller.close();
          } catch {
            // no-op
          }
        });
      } catch (error) {
        console.error('Stream error:', error);
        isClosed = true;
        if (dataIntervalId) {
          clearInterval(dataIntervalId);
        }
        if (heartbeatIntervalId) {
          clearInterval(heartbeatIntervalId);
        }
        try {
          controller.close();
        } catch {
          // no-op
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no', // nginx用のバッファリング無効化
    },
  });
}
