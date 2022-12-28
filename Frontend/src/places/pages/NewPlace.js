import React, { useContext } from 'react';

import './PlaceForm.css'
import Button from '../../Shared/components/FormElements/Button';
import Input from '../../Shared/components/FormElements/Input';

import { useForm } from '../../Shared/Hooks/form-hook';
import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../Shared/util/validators';
import { useHttpClient } from '../../Shared/Hooks/http-hook';
import { AuthContext } from '../../Shared/context/auth-context';
import react from 'react';
import ErrorModal from '../../Shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../Shared/components/UIElements/LoadingSpinner';
import { useHistory } from 'react-router-dom';
import ImageUpload from '../../Shared/components/FormElements/ImageUpload';



const NewPlace = () => {
  const auth = useContext(AuthContext);
  const {isLoading,error,sendRequest,clearError} = useHttpClient();
  const [formState,inputHandler] = useForm({
    title :{
      value : '',
      isValid: false
    },
    description :{
      value : '',
      isValid: false
    },
    address :{
      value : '',
      isValid: false
    }
  },false);

  const history = useHistory();

  const placeSubmitHandler = async (event) =>{
    event.preventDefault();
    try{
      const formData = new FormData();
      formData.append('title',formState.inputs.title.value);
      formData.append('description',formState.inputs.description.value);
      formData.append('address',formState.inputs.address.value);
      formData.append('creator',auth.userId);
      formData.append('image',formState.inputs.image.value);
      await sendRequest(
        'http://localhost:5000/api/places',
        'POST',
        formData
        );
    }catch(err){

    }
    history.push('/');
  }
  

  return (
    <react.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      { isLoading && 
        <LoadingSpinner asOverlay/>
      }
      <form className='place-form' onSubmit={placeSubmitHandler}>
        <Input 
          id='title'
          element='input' 
          type='text' 
          label='Title' 
          validators = {[VALIDATOR_REQUIRE()]} 
          errorText="Please Enter a valid Title." 
          onInput={inputHandler} />
        <Input 
          id ='description'
          element='textarea' 
          label='Description' 
          validators = {[VALIDATOR_MINLENGTH(6)]} 
          errorText="Please Enter a valid Description (At least 6 character)." 
          onInput={inputHandler} />
        <Input 
          id='address'
          element='input' 
          type='text' 
          label='Address' 
          validators = {[VALIDATOR_REQUIRE()]} 
          errorText="Please Enter a valid Address." 
          onInput={inputHandler} />
        <ImageUpload 
          id='image' 
          onInput={inputHandler} 
          errorText="Please Provide an image" 
        />
        <Button type='submit' disabled={!formState.isValid}>Add Place</Button>
      </form>
    </react.Fragment>
  );
};

export default NewPlace;