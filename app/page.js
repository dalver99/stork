'use client'
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="">
      <div className=" p-8">
        {status === "loading" ? (
          <p className="">Loading...</p>
        ) : session ? (
          <>
            <p className="mb-4 text-lg">no.{session.user.id}</p>
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
