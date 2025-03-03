import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req) {
  try {
    const { kakao_id, access_token } = await req.json();

    const existingUser = await query('SELECT * FROM users WHERE Kakao_ID = ?', [kakao_id]);

    if (existingUser.length === 0) {
      throw new Error(`User Not Exist`);
    }

    // 카카오 API를 통해 권한 확인 (선택적)
    const kakaoResponse = await fetch('https://kapi.kakao.com/v2/user/scopes', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!kakaoResponse.ok) {
      throw new Error(`Kakao API error: ${kakaoResponse.status}`);
    }

    const kakaoData = await kakaoResponse.json();
    const hasTalkMessagePermission = kakaoData.scopes.some(scope => scope.id === 'talk_message' && scope.agreed);

    if (!hasTalkMessagePermission) {
      return NextResponse.json({ error: 'Talk message permission not granted' }, { status: 400 });
    }

    // DB 업데이트
    await query('UPDATE users SET Alarm_Consent = ? WHERE Kakao_ID = ?', [true, kakao_id]);

    return NextResponse.json({
      success: true,
      message: 'Permission updated successfully'
    });

  } catch (error) {
    console.error('Error updating kakao permission:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
