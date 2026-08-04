import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function Navbar(){

    const {user, logout} = useAuth();


    return (

        <nav className="p-6 flex justify-between">


            <Link to="/">
                DKIT Fashion Society
            </Link>


            <div className="flex gap-6">


                <Link to="/">
                    Home
                </Link>

 <Link to="/about">
        About
    </Link>

                <Link to="/posts">
                    Journal
                </Link>


                {
                    user && (

                        <Link to="/change-password">
                            Profile
                        </Link>

                    )
                }


                {
                    user?.role === "admin" && (

                        <Link to="/admin">
                            Dashboard
                        </Link>

                    )
                }


                {
                    user ? (

                        <button onClick={logout}>
                            Logout
                        </button>

                    ) : (

                        <>
                        <Link to="/login">
                            Login
                        </Link>

                        <Link to="/register">
                            Register
                        </Link>
                        </>

                    )
                }


            </div>


        </nav>

    );

}