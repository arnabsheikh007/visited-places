import React, { useEffect, useState } from 'react';
import UsersList from '../components/UsersList';
import ErrorModal from '../../Shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../Shared/components/UIElements/LoadingSpinner';
import react from 'react';
import { useHttpClient } from '../../Shared/Hooks/http-hook';

const Users = () => {
  const {isLoading,error,sendRequest,clearError} = useHttpClient();
  const [loadedUsers, setLodedUsers] = useState();

  useEffect(() => {
    const fetchUsers = async () =>{
      try{
        const responseData = await sendRequest('http://localhost:5000/api/users').then();
        setLodedUsers(responseData.users);        
      }catch(err){
        
      };      
    }
    fetchUsers();
  },[sendRequest]);
  
  return (
    <react.Fragment>
      <ErrorModal error={error} onClear={clearError } />
      { isLoading && 
        <div className='center'>
          <LoadingSpinner  />
        </div>
      }
      {!isLoading && loadedUsers && <UsersList item={loadedUsers}/>}
    </react.Fragment>
  );
};

export default Users;
