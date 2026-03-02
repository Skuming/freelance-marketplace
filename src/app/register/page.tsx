import React from "react";
import RegisterForm from "./RegisterForm";

const Register = () => {
  return (
    <div className="min-h-screen px-4 flex items-center justify-center">
      <div className="w-full max-w-md flex flex-col gap-4">
        <div className="text-center">
          <div className="text-2xl font-semibold">Freelancer.com</div>
          <div className="text-sm opacity-80">Создание аккаунта</div>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
