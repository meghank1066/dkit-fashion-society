import {useState} from "react";
import API from "../api/axios";


export default function ChangePassword(){

const [currentPassword,setCurrentPassword]=useState("");
const [newPassword,setNewPassword]=useState("");
const [message,setMessage]=useState("");


const submit = async(e)=>{

e.preventDefault();


try{

await API.put("/auth/change-password",{
currentPassword,
newPassword
});


setMessage("Password updated successfully");


}catch(error){

setMessage(
error.response?.data?.message ||
"Error changing password"
);

}

};



return (

<div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">

<form
onSubmit={submit}
className="bg-white p-10 shadow-lg"
>

<h1 className="font-serif text-4xl mb-6">
Change Password
</h1>


<input
type="password"
placeholder="Current password"
className="border p-3 mb-4 block"
onChange={(e)=>setCurrentPassword(e.target.value)}
/>


<input
type="password"
placeholder="New password"
className="border p-3 mb-4 block"
onChange={(e)=>setNewPassword(e.target.value)}
/>


<button className="bg-black text-white px-6 py-3">
Update
</button>


<p>{message}</p>


</form>

</div>

)

}