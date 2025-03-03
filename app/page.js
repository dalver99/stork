'use client';
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session, status, update } = useSession();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleAlarmConsent = async () => {
    if (!confirm("카카오톡 알람을 허용할까요?")) {
      return;
    }

    if (window.Kakao && window.Kakao.Auth) { // Kakao SDK 확인
      setIsRequesting(true); // 요청 시작
      try {
        const result = await new Promise((resolve, reject) => {
          window.Kakao.Auth.login({
            scope: 'talk_message',
            success: (authObj) => resolve(authObj),
            fail: (err) => reject(err)
          });
        });

        console.log('Additional consent successful', result);

        // 서버에 DB 업데이트 요청
        const response = await fetch('/api/kakao-permission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kakao_id: session.user.id,
            access_token: result.access_token
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update permission in database');
        }

        const data = await response.json();

        if (data.success) {
          // 세션 업데이트
          await update({
            ...session,
            user: {
              ...session.user,
              hasTalkMessagePermission: true
            }
          });

          console.log('Permission updated successfully');
        } else {
          console.error('Failed to update permission:', data.error);
        }
      } catch (error) {
        console.error('Error in additional consent process:', error);
      } finally {
        setIsRequesting(false); // 요청 완료 후 상태 초기화
      }
    } else {
      console.error('Kakao SDK not loaded');
    }
  };

  return (
    <div className="">
      <div className="p-8">
        {status === "loading" ? (
          <p className="">Loading...</p>
        ) : session ? (
          <>
            <p className="mb-4 text-lg">no.{session.user.id}</p>
            <button
              onClick={() => console.log(session)}
              className="mb-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              세션 정보 확인
            </button>

            {!session.user.hasTalkMessagePermission && ( // 권한이 없는 경우에만 버튼 표시
              <button
                onClick={handleAlarmConsent}
                disabled={isRequesting} // 요청 중일 때 버튼 비활성화
                className={`w-full mb-4 ${isRequesting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
              >
                {isRequesting ? '요청 중...' : '카카오 메시지 권한 요청'}
              </button>
            )}

            <button
              onClick={() => signOut()}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              로그아웃
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn("kakao")}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            카카오 로그인
          </button>
        )}
      </div>
    </div>
  );
}
