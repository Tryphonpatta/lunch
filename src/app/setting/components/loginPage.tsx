"use client";

import { Button, Checkbox, Label, TextInput, Toast } from "flowbite-react";
import { useState } from "react";
import { createClient } from "../../../../util/supabase/client";
import { FaTelegramPlane } from "react-icons/fa";
import { HiFire } from "react-icons/hi";

export default function LoginPage({
  isLogin,
  setIsLogin,
}: {
  isLogin: boolean;
  setIsLogin: (a: boolean) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    // console.log(e.target[0].value, e.target[1].value);
    const { data: user, error } = await supabase
      .from("admin")
      .select("*")
      .eq("username", e.target[0].value)
      .eq("password", e.target[1].value);
    if (user && user.length > 0) {
      setIsLogin(true);
      // console.log("login success");
    } else {
      // console.log("login failed");
      setError("Login failed. Please check your username and password.");
    }
  };

  return (
    <div className="max-w-md ">
      <form
        className="flex w-full flex-col gap-4 mt-14"
        onSubmit={(e) => {
          handleSubmit(e);
        }}
      >
        <div className="w-full">
          <div className="mb-2 block">
            <Label htmlFor="email1" value="Your username" />
          </div>
          <TextInput id="email1" type="text" placeholder="username" required />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="password1" value="Your password" />
          </div>
          <TextInput
            id="password1"
            type="password"
            required
            placeholder="***"
          />
        </div>
        <Button type="submit">Submit</Button>
      </form>
      {error && (
        <div className=" w-full flex justify-center mt-2">
          <Toast className=" w-full">
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
              <HiFire className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">{error}</div>
            <Toast.Toggle />
          </Toast>
        </div>
      )}
    </div>
  );
}
