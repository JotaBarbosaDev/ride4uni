"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password}),
        credentials: "include"
      });
      if (!res.ok) {
        const {message} = await res.json().catch(() => ({message: "Login failed"}));
        throw new Error(message || "Login failed");
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/50 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-xl border bg-background p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-center">Sign in</h1>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="w-full rounded-md border px-3 py-2" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required className="w-full rounded-md border px-3 py-2" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-md bg-black text-white py-2 font-medium hover:opacity-90">
          {loading ? "Signing in..." : "Login"}
        </button>
        <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account yet?{" "}
          <Link href="/register" className="font-medium text-black underline">
            Register
          </Link>
        </p>
      </form>

    </main>
  );
}
