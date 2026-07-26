import React from 'react'
import AvatarUpload from '../../components/auth/AvatarUpload'
import useAuthStore from '../../store/authStore'

function ProfilePage() {
  const user = useAuthStore((state)=>state.user)
  console.log(user);
  return (
    <div className='flex flex-col items-center justify-between p-8 text-4xl'>
      
        <div>
            PROFILE
           
        </div>
        <h1 className='flex items-center justify-between text-2xl'> {user?.name}</h1>
        <AvatarUpload/>
      
    </div>
  )
}

export default ProfilePage
