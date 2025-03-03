import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";

const handler = NextAuth({
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'talk_message'
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (account && account.access_token) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
      }

      if (token.accessToken) {
        try {
          const response = await fetch('https://kapi.kakao.com/v2/user/scopes', {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('Kakao API response:', data); // talk_message 동의 여부 확인

          if (data && Array.isArray(data.scopes)) {
            session.user.hasTalkMessagePermission = data.scopes.some(scope => scope.id === 'talk_message' && scope.agreed);
          } else {
            console.error('Unexpected response structure from Kakao API');
            session.user.hasTalkMessagePermission = false;
          }
        } catch (error) {
          console.error('Error fetching Kakao scopes:', error);
          session.user.hasTalkMessagePermission = false;
        }
      } else {
        console.warn('Access token not available');
        session.user.hasTalkMessagePermission = false;
      }

      return session;
    }

  },
});

export { handler as GET, handler as POST };
