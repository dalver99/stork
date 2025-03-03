import { query } from "@/lib/db";
import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";

const handler = NextAuth({
  providers: [
    KakaoProvider({
      clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_KAKAO_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'talk_message'
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account && account.access_token) {
        try {
          const response = await fetch('https://kapi.kakao.com/v2/user/scopes', {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
            },
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();

          if (data && Array.isArray(data.scopes)) {
            user.hasTalkMessagePermission = data.scopes.some(scope => scope.id === 'talk_message' && scope.agreed);
          } else {
            user.hasTalkMessagePermission = false;
          }
        } catch (error) {
          user.hasTalkMessagePermission = false;
        }
      } else {
        user.hasTalkMessagePermission = false;
      }

      const Kakao_ID = user.id;
      const is_active = true;
      const Alarm_Consent = user.hasTalkMessagePermission;

      try { // 사용자가 존재하는지 확인
        const existingUser = await query('SELECT * FROM users WHERE Kakao_ID = ?', [Kakao_ID]);

        if (existingUser.length === 0) {  // 사용자가 존재하지 않으면 새로 추가
          const insertQuery = `
            INSERT INTO users (Kakao_ID, is_active, Alarm_Consent, Last_Login)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          `;
          await query(insertQuery, [Kakao_ID, is_active, Alarm_Consent]);
        } else {  // 사용자가 존재하면 정보 업데이트
          const updateQuery = `
            UPDATE users
            SET is_active = ?, Alarm_Consent = ?, Last_Login = CURRENT_TIMESTAMP
            WHERE Kakao_ID = ?
          `;
          await query(updateQuery, [is_active, Alarm_Consent, Kakao_ID]);
        }

        return true;
      } catch (error) {

        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (account && account.access_token) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id;
        token.hasTalkMessagePermission = user.hasTalkMessagePermission;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
      }
      session.user.hasTalkMessagePermission = token.hasTalkMessagePermission;
      session.accessToken = token.accessToken;
      return session;
    }
  },
});

export { handler as GET, handler as POST };
