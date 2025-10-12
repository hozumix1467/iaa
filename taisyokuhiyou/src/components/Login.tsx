import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <div className="flex items-center justify-center p-4">
      {user ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="プロフィール画像"
                className="w-8 h-8 rounded-full"
              />
            )}
            <span>{user.displayName}</span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
          >
            ログアウト
          </button>
        </div>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#ffffff"
              d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.447,1.722-1.504,3.18-2.945,4.181 c-1.441,1.001-3.172,1.585-5.045,1.585c-2.393,0-4.531-0.971-6.091-2.531c-1.56-1.56-2.531-3.698-2.531-6.091 c0-2.393,0.971-4.531,2.531-6.091c1.56-1.56,3.698-2.531,6.091-2.531c1.873,0,3.604,0.584,5.045,1.585 c1.441,1.001,2.498,2.459,2.945,4.181h-3.536c-1.054,0-1.909,0.855-1.909,1.909"
            />
            <path
              fill="#ffffff"
              d="M23.5,12.151L23.5,12.151c0,1.054-0.855,1.909-1.909,1.909h-3.536c0.447-1.722,1.504-3.18,2.945-4.181 c1.441-1.001,3.172-1.585,5.045-1.585c2.393,0,4.531,0.971,6.091,2.531c1.56,1.56,2.531,3.698,2.531,6.091 c0,2.393-0.971,4.531-2.531,6.091c-1.56,1.56-3.698,2.531-6.091,2.531c-1.873,0-3.604-0.584-5.045-1.585 c-1.441-1.001-2.498-2.459-2.945-4.181h3.536c1.054,0,1.909-0.855,1.909-1.909"
            />
          </svg>
          Googleでログイン
        </button>
      )}
    </div>
  );
}; 