import LoginForm from "../../src/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(rgba(30,16,51,0.05)_1px,transparent_1px)] bg-neutral-50 p-4" style={{ backgroundSize: '24px 24px' }}>
      <LoginForm />
    </main>
  );
}