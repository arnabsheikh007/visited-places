import React , { useContext, useEffect,useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "../../Shared/Hooks/form-hook";

import Button from "../../Shared/components/FormElements/Button";
import Input from "../../Shared/components/FormElements/Input";
import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from "../../Shared/util/validators";

import './PlaceForm.css';
import Card from "../../Shared/components/UIElements/Card";
import { useHttpClient } from "../../Shared/Hooks/http-hook";
import LoadingSpinner from "../../Shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../Shared/components/UIElements/ErrorModal";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../Shared/context/auth-context";



const UpdatePlace = (props) =>{
    const auth = useContext(AuthContext);
    const {isLoading,error,sendRequest,clearError} = useHttpClient();
    const [loadedPlace,setLoadedPlace] = useState();
    const placeId = useParams().placeId;
    const history = useHistory();

    const [formState,inputHandler,setFormData] = useForm({
        title :{
            value : '',
            isValid : false
        },
        description : {
            value : '',
            isValid : false
        }
    },false);
    
    useEffect(() => {
         const fetchPlace = async() =>{
            try{
                const responseData = await sendRequest(`http://localhost:5000/api/places/${placeId}`);
                setLoadedPlace(responseData.place);
                setFormData({
                    title :{
                        value : responseData.place.title,
                        isValid : true
                    },
                    description : {
                        value : responseData.place.description,
                        isValid : true
                    }
                },true);
            }catch(err){

            }
         };
         fetchPlace();
    },[sendRequest,placeId,setFormData]);

    
    
    
    if(isLoading){
        return (
            <div className="center">
                <LoadingSpinner />
            </div>
        );
    }
    if(!loadedPlace && !error){
        return (
            <div className="center">
                <Card>
                    <h2>Couldn't Find Place </h2>
                </Card>
            </div>
        );
    }

    const placeUpdateSubmitHandler = async (event) => {
        event.preventDefault();
        try{
            await sendRequest(
                `http://localhost:5000/api/places/${placeId}`,
                'PATCH',
                JSON.stringify({
                    title : formState.inputs.title.value ,
                    description : formState.inputs.description.value
                }),
                {
                    'Content-Type' : 'application/json'
                }
            );
            history.push('/'+auth.userId+'/places');
        }catch(err){

        }
    }
    

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError}/>
            {!isLoading && loadedPlace &&
                <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
                    <Input 
                        id='title'
                        element='input' 
                        type='text' 
                        label='Title' 
                        validators = {[VALIDATOR_REQUIRE()]} 
                        errorText="Please Enter a valid Title." 
                        onInput={inputHandler} 
                        initialValue = {loadedPlace.title}
                        initialValid = {true}
                    />
                    <Input 
                        id ='description'
                        element='textarea' 
                        label='Description' 
                        validators = {[VALIDATOR_MINLENGTH(5)]} 
                        errorText="Please Enter a valid Description (At least 5 character)." 
                        onInput={inputHandler} 
                        initialValue = {loadedPlace.description}
                        initialValid = {true}
                    />
                    <Button type='submit' disabled={!formState.isValid}>Update Place</Button>
                </form>
            }
        </React.Fragment>
    );
}

export default UpdatePlace;