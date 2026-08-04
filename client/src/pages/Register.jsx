import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";


export default function Register(){

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const passwordRequirements = [
        {
            text:"8 characters minimum",
            valid: password.length >= 8
        },
        {
            text:"One uppercase letter",
            valid:/[A-Z]/.test(password)
        },
        {
            text:"One lowercase letter",
            valid:/[a-z]/.test(password)
        },
        {
            text:"One number",
            valid:/\d/.test(password)
        },
        {
            text:"One special character",
            valid:/[@$!%*?&]/.test(password)
        }
    ];



    const passwordValid = passwordRequirements.every(
        (req) => req.valid
    );

    const [confirmPassword, setConfirmPassword] = useState("");


    const handleRegister = async (e) => {

        e.preventDefault();

          if(password !== confirmPassword){

        setMessage("Passwords do not match");
        return;

    }

        try {

            await API.post("/auth/register", {
                username,
                email,
                password
            });


            setMessage("Account created! Redirecting...");


            setTimeout(() => {
                navigate("/login");
            }, 1000);


        } catch(error){

            setMessage(
                error.response?.data?.message ||
                "Registration failed"
            );

        }

    };


    return (

        <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">


            <form
                onSubmit={handleRegister}
                className="bg-white p-10 w-full max-w-md shadow-lg"
            >

                <h1 className="font-serif text-5xl mb-8 text-center">
                    Create Account
                </h1>


                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    autoComplete="username"
                    onChange={(e)=>setUsername(e.target.value)}
                    className="w-full border p-3 mb-4"
                    required
                />


                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    autoComplete="email"
                    onChange={(e)=>setEmail(e.target.value)}
                    className="w-full border p-3 mb-4"
                    required
                />


                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    autoComplete="new-password"
                    onChange={(e)=>setPassword(e.target.value)}
                    className="w-full border p-3 mb-6"
                    required
                />



                <div className="text-sm mt-2 mb-6">

                    {
                    passwordRequirements.map((req,index)=>(

                        <p key={index}>
                            {req.valid ? "✅" : "❌"} {req.text}
                        </p>

                    ))
                    }

                </div>

<input
    type="password"
    placeholder="Confirm Password"
    value={confirmPassword}
    autoComplete="new-password"
    onChange={(e)=>setConfirmPassword(e.target.value)}
    className="w-full border p-3 mb-4"
    required
/>

                <button
                    disabled={!passwordValid}
                    className="w-full bg-black text-white py-3 hover:bg-gray-800 transition disabled:opacity-40"
                >
                    Register
                </button>


                {message && (
                    <p className="mt-5 text-center">
                        {message}
                    </p>
                )}


            </form>


        </div>

    );

}