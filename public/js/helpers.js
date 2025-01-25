import axios from "axios"
import { showAlert } from "./alert"

export const login =async (email,password)=>{
    try{
        const response =  await axios({
            method:"POST",
            url:"/api/v1/users/signin",
            data:{
                email,
                password
            }
        })
        if(response.data.status === "success"){
            showAlert('success','Logged in successfully')
            window.setTimeout(()=>{
                location.assign('/')
            },1500)
        }
    } catch(err){
        showAlert('error',err.response.data.message)
    }
}

export const logOut =async ()=>{
    try{
        const response =  await axios({
            method:"GET",
            url:"/api/v1/users/signout",
        })
        if(response.data.status === "success"){
            showAlert('success','Logged Out successfully')
            location.assign('/')
        }
    } catch(err){
        showAlert('error','Error logging out')
    }
}

export const updateSettings = async (data, type) => {
    try {
      const response = await axios({
        method: 'PATCH',
        url: `/api/v1/users/${type}`,
        data: data,
      });
      if (response.data.status === 'success') {
        window.setTimeout(()=>{
            showAlert('success','Settings saved')
        },1000)
      }
    } catch (err) {
      showAlert('error',err.response.data.message);
    }
  };

export const checkOut = async(id)=>{
    try {
        const response = await axios({
          method: 'GET',
          url: `/api/v1/bookings/checkout-session/${id}`,
        });
        if (response.data.status === 'success') {
          location.assign(`${response.data.data.url}`)
        }
      } catch (err) {
        showAlert('error',err.response.data.message);
      }
}
