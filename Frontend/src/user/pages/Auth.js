import React, { useContext, useState } from "react";

import { useForm } from "../../Shared/Hooks/form-hook";

import Input from "../../Shared/components/FormElements/Input";
import Card from "../../Shared/components/UIElements/Card";
import ErrorModal from "../../Shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../Shared/components/UIElements/LoadingSpinner";
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from "../../Shared/util/validators";

import './Auth.css';
import Button from "../../Shared/components/FormElements/Button";
import { AuthContext } from "../../Shared/context/auth-context";
import { useHttpClient } from '../../Shared/Hooks/http-hook';
import ImageUpload from "../../Shared/components/FormElements/ImageUpload";

const Auth = () => {
    const auth = useContext(AuthContext);
    const [isLoginMode, setIsLoginMode] = useState(true);

    const {isLoading,error,sendRequest,clearError} = useHttpClient();
  
    const [formState, inputHandler, setFormData] = useForm(
      {
        email: {
          value: '',
          isValid: false
        },
        password: {
          value: '',
          isValid: false
        }
      },
      false
    );
  
    const switchModeHandler = () => {
      if (!isLoginMode) {
        setFormData(
          {
            ...formState.inputs,
            name: undefined,
            image : undefined
          },
          formState.inputs.email.isValid && formState.inputs.password.isValid
        );
      } else {
        setFormData(
          {
            ...formState.inputs,
            name: {
              value: '',
              isValid: false
            },
            image :{
              value : null,
              isValid : false
            }
          },
          false
        );
      }
      setIsLoginMode(prevMode => !prevMode);
    };
  
    const authSubmitHandler = async event => {
      event.preventDefault();

      console.log(formState.inputs);
      
      if(isLoginMode){
        try{
          const responseData = await sendRequest(
            'http://localhost:5000/api/users/login',
            'POST',
            JSON.stringify({
              email : formState.inputs.email.value,
              password : formState.inputs.password.value
            }), 
            {
              'Content-Type' : 'application/json'
            }
          );
          auth.login(responseData.user.id);

        }catch(err){

        }
      }
      else{
        try{
          const formData = new FormData();
          formData.append('email',formState.inputs.email.value);
          formData.append('name',formState.inputs.name.value);
          formData.append('password',formState.inputs.password.value);
          formData.append('image',formState.inputs.image.value);
          const responseData = await sendRequest(
            'http://localhost:5000/api/users/signup',
            'POST',
            formData
            );
            console.log("OK");
            auth.login(responseData.user.id);
          }catch(err){

        }
      }
      
    };
  
    return (
      <React.Fragment>
        <ErrorModal error={error} onClear={clearError}/>
        <Card className="authentication">
          {isLoading && <LoadingSpinner asOverlay={true} />}
          <h2>Login Required</h2>
          <hr />
          <form onSubmit={authSubmitHandler}>
            {!isLoginMode && (
              <Input
                element="input"
                id="name"
                type="text"
                label="Your Name"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Please enter a name."
                onInput={inputHandler}
              />
            )}
            <Input
              element="input"
              id="email"
              type="email"
              label="E-Mail"
              validators={[VALIDATOR_EMAIL()]}
              errorText="Please enter a valid email address."
              onInput={inputHandler}
            />
            <Input
              element="input"
              id="password"
              type="password"
              label="Password"
              validators={[VALIDATOR_MINLENGTH(6)]}
              errorText="Please enter a valid password, at least 6 characters."
              onInput={inputHandler}
            />
            {!isLoginMode &&
              <ImageUpload 
                id='image' 
                center onInput={inputHandler} 
                errorText="Please Provide an image"
              />
            }
            <Button type="submit" disabled={!formState.isValid}>
              {isLoginMode ? 'LOGIN' : 'SIGNUP'}
            </Button>
          </form>
          <Button inverse onClick={switchModeHandler}>
            SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
          </Button>
        </Card>
      </React.Fragment>
    );
  };
  
  export default Auth;
  